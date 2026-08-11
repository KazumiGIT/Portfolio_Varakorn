// ---------------------------------------------------------------------------
// Guestbook store: Google-authed comments, one level of replies, likes.
// Used by the Vercel functions, the Vite dev middleware, and the moderation
// CLI. Talks to Neon Postgres over HTTP; DATABASE_URL stays server side.
// ---------------------------------------------------------------------------
import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';

const BODY_MAX = 2000;
const RATE_WINDOW = '10 minutes';
const RATE_MAX = 5; // comments per user per window

/* Only pages that actually mount the guestbook. */
const PAGE_RE = /^\/(experience\/[a-z0-9-]{1,64}|blog#[a-z0-9-]{1,64})$/;

/* strip control characters except newline and tab */
const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const err = (status, message) => Object.assign(new Error(message), { status });

function sql(env = process.env) {
  const url = env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

const hashIp = (ip) =>
  createHash('sha256')
    .update('vk-guestbook:' + (ip || 'unknown'))
    .digest('hex')
    .slice(0, 32);

/* Self-heal: create the tables on a fresh database. Mirrors db/schema.sql. */
async function ensureSchema(db) {
  await db.query(`create table if not exists users (
    id         bigint generated always as identity primary key,
    google_sub text        not null unique,
    name       text        not null,
    email      text,
    picture    text,
    created_at timestamptz not null default now()
  )`);
  await db.query(`create table if not exists comments (
    id         bigint generated always as identity primary key,
    page       text        not null,
    user_id    bigint      not null references users(id) on delete cascade,
    parent_id  bigint      references comments(id) on delete cascade,
    body       text        not null,
    approved   boolean     not null default false,
    ip_hash    text,
    created_at timestamptz not null default now()
  )`);
  await db.query(
    'create index if not exists comments_page_idx on comments (page, approved, created_at desc)'
  );
  await db.query(
    'create index if not exists comments_user_recent_idx on comments (user_id, created_at desc)'
  );
  await db.query(`create table if not exists likes (
    comment_id bigint      not null references comments(id) on delete cascade,
    user_id    bigint      not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (comment_id, user_id)
  )`);
}

const isMissingTable = (e) =>
  e?.code === '42P01' || /relation "\w+" does not exist/.test(e?.message || '');

async function withSchema(db, fn) {
  try {
    return await fn();
  } catch (e) {
    if (!isMissingTable(e)) throw e;
    await ensureSchema(db);
    return fn();
  }
}

/* ---------- users ---------- */

/** Create or refresh a user from a verified Google profile. Returns the row. */
export async function upsertUser({ sub, name, email, picture }, env = process.env) {
  const db = sql(env);
  if (!db) throw err(503, 'database is not configured');
  const rows = await withSchema(db, () => db`
    insert into users (google_sub, name, email, picture)
    values (${sub}, ${name}, ${email}, ${picture})
    on conflict (google_sub) do update
      set name = excluded.name, email = excluded.email, picture = excluded.picture
    returning id, name, picture`);
  return rows[0];
}

/* ---------- comments ---------- */

/**
 * Approved comments for one page: top level newest first, replies oldest
 * first nested under their parent. uid marks the viewer's own likes.
 */
export async function listComments(page, uid, env = process.env) {
  const db = sql(env);
  if (!db) return { offline: true };
  if (!PAGE_RE.test(String(page || ''))) throw err(400, 'unknown page');
  const viewer = Number(uid) || -1;
  const rows = await withSchema(db, () => db`
    select c.id, c.parent_id, c.body, c.created_at, u.name, u.picture,
      (select count(*)::int from likes l where l.comment_id = c.id) as likes,
      exists(select 1 from likes l where l.comment_id = c.id and l.user_id = ${viewer}) as liked
    from comments c
    join users u on u.id = c.user_id
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

/** Insert a comment or reply, unapproved. Requires a signed in user. */
export async function createComment({ page, body, parent, uid, ip }, env = process.env) {
  const db = sql(env);
  if (!db) return { offline: true };
  if (!Number(uid)) throw err(401, 'sign in to comment');
  if (!PAGE_RE.test(String(page || ''))) throw err(400, 'unknown page');

  const cleanBody = String(body || '').replace(/\r\n/g, '\n').replace(CTRL_RE, '').trim();
  if (!cleanBody || cleanBody.length > BODY_MAX)
    throw err(400, 'comment must be 1 to 2000 characters');

  return withSchema(db, async () => {
    let parentId = null;
    if (parent != null) {
      const rows = await db`
        select id from comments
        where id = ${Number(parent)} and page = ${page} and approved and parent_id is null`;
      if (!rows.length) throw err(400, 'that comment cannot be replied to');
      parentId = rows[0].id;
    }

    const [{ n }] = await db`
      select count(*)::int as n from comments
      where user_id = ${Number(uid)} and created_at > now() - ${RATE_WINDOW}::interval`;
    if (n >= RATE_MAX) throw err(429, 'too many comments, try again in a few minutes');

    await db`
      insert into comments (page, user_id, parent_id, body, ip_hash)
      values (${page}, ${Number(uid)}, ${parentId}, ${cleanBody}, ${hashIp(ip)})`;
    return { ok: true };
  });
}

/* ---------- likes ---------- */

/** Toggle the viewer's like on an approved comment. */
export async function toggleLike(commentId, uid, env = process.env) {
  const db = sql(env);
  if (!db) return { offline: true };
  if (!Number(uid)) throw err(401, 'sign in to like');
  const cid = Number(commentId);
  if (!cid) throw err(400, 'unknown comment');

  return withSchema(db, async () => {
    const target = await db`select id from comments where id = ${cid} and approved`;
    if (!target.length) throw err(400, 'unknown comment');
    const removed = await db`
      delete from likes where comment_id = ${cid} and user_id = ${Number(uid)} returning 1`;
    if (!removed.length) {
      await db`insert into likes (comment_id, user_id) values (${cid}, ${Number(uid)})
               on conflict do nothing`;
    }
    const [{ n }] = await db`select count(*)::int as n from likes where comment_id = ${cid}`;
    return { liked: !removed.length, likes: n };
  });
}

/* ---------- moderation (CLI only, never exposed over HTTP) ---------- */

export async function listPending(env = process.env) {
  const db = sql(env);
  if (!db) throw err(500, 'DATABASE_URL is not set');
  return withSchema(db, () => db`
    select c.id, c.page, c.parent_id, c.body, c.created_at, u.name, u.email
    from comments c join users u on u.id = c.user_id
    where not c.approved
    order by c.created_at asc`);
}

export async function approveComment(id, env = process.env) {
  const db = sql(env);
  if (!db) throw err(500, 'DATABASE_URL is not set');
  const rows = await db`update comments set approved = true where id = ${id} returning id`;
  return rows.length > 0;
}

export async function deleteComment(id, env = process.env) {
  const db = sql(env);
  if (!db) throw err(500, 'DATABASE_URL is not set');
  const rows = await db`delete from comments where id = ${id} returning id`;
  return rows.length > 0;
}
