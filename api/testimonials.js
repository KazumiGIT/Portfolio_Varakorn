// Vercel serverless function: vouches from people who worked with Varakorn.
//   GET  /api/testimonials?page=/experience/... -> { testimonials, admin }
//        (everything showing, plus the caller's own, plus all of it for the owner)
//   POST /api/testimonials { page, relation, body } -> { ok }
// One vouch per person per page; rewriting replaces the words in place.
import { listTestimonials, saveTestimonial } from './_lib/store.js';
import { userFromRequest, requireUser, isAdmin } from './_lib/supauth.js';
import { readBody, getQuery, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const user = await userFromRequest(req).catch(() => null);
      const admin = isAdmin(user);
      const out = await listTestimonials(getQuery(req).page, user?.id, { admin });
      return sendJson(res, 200, { ...out, admin });
    }
    if (req.method === 'POST') {
      const user = await requireUser(req);
      const b = await readBody(req);
      const out = await saveTestimonial({
        page: b.page,
        relation: b.relation,
        body: b.body,
        user,
        admin: isAdmin(user),
      });
      return sendJson(res, 200, out);
    }
    sendJson(res, 405, { error: 'GET or POST only' });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
