// Guestbook + testimonials moderation CLI, on Supabase Postgres.
// Reads DATABASE_URL (and SUPABASE_DB_DIRECT_URL for setup) from .env.
//
//   node scripts/comments-db.mjs setup                 apply db/schema.sql (idempotent)
//   node scripts/comments-db.mjs recent [n]            newest words on the site (default 20)
//   node scripts/comments-db.mjs pending               anything currently hidden
//   node scripts/comments-db.mjs hide <id..>           take comments off the site, keep the row
//   node scripts/comments-db.mjs delete <id..>         remove comments for good
//   node scripts/comments-db.mjs approve <id..>        put hidden comments back up
//   node scripts/comments-db.mjs hide-t / delete-t / approve-t <id..>   the same, for vouches
//
// Nothing waits for approval: words publish as they are written, so this is
// the tool for taking something down after the fact.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// tiny .env loader so the script needs no extra dependency
try {
  for (const line of readFileSync(resolve(root, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env first.');
  process.exit(1);
}

const [cmd, ...args] = process.argv.slice(2);
const { listPending, listRecent, moderate, ensureSchema } = await import('../api/_lib/store.js');

const bar = (s) => s.replace(/\n/g, '\n  ');

if (cmd === 'setup') {
  // DDL goes over the direct/session connection; the transaction pooler
  // dislikes multi statement setup work.
  const { default: postgres } = await import('postgres');
  const url = process.env.SUPABASE_DB_DIRECT_URL || process.env.DATABASE_URL;
  const sql = postgres(url, { prepare: false, max: 1, ssl: 'require' });
  await ensureSchema(sql);
  // avatar bucket + its per user write policies
  try {
    await sql.unsafe(readFileSync(resolve(root, 'db/storage.sql'), 'utf8'));
    console.log('storage policies applied');
  } catch (e) {
    console.log('storage policies skipped:', e.message.split(/\r?\n/)[0]);
  }
  await sql.end();
  console.log('schema applied');
} else if (cmd === 'pending' || cmd === 'recent') {
  const { comments, testimonials } =
    cmd === 'recent' ? await listRecent(args[0]) : await listPending();
  if (!comments.length && !testimonials.length) {
    console.log(cmd === 'recent' ? 'nothing written yet' : 'nothing hidden');
  } else {
    const state = (r) => (r.approved === false ? '  [hidden]' : '');
    for (const r of comments) {
      const kind = r.parent_id ? `reply to #${r.parent_id}` : 'comment';
      console.log(`#${r.id}  ${kind}  ${r.page}  ${new Date(r.created_at).toLocaleString()}${state(r)}`);
      console.log(`  ${r.name}: ${bar(r.body)}\n`);
    }
    for (const r of testimonials) {
      console.log(`T#${r.id}  vouch  ${r.page}  ${new Date(r.created_at).toLocaleString()}${state(r)}`);
      console.log(`  ${r.name} (${r.relation}): ${bar(r.body)}\n`);
    }
    console.log(
      `${comments.length} comments, ${testimonials.length} vouches.\n` +
        'hide <id> / delete <id> for comments, hide-t <id> / delete-t <id> for vouches'
    );
  }
} else if (['approve', 'delete', 'hide', 'approve-t', 'delete-t', 'hide-t'].includes(cmd)) {
  if (!args.length) {
    console.error(`usage: node scripts/comments-db.mjs ${cmd} <id> [id...]`);
    process.exit(1);
  }
  const kind = cmd.endsWith('-t') ? 'testimonial' : 'comment';
  const action = cmd.startsWith('approve') ? 'approve' : cmd.startsWith('hide') ? 'hide' : 'delete';
  for (const id of args) {
    const ok = await moderate(kind, action, Number(id));
    const done = action === 'hide' ? 'hidden' : action + 'd';
    console.log(`${kind === 'testimonial' ? 'T#' : '#'}${id} ${ok ? done : 'not found'}`);
  }
} else {
  console.log(
    'commands: setup | recent [n] | pending | hide <id..> | delete <id..> | approve <id..>' +
      ' | hide-t <id..> | delete-t <id..> | approve-t <id..>'
  );
}

process.exit(0);
