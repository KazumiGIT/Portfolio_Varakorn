// Vercel serverless function: everything about the signed in visitor.
//   GET    /api/me                         -> profile, stamps, reading, own posts
//   POST   /api/me { stamp }               -> collect a passport stamp
//   POST   /api/me { read }                -> mark a blog note finished
//   POST   /api/me { sync: true }          -> re-mirror name/photo into profiles
//   POST   /api/me { remove: {kind, id} }  -> delete own comment or testimonial
//   DELETE /api/me                         -> delete the whole account, cascade
import {
  accountSummary,
  addStamp,
  markRead,
  deleteOwn,
  ensureProfile,
} from './_lib/store.js';
import { requireUser, deleteAuthUser } from './_lib/supauth.js';
import { readBody, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    const user = await requireUser(req);

    if (req.method === 'GET') {
      return sendJson(res, 200, await accountSummary(user));
    }
    if (req.method === 'POST') {
      const b = await readBody(req);
      if (b.sync) {
        // the client just changed the name or photo on the auth user; copy it
        // onto profiles so existing comments show the new one
        await ensureProfile(user);
        return sendJson(res, 200, { ok: true, user: { name: user.name, picture: user.picture } });
      }
      if (b.stamp) return sendJson(res, 200, await addStamp(user, b.stamp));
      if (b.read) return sendJson(res, 200, await markRead(user, b.read));
      if (b.remove)
        return sendJson(res, 200, await deleteOwn(b.remove.kind, b.remove.id, user));
      return sendJson(res, 400, { error: 'nothing to do' });
    }
    if (req.method === 'DELETE') {
      await deleteAuthUser(user.id);
      return sendJson(res, 200, { ok: true });
    }
    sendJson(res, 405, { error: 'GET, POST, or DELETE only' });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
