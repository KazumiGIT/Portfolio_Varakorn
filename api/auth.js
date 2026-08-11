// Vercel serverless function: sessions for the guestbook.
//   GET    /api/auth                 -> { user } (null when signed out)
//   POST   /api/auth { credential }  -> verify Google ID token, set cookie
//   DELETE /api/auth                 -> sign out
import {
  authConfigured,
  verifyGoogleToken,
  sessionCookie,
  clearSessionCookie,
  readSession,
} from './_lib/auth.js';
import { upsertUser } from './_lib/guestbook.js';
import { readBody, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (!authConfigured()) return sendJson(res, 200, { user: null, offline: true });
      const s = readSession(req);
      return sendJson(res, 200, { user: s ? { name: s.name, picture: s.picture } : null });
    }
    if (req.method === 'POST') {
      const { credential } = await readBody(req);
      const profile = await verifyGoogleToken(credential);
      const user = await upsertUser(profile);
      res.setHeader('set-cookie', sessionCookie(user));
      return sendJson(res, 200, { user: { name: user.name, picture: user.picture } });
    }
    if (req.method === 'DELETE') {
      res.setHeader('set-cookie', clearSessionCookie());
      return sendJson(res, 200, { user: null });
    }
    sendJson(res, 405, { error: 'GET, POST, or DELETE only' });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
