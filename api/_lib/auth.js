// ---------------------------------------------------------------------------
// Sign in with Google + stateless sessions. The browser sends a Google ID
// token; we verify it against Google's tokeninfo endpoint, then issue our own
// HMAC-signed session cookie. Needs GOOGLE_CLIENT_ID and SESSION_SECRET.
// ---------------------------------------------------------------------------
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'vk_session';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

const err = (status, message) => Object.assign(new Error(message), { status });

export const authConfigured = (env = process.env) =>
  Boolean(env.GOOGLE_CLIENT_ID && env.SESSION_SECRET);

/* ---------- Google ID token ---------- */

/** Verify a Google Identity Services credential. Returns the profile. */
export async function verifyGoogleToken(credential, env = process.env) {
  if (!authConfigured(env)) throw err(503, 'sign in is not configured');
  if (typeof credential !== 'string' || !credential) throw err(400, 'missing credential');
  const r = await fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential)
  );
  const t = await r.json().catch(() => ({}));
  if (!r.ok || t.aud !== env.GOOGLE_CLIENT_ID || !t.sub) throw err(401, 'sign in was rejected');
  return {
    sub: t.sub,
    name: t.name || (t.email ? t.email.split('@')[0] : 'Guest'),
    email: t.email || null,
    picture: t.picture || null,
  };
}

/* ---------- session cookie ---------- */

const b64u = (buf) => Buffer.from(buf).toString('base64url');

const sign = (data, secret) => createHmac('sha256', secret).update(data).digest('base64url');

/** Build the Set-Cookie header value for a logged in user. */
export function sessionCookie(user, env = process.env) {
  const payload = b64u(
    JSON.stringify({
      uid: user.id,
      name: user.name,
      picture: user.picture || null,
      exp: Math.floor(Date.now() / 1000) + MAX_AGE,
    })
  );
  const value = payload + '.' + sign(payload, env.SESSION_SECRET);
  return `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

export const clearSessionCookie = () =>
  `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

/** Read and verify the session from a request. Null when absent or invalid. */
export function readSession(req, env = process.env) {
  if (!authConfigured(env)) return null;
  const cookies = String(req.headers?.cookie || '');
  const m = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [payload, mac] = m[1].split('.');
  if (!payload || !mac) return null;
  const expect = sign(payload, env.SESSION_SECRET);
  const a = Buffer.from(mac);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!s.uid || !s.exp || s.exp < Date.now() / 1000) return null;
    return { uid: s.uid, name: s.name, picture: s.picture || null };
  } catch {
    return null;
  }
}
