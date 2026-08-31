// Vercel serverless function: the guestbook wall on the home page.
//   GET /api/wall -> { items } (approved vouches + comments, newest first)
// Public and cacheable: the edge holds it for two minutes so the home page
// never waits on the database twice in a row.
import { wallItems } from './_lib/store.js';
import { sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'GET only' });
    res.setHeader('cache-control', 'public, s-maxage=120, stale-while-revalidate=600');
    sendJson(res, 200, await wallItems());
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
