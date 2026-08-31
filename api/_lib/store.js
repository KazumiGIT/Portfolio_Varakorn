// ---------------------------------------------------------------------------
// The account era store: profiles, moderated comments with one reply level,
// likes, testimonials, hanko passport stamps, blog reading marks, and desk
// terminal chat history. Talks to Supabase Postgres (Singapore) through the
// transaction pooler; identity comes from api/_lib/supauth.js as a uuid.
// Used by the Vercel functions, the Vite dev middleware, and the moderation
// CLI (scripts/comments-db.mjs).
// ---------------------------------------------------------------------------
import { createHash } from 'node:crypto';
import { db } from './db.js';
import { experience, posts } from '../../src/js/data.js';

const BODY_MAX = 2000;
const RELATION_MAX = 80;
const RATE_WINDOW = '10 minutes';
const RATE_MAX = 5; // comments per user per window
const CHAT_KEEP = 60; // stored turns per user

/* Only pages that actually mount the guestbook. */
const PAGE_RE = /^\/(experience\/[a-z0-9-]{1,64}|blog#[a-z0-9-]{1,64})$/;

/* The passport: one stamp per experience chapter. Derived from data.js so a
   new chapter automatically becomes a collectable. */
const STAMPS = new Set(experience.filter((x) => x.page).map((x) => x.page));
const SLUGS = new Set(posts.map((p) => p.slug));
const EXP_PAGE_RE = /^\/experience\/[a-z0-9-]{1,64}$/;

/* strip control characters except newline and tab */
const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const err = (status, message) => Object.assign(new Error(message), { status });

const hashIp = (ip) =>
  createHash('sha256')
    .update('vk-guestbook:' + (ip || 'unknown'))
    .digest('hex')
    .slice(0, 32);

const clean = (v, max) =>
  String(v || '').replace(/\r\n/g, '\n').replace(CTRL_RE, '').trim().slice(0, max + 1);

/* ---------- schema self-heal (mirrors db/schema.sql) ---------- */

const DDL = [
  `create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null, picture text,
    created_at timestamptz not null default now())`,
  `alter table profiles enable row level security`,
  `create table if not exists comments (
    id bigint generated always as identity primary key,
    page text not null,
    user_id uuid not null references profiles(id) on delete cascade,
    parent_id bigint references comments(id) on delete cascade,
    body text not null, approved boolean not null default false,
    ip_hash text, created_at timestamptz not null default now())`,
  `alter table comments enable row level security`,
  `create index if not exists comments_page_idx on comments (page, approved, created_at desc)`,
  `create index if not exists comments_user_recent_idx on comments (user_id, created_at desc)`,
  `create table if not exists likes (
    comment_id bigint not null references comments(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (comment_id, user_id))`,
  `alter table likes enable row level security`,
  `create table if not exists testimonials (
    id bigint generated always as identity primary key,
    user_id uuid not null references profiles(id) on delete cascade,
    page text not null, relation text not null, body text not null,
    approved boolean not null default false,
    created_at timestamptz not null default now(),
    unique (user_id, page))`,
  `alter table testimonials enable row level security`,
  `create index if not exists testimonials_page_idx on testimonials (page, approved, created_at desc)`,
  `create table if not exists stamps (
    user_id uuid not null references profiles(id) on delete cascade,
    stamp text not null, created_at timestamptz not null default now(),
    primary key (user_id, stamp))`,
  `alter table stamps enable row level security`,
  `create table if not exists reading (
    user_id uuid not null references profiles(id) on delete cascade,
    slug text not null, created_at timestamptz not null default now(),
    primary key (user_id, slug))`,
  `alter table reading enable row level security`,
  `create table if not exists chats (
    id bigint generated always as identity primary key,
    user_id uuid not null references profiles(id) on delete cascade,
    role text not null check (role in ('user', 'model')),
    body text not null, created_at timestamptz not null default now())`,
  `alter table chats enable row level security`,
  `create index if not exists chats_user_idx on chats (user_id, created_at)`,
];

export async function ensureSchema(sql) {
  for (const stmt of DDL) await sql.unsafe(stmt);
}

const isMissingTable = (e) =>
  e?.code === '42P01' || /relation "\w+" does not exist/.test(e?.message || '');

async function withSchema(sql, fn) {
  try {
    return await fn();
  } catch (e) {
    if (!isMissingTable(e)) throw e;
    await ensureSchema(sql);
    return fn();
  }
}

function need(env) {
  const sql = db(env);
  if (!sql) throw err(503, 'database is not configured');
  return sql;
}

/* ---------- profiles ---------- */

/** Mirror a verified Supabase Auth user into profiles. Cheap upsert. */
export async function ensureProfile(user, env = process.env) {
  const sql = need(env);
  await withSchema(sql, () => sql`
    insert into profiles (id, name, picture)
    values (${user.id}, ${user.name}, ${user.picture})
    on conflict (id) do update
      set name = excluded.name, picture = excluded.picture`);
}

/* ---------- comments ---------- */

export async function listComments(page, viewerId, env = process.env) {
  const sql = db(env);
  if (!sql) return { offline: true };
  if (!PAGE_RE.test(String(page || ''))) throw err(400, 'unknown page');
  const viewer = viewerId || '00000000-0000-0000-0000-000000000000';
  const rows = await withSchema(sql, () => sql`
    select c.id, c.parent_id, c.body, c.created_at, p.name, p.picture,
      (select count(*)::int from likes l where l.comment_id = c.id) as likes,
      exists(select 1 from likes l where l.comment_id = c.id and l.user_id = ${viewer}) as liked
    from comments c
    join profiles p on p.id = c.user_id
    where c.page = ${page} and c.approved
    order by c.created_at asc
    limit 500`);

  const tops = [];
  const byId = new Map();
  for (const r of rows) {
    if (!r.parent_id) {
      byId.set(String(r.id), { ...r, replies: [] });
      tops.push(byId.get(String(r.id)));
    }
  }
  for (const r of rows) {
    if (r.parent_id) byId.get(String(r.parent_id))?.replies.push(r);
  }
  tops.reverse(); // newest thread first, replies stay oldest first
  return { comments: tops };
}

export async function createComment({ page, body, parent, user, ip }, env = process.env) {
  const sql = db(env);
  if (!sql) return { offline: true };
  if (!PAGE_RE.test(String(page || ''))) throw err(400, 'unknown page');

  const cleanBody = clean(body, BODY_MAX);
  if (!cleanBody || cleanBody.length > BODY_MAX)
    throw err(400, 'comment must be 1 to 2000 characters');

  await ensureProfile(user, env);
  return withSchema(sql, async () => {
    let parentId = null;
    if (parent != null) {
      const rows = await sql`
        select id from comments
        where id = ${Number(parent)} and page = ${page} and approved and parent_id is null`;
      if (!rows.length) throw err(400, 'that comment cannot be replied to');
      parentId = rows[0].id;
    }

    const [{ n }] = await sql`
      select count(*)::int as n from comments
      where user_id = ${user.id} and created_at > now() - ${RATE_WINDOW}::interval`;
    if (n >= RATE_MAX) throw err(429, 'too many comments, try again in a few minutes');

    await sql`
      insert into comments (page, user_id, parent_id, body, ip_hash)
      values (${page}, ${user.id}, ${parentId}, ${cleanBody}, ${hashIp(ip)})`;
    return { ok: true };
  });
}

/* ---------- likes ---------- */

export async function toggleLike(commentId, user, env = process.env) {
  const sql = db(env);
  if (!sql) return { offline: true };
  const cid = Number(commentId);
  if (!cid) throw err(400, 'unknown comment');

  await ensureProfile(user, env);
  return withSchema(sql, async () => {
    const target = await sql`select id from comments where id = ${cid} and approved`;
    if (!target.length) throw err(400, 'unknown comment');
    const removed = await sql`
      delete from likes where comment_id = ${cid} and user_id = ${user.id} returning 1`;
    if (!removed.length) {
      await sql`insert into likes (comment_id, user_id) values (${cid}, ${user.id})
                on conflict do nothing`;
    }
    const [{ n }] = await sql`select count(*)::int as n from likes where comment_id = ${cid}`;
    return { liked: !removed.length, likes: n };
  });
}

/* ---------- testimonials ---------- */

/** Approved vouches for one experience page, plus the viewer's own (any state). */
export async function listTestimonials(page, viewerId, env = process.env) {
  const sql = db(env);
  if (!sql) return { offline: true };
  if (!EXP_PAGE_RE.test(String(page || ''))) throw err(400, 'unknown page');
  const viewer = viewerId || '00000000-0000-0000-0000-000000000000';
  const rows = await withSchema(sql, () => sql`
    select t.id, t.relation, t.body, t.approved, t.created_at, p.name, p.picture,
           (t.user_id = ${viewer}) as mine
    from testimonials t
    join profiles p on p.id = t.user_id
    where t.page = ${page} and (t.approved or t.user_id = ${viewer})
    order by t.created_at desc
    limit 100`);
  return { testimonials: rows };
}

/** One vouch per person per page. Writing again replaces it and re-moderates. */
export async function saveTestimonial({ page, relation, body, user }, env = process.env) {
  const sql = db(env);
  if (!sql) return { offline: true };
  if (!EXP_PAGE_RE.test(String(page || ''))) throw err(400, 'unknown page');

  const cleanRelation = clean(relation, RELATION_MAX);
  const cleanBody = clean(body, BODY_MAX);
  if (!cleanRelation || cleanRelation.length > RELATION_MAX)
    throw err(400, 'say how you know Varakorn, in 80 characters or less');
  if (!cleanBody || cleanBody.length > BODY_MAX)
    throw err(400, 'the vouch must be 1 to 2000 characters');

  await ensureProfile(user, env);
  await withSchema(sql, () => sql`
    insert into testimonials (user_id, page, relation, body)
    values (${user.id}, ${page}, ${cleanRelation}, ${cleanBody})
    on conflict (user_id, page) do update
      set relation = excluded.relation, body = excluded.body,
          approved = false, created_at = now()`);
  return { ok: true, pending: true };
}

/* ---------- passport stamps + reading ---------- */

export async function addStamp(user, stamp, env = process.env) {
  const sql = db(env);
  if (!sql) return { offline: true };
  if (!STAMPS.has(String(stamp || ''))) throw err(400, 'unknown stamp');
  await ensureProfile(user, env);
  await withSchema(sql, () => sql`
    insert into stamps (user_id, stamp) values (${user.id}, ${stamp})
    on conflict do nothing`);
  return { ok: true };
}

export async function markRead(user, slug, env = process.env) {
  const sql = db(env);
  if (!sql) return { offline: true };
  if (!SLUGS.has(String(slug || ''))) throw err(400, 'unknown note');
  await ensureProfile(user, env);
  await withSchema(sql, () => sql`
    insert into reading (user_id, slug) values (${user.id}, ${slug})
    on conflict do nothing`);
  return { ok: true };
}

/* ---------- the account page, in one round trip ---------- */

export async function accountSummary(user, env = process.env) {
  const sql = db(env);
  if (!sql) return { offline: true };
  return withSchema(sql, async () => {
    // one round trip instead of five: the profile upsert and all four reads
    // fly together, which matters when the function is an ocean from the db
    const [, stamps, reading, comments, testimonials] = await Promise.all([
      ensureProfile(user, env),
      sql`select stamp, created_at from stamps where user_id = ${user.id}`,
      sql`select slug, created_at from reading where user_id = ${user.id}`,
      sql`select id, page, body, approved, created_at
          from comments where user_id = ${user.id}
          order by created_at desc limit 100`,
      sql`select id, page, relation, body, approved, created_at
          from testimonials where user_id = ${user.id}
          order by created_at desc`,
    ]);
    return {
      user: { name: user.name, email: user.email, picture: user.picture },
      stamps: stamps.map((s) => s.stamp),
      allStamps: [...STAMPS],
      read: reading.map((r) => r.slug),
      totalNotes: SLUGS.size,
      comments,
      testimonials,
    };
  });
}

/** A user deleting their own comment or testimonial from the account page. */
export async function deleteOwn(kind, id, user, env = process.env) {
  const sql = need(env);
  const table = kind === 'testimonial' ? 'testimonials' : 'comments';
  const rows = await withSchema(sql, () =>
    sql`delete from ${sql(table)} where id = ${Number(id)} and user_id = ${user.id} returning id`
  );
  if (!rows.length) throw err(404, 'not yours or already gone');
  return { ok: true };
}

/* ---------- desk terminal history + gate ---------- */


export async function chatHistory(user, env = process.env) {
  const sql = db(env);
  if (!sql) return { history: [] };
  const rows = await withSchema(sql, () => sql`
    select role, body from chats
    where user_id = ${user.id}
    order by created_at asc, id asc
    limit ${CHAT_KEEP}`);
  return { history: rows.map((r) => ({ role: r.role, text: r.body })) };
}

export async function appendChat(user, userText, modelText, env = process.env) {
  const sql = db(env);
  if (!sql) return;
  await ensureProfile(user, env);
  await withSchema(sql, async () => {
    await sql`insert into chats (user_id, role, body)
              values (${user.id}, 'user', ${clean(userText, 600)}),
                     (${user.id}, 'model', ${clean(modelText, 2000)})`;
    // keep the tail, drop the ancient
    await sql`delete from chats where user_id = ${user.id} and id not in
              (select id from chats where user_id = ${user.id}
               order by created_at desc, id desc limit ${CHAT_KEEP})`;
  });
}

/* ---------- moderation (CLI only, never exposed over HTTP) ---------- */

export async function listPending(env = process.env) {
  const sql = need(env);
  return withSchema(sql, async () => {
    const comments = await sql`
      select c.id, c.page, c.parent_id, c.body, c.created_at, p.name
      from comments c join profiles p on p.id = c.user_id
      where not c.approved order by c.created_at asc`;
    const testimonials = await sql`
      select t.id, t.page, t.relation, t.body, t.created_at, p.name
      from testimonials t join profiles p on p.id = t.user_id
      where not t.approved order by t.created_at asc`;
    return { comments, testimonials };
  });
}

export async function moderate(kind, action, id, env = process.env) {
  const sql = need(env);
  const table = kind === 'testimonial' ? 'testimonials' : 'comments';
  const rows =
    action === 'approve'
      ? await sql`update ${sql(table)} set approved = true where id = ${Number(id)} returning id`
      : await sql`delete from ${sql(table)} where id = ${Number(id)} returning id`;
  return rows.length > 0;
}
