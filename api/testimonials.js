// Vercel serverless function: vouches from people who worked with Varakorn.
//   GET  /api/testimonials?page=/experience/... -> { testimonials }
//        (approved ones for everyone, plus the caller's own in any state)
//   POST /api/testimonials { page, relation, body } -> { ok, pending }
// One vouch per person per page; rewriting replaces it and re-moderates.
import { listTestimonials, saveTestimonial } from './_lib/store.js';
import { userFromRequest, requireUser } from './_lib/supauth.js';
import { readBody, getQuery, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const user = await userFromRequest(req).catch(() => null);
      const out = await listTestimonials(getQuery(req).page, user?.id);
      return sendJson(res, 200, out);
    }
    if (req.method === 'POST') {
      const user = await requireUser(req);
      const b = await readBody(req);
      const out = await saveTestimonial({
        page: b.page,
        relation: b.relation,
        body: b.body,
        user,
      });
      return sendJson(res, 200, out);
    }
    sendJson(res, 405, { error: 'GET or POST only' });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
