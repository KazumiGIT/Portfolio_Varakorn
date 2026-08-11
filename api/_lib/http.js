// Tiny req/res helpers so the same handlers run on Vercel functions and as
// plain connect middleware in the Vite dev server.

/** JSON body: Vercel pre-parses req.body; the dev server streams it. */
export async function readBody(req) {
  if (req.body !== undefined) return req.body || {};
  const raw = await new Promise((resolve, reject) => {
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => resolve(s));
    req.on('error', reject);
  });
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Query params regardless of how much of the url the router stripped. */
export function getQuery(req) {
  if (req.query && Object.keys(req.query).length) return req.query;
  return Object.fromEntries(new URLSearchParams((req.url || '').split('?')[1] || ''));
}

export function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(obj));
}

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim() || req.socket?.remoteAddress;
