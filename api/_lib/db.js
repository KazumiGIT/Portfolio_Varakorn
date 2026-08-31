// ---------------------------------------------------------------------------
// One Postgres client for the whole store, pointed at Supabase's transaction
// pooler (port 6543). prepare:false because transaction mode cannot hold
// prepared statements; max:1 because each serverless invocation is one lane.
// ---------------------------------------------------------------------------
import postgres from 'postgres';

let client = null;
let clientUrl = null;

export function db(env = process.env) {
  const url = env.DATABASE_URL;
  if (!url) return null;
  if (!client || clientUrl !== url) {
    client = postgres(url, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require',
    });
    clientUrl = url;
  }
  return client;
}
