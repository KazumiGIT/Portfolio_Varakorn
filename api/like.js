// Vercel serverless function: toggle a like on an approved comment.
//   POST /api/like { comment } -> { liked, likes } (signed in only)
import { toggleLike } from './_lib/store.js';
import { requireUser } from './_lib/supauth.js';
import { readBody, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'POST only' });
    const user = await requireUser(req);
    const { comment } = await readBody(req);
    const out = await toggleLike(comment, user);
    sendJson(res, 200, out);
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
