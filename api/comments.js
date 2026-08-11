// Vercel serverless function: the public guestbook API.
//   GET  /api/comments?page=/experience/... -> { comments } (threads + likes)
//   POST /api/comments { page, body, parent? } -> { ok } (signed in only)
// Comments land unapproved; moderation happens through scripts/comments-db.mjs.
import { listComments, createComment } from './_lib/guestbook.js';
import { readSession } from './_lib/auth.js';
import { readBody, getQuery, sendJson, clientIp } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    const session = readSession(req);
    if (req.method === 'GET') {
      const out = await listComments(getQuery(req).page, session?.uid);
      return sendJson(res, 200, out);
    }
    if (req.method === 'POST') {
      const b = await readBody(req);
      const out = await createComment({
        page: b.page,
        body: b.body,
        parent: b.parent,
        uid: session?.uid,
        ip: clientIp(req),
      });
      return sendJson(res, 200, out);
    }
    sendJson(res, 405, { error: 'GET or POST only' });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
