// One-off migration to the accounts guestbook (Aug 2026): drops the OLD
// anonymous comments table (only if it is empty) so setup can create the new
// users/comments/likes schema. Safe to delete after running once.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const line of readFileSync(resolve(root, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}

const db = neon(process.env.DATABASE_URL);

const hasUserId = await db.query(
  `select 1 from information_schema.columns
   where table_name = 'comments' and column_name = 'user_id'`
);
if (hasUserId.length) {
  console.log('comments table already has the new shape, nothing to do');
  process.exit(0);
}

const [{ n }] = await db.query('select count(*)::int as n from comments');
if (n > 0) {
  console.error(`old comments table has ${n} rows, refusing to drop it`);
  process.exit(1);
}

await db.query('drop table if exists comments cascade');
console.log('empty old comments table dropped; now run: npm run comments setup');
