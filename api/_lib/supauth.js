// ---------------------------------------------------------------------------
// Who is calling? Supabase Auth owns identity now. The browser holds a
// Supabase session and sends its access token as a Bearer header; we hand
// that token back to Supabase to verify, then mirror the user into profiles.
// No cookies of our own, no secrets in the browser.
// ---------------------------------------------------------------------------

const err = (status, message) => Object.assign(new Error(message), { status });

export const authConfigured = (env = process.env) =>
  Boolean(env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY);

/** The Bearer token from a request, or null. */
export function bearerToken(req) {
  const m = /^Bearer\s+(.+)$/i.exec(String(req.headers?.authorization || ''));
  return m ? m[1] : null;
}

/**
 * Verify the caller's Supabase access token. Returns the user
 * { id, email, name, picture } or null when no token was sent.
 * Throws 401 when a token was sent but is expired or fake.
 */
export async function userFromRequest(req, env = process.env) {
  const token = bearerToken(req);
  if (!token) return null;
  if (!authConfigured(env)) throw err(503, 'sign in is not configured');

  const r = await fetch(env.SUPABASE_URL + '/auth/v1/user', {
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      authorization: 'Bearer ' + token,
    },
  });
  if (!r.ok) throw err(401, 'session expired, sign in again');
  const u = await r.json();
  if (!u?.id) throw err(401, 'session expired, sign in again');

  const md = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email || null,
    name:
      String(md.full_name || md.name || '').trim() ||
      (u.email ? u.email.split('@')[0] : 'Guest'),
    picture: md.avatar_url || md.picture || null,
  };
}

/** Like userFromRequest, but a missing token is a 401 too. */
export async function requireUser(req, env = process.env) {
  const user = await userFromRequest(req, env);
  if (!user) throw err(401, 'sign in first');
  return user;
}

/**
 * Permanently delete a Supabase Auth user (admin API, secret key).
 * The profiles cascade wipes comments, likes, stamps, reading and chats.
 */
export async function deleteAuthUser(userId, env = process.env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY)
    throw err(503, 'account deletion is not configured');
  const r = await fetch(env.SUPABASE_URL + '/auth/v1/admin/users/' + userId, {
    method: 'DELETE',
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      authorization: 'Bearer ' + env.SUPABASE_SECRET_KEY,
    },
  });
  if (!r.ok && r.status !== 404) throw err(502, 'could not delete the account');
}
