// ---------------------------------------------------------------------------
// Shared guestbook store used by the Vercel function (api/comments.js), the
// Vite dev middleware, and the moderation CLI. Talks to Neon Postgres over
// HTTP; the connection string stays server side in DATABASE_URL.
// ---------------------------------------------------------------------------
import { neon } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';

const NAME_MAX = 60;
const BODY_MAX = 2000;
const RATE_WINDOW = '10 minutes';
const RATE_MAX = 5; // notes per ip per window
const MIN_FILL_MS = 3000; // faster than a human can type -> bot

/* Only pages that actually mount the guestbook. Keeps the table from being
   sprayed with junk keys. */
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

/** Approved notes for one page, newest first. { offline: true } without a DB. */
export async function listComments(page, env = process.env) {
  const db = sql(env);
  if (!db) return { offline: true };
  if (!PAGE_RE.test(String(page || ''))) throw err(400, 'unknown page');
  const rows = await db`
    select id, name, body, created_at
    from comments
    where page = ${page} and approved
    order by created_at desc
    limit 200`;
  return { comments: rows };
}

/**
 * Insert a note, unapproved. Returns { ok: true } or { offline: true }.
 * Honeypot or too-fast submissions get a silent { ok: true } so bots
 * cannot tell they were dropped. Throws Error with .status otherwise.
 */
export async function createComment({ page, name, body, website, elapsed, ip }, env = process.env) {
  const db = sql(env);
  if (!db) return { offline: true };

  if (!PAGE_RE.test(String(page || ''))) throw err(400, 'unknown page');

  const cleanName = String(name || '').replace(CTRL_RE, '').replace(/\s+/g, ' ').trim();
  const cleanBody = String(body || '').replace(/\r\n/g, '\n').replace(CTRL_RE, '').trim();

  if (!cleanName || cleanName.length > NAME_MAX) throw err(400, 'name must be 1 to 60 characters');
  if (!cleanBody || cleanBody.length > BODY_MAX)
    throw err(400, 'note must be 1 to 2000 characters');

  // spam guards: honeypot filled or the form was submitted inhumanly fast
  if (String(website || '').trim() !== '') return { ok: true };
  if (!Number.isFinite(+elapsed) || +elapsed < MIN_FILL_MS) return { ok: true };

  const ipHash = hashIp(ip);
  const [{ n }] = await db`
    select count(*)::int as n from comments
    where ip_hash = ${ipHash} and created_at > now() - ${RATE_WINDOW}::interval`;
  if (n >= RATE_MAX) throw err(429, 'too many notes, try again in a few minutes');

  await db`
    insert into comments (page, name, body, ip_hash)
    values (${page}, ${cleanName}, ${cleanBody}, ${ipHash})`;
  return { ok: true };
}

/* ---------- moderation (CLI only, never exposed over HTTP) ---------- */

export async function listPending(env = process.env) {
  const db = sql(env);
  if (!db) throw err(500, 'DATABASE_URL is not set');
  return db`
    select id, page, name, body, created_at
    from comments
    where not approved
    order by created_at asc`;
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
