// Vercel serverless function: the public guestbook API.
//   GET  /api/comments?page=/experience/hygr-content-creator -> { comments }
//   POST /api/comments { page, name, body, website, elapsed } -> { ok }
// Notes land unapproved; moderation happens through scripts/comments-db.mjs,
// never over HTTP. DATABASE_URL lives in the environment.
import { listComments, createComment } from './_lib/guestbook.js';

const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim() || req.socket?.remoteAddress;

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const out = await listComments(req.query?.page);
      res.status(200).json(out);
      return;
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      const out = await createComment({
        page: b.page,
        name: b.name,
        body: b.body,
        website: b.website,
        elapsed: b.elapsed,
        ip: clientIp(req),
      });
      res.status(200).json(out);
      return;
    }
    res.status(405).json({ error: 'GET or POST only' });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'error' });
  }
}
