// Guestbook database CLI. Reads DATABASE_URL from .env (or the environment).
//
//   node scripts/comments-db.mjs setup           apply db/schema.sql (idempotent)
//   node scripts/comments-db.mjs pending         list notes waiting for approval
//   node scripts/comments-db.mjs approve <id..>  publish notes
//   node scripts/comments-db.mjs delete <id..>   remove notes
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

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
const { listPending, approveComment, deleteComment } = await import(
  '../api/_lib/guestbook.js'
);

if (cmd === 'setup') {
  const db = neon(process.env.DATABASE_URL);
  const schema = readFileSync(resolve(root, 'db/schema.sql'), 'utf8');
  for (const stmt of schema.split(';').map((s) => s.trim()).filter(Boolean)) {
    await db.query(stmt);
  }
  console.log('schema applied');
} else if (cmd === 'pending') {
  const rows = await listPending();
  if (!rows.length) {
    console.log('nothing pending');
  } else {
    for (const r of rows) {
      console.log(`#${r.id}  ${r.page}  ${new Date(r.created_at).toLocaleString()}`);
      console.log(`  ${r.name}: ${r.body.replace(/\n/g, '\n  ')}\n`);
    }
    console.log(`${rows.length} pending. Approve with: node scripts/comments-db.mjs approve <id>`);
  }
} else if (cmd === 'approve' || cmd === 'delete') {
  if (!args.length) {
    console.error(`usage: node scripts/comments-db.mjs ${cmd} <id> [id...]`);
    process.exit(1);
  }
  const act = cmd === 'approve' ? approveComment : deleteComment;
  for (const id of args) {
    const ok = await act(Number(id));
    console.log(`#${id} ${ok ? cmd + 'd' : 'not found'}`);
  }
} else {
  console.log('commands: setup | pending | approve <id..> | delete <id..>');
}
