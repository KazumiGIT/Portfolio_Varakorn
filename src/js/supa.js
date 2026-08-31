// ---------------------------------------------------------------------------
// The one Supabase client for the whole front end. Auth only: data still
// flows through our own /api endpoints, which verify the access token server
// side. The url and publishable key are baked in at build time by vite
// define; both are public by design.
// ---------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';

const URL = typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '';
const KEY = typeof __SUPABASE_PUBLISHABLE_KEY__ !== 'undefined' ? __SUPABASE_PUBLISHABLE_KEY__ : '';

export const authConfigured = Boolean(URL && KEY);

/* Sessions must survive everything short of a deliberate sign out: the tab
   closing, the browser restarting, a week away. persistSession keeps the
   refresh token in localStorage, autoRefreshToken renews the hourly access
   token, and Supabase refresh tokens themselves do not expire. These are the
   defaults, pinned here so nobody "cleans them up" later. */
export const supa = authConfigured
  ? createClient(URL, KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** The live session, or null. */
export async function getSession() {
  if (!supa) return null;
  const { data } = await supa.auth.getSession();
  return data?.session || null;
}

/** Session -> the display shape the UI cares about. */
export function userOf(session) {
  const u = session?.user;
  if (!u) return null;
  const md = u.user_metadata || {};
  return {
    name:
      String(md.full_name || md.name || '').trim() ||
      (u.email ? u.email.split('@')[0] : 'Guest'),
    picture: md.avatar_url || md.picture || null,
    email: u.email || null,
  };
}

/**
 * Subscribe to auth changes. Fires once immediately with the current
 * session, then on every change. Returns an unsubscribe function.
 */
export function onAuth(cb) {
  if (!supa) {
    cb(null);
    return () => {};
  }
  getSession().then((s) => cb(s));
  const { data } = supa.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data?.subscription?.unsubscribe();
}

/** fetch with the caller's access token attached, when signed in. */
export async function authedFetch(url, opts = {}) {
  const session = await getSession();
  const headers = { ...(opts.headers || {}) };
  if (session?.access_token) headers.authorization = 'Bearer ' + session.access_token;
  return fetch(url, { ...opts, headers });
}

export async function signOut() {
  if (supa) await supa.auth.signOut();
}
