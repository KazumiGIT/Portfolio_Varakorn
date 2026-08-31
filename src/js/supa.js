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

/* "Remember me", meant literally. Checked (the default) puts the session in
   localStorage, so it survives the browser closing and the refresh token
   never expires. Unchecked puts it in sessionStorage instead, which the
   browser throws away when the tab closes: the right behaviour on a shared
   or borrowed computer. The flag itself lives in localStorage because the
   choice has to outlive the session it describes. */
const REMEMBER_KEY = 'vk-remember';

export function setRemember(on) {
  try {
    localStorage.setItem(REMEMBER_KEY, on ? '1' : '0');
  } catch {}
}

export function remembering() {
  try {
    return localStorage.getItem(REMEMBER_KEY) !== '0';
  } catch {
    return true;
  }
}

/* Storage can throw outright in private modes and embedded webviews, so every
   touch is guarded and a failure degrades to "signed out", never to a crash. */
const dualStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      if (remembering()) {
        sessionStorage.removeItem(key);
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
        sessionStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {}
  },
};

/* persistSession + autoRefreshToken are pinned so nobody "cleans them up"
   later; the storage adapter above decides how long persist means. */
export const supa = authConfigured
  ? createClient(URL, KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: dualStorage,
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
