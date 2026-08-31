// Vercel serverless function: the public guestbook API.
//   GET  /api/comments?page=/experience/... -> { comments } (threads + likes)
//   POST /api/comments { page, body, parent? } -> { ok } (signed in only)
// Identity is a Supabase Auth access token in the Authorization header.
// Comments land unapproved; moderation happens through scripts/comments-db.mjs.
import { listComments, createComment } from './_lib/store.js';
import { userFromRequest, requireUser } from './_lib/supauth.js';
import { readBody, getQuery, sendJson, clientIp } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const user = await userFromRequest(req).catch(() => null);
      const out = await listComments(getQuery(req).page, user?.id);
      return sendJson(res, 200, out);
    }
    if (req.method === 'POST') {
      const user = await requireUser(req);
      const b = await readBody(req);
      const out = await createComment({
        page: b.page,
        body: b.body,
        parent: b.parent,
        user,
        ip: clientIp(req),
      });
      return sendJson(res, 200, out);
    }
    sendJson(res, 405, { error: 'GET or POST only' });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
