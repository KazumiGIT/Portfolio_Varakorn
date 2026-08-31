// Vercel serverless function: the desk terminal.
//   POST /api/chat { messages } -> { reply }
//   GET  /api/chat              -> { history } (signed in only)
// Signed in guests only, by the owner's decision: an anonymous POST gets the
// gate message and Gemini is never called, so the quota is spent on people,
// not probes. Conversations are remembered across visits.
import { askVarakornAI } from './_lib/gemini.js';
import { chatHistory, appendChat } from './_lib/store.js';
import { userFromRequest } from './_lib/supauth.js';
import { readBody, sendJson } from './_lib/http.js';

const GATE_REPLY =
  'This terminal only talks to signed in guests. Use the Sign in button at the top of the page, it takes a minute, and I will remember our conversation.';

export default async function handler(req, res) {
  try {
    const user = await userFromRequest(req).catch(() => null);

    if (req.method === 'GET') {
      if (!user) return sendJson(res, 401, { error: 'sign in first' });
      return sendJson(res, 200, await chatHistory(user));
    }
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'GET or POST only' });

    if (!user) return sendJson(res, 200, { gate: true, reply: GATE_REPLY });

    const body = await readBody(req);
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const out = await askVarakornAI(messages);
    if (out.offline) return sendJson(res, 200, { reply: null, offline: true });

    const lastUser = [...messages].reverse().find((m) => m?.role === 'user');
    // history is a nicety; a hiccup here must not eat the reply
    await appendChat(user, lastUser?.text || '', out.reply).catch(() => {});
    return sendJson(res, 200, { reply: out.reply });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
