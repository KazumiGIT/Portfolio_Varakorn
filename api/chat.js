// Vercel serverless function: the desk terminal.
//   POST /api/chat { messages } -> { reply }
//   GET  /api/chat              -> { history } (signed in only)
// Anonymous visitors get FREE_CHAT_TURNS messages, then the terminal asks
// them to sign in. Signed in visitors chat freely and their conversation is
// remembered across visits.
import { askVarakornAI } from './_lib/gemini.js';
import { chatHistory, appendChat, FREE_CHAT_TURNS } from './_lib/store.js';
import { userFromRequest } from './_lib/supauth.js';
import { readBody, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    const user = await userFromRequest(req).catch(() => null);

    if (req.method === 'GET') {
      if (!user) return sendJson(res, 401, { error: 'sign in first' });
      return sendJson(res, 200, await chatHistory(user));
    }
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'GET or POST only' });

    const body = await readBody(req);
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (!user) {
      const turns = messages.filter((m) => m?.role === 'user').length;
      if (turns > FREE_CHAT_TURNS) {
        return sendJson(res, 200, {
          gate: true,
          reply:
            'That is ' + FREE_CHAT_TURNS + ' questions on the house. Sign in and we can keep talking, I will even remember where we left off.',
        });
      }
    }

    const out = await askVarakornAI(messages);
    if (out.offline) return sendJson(res, 200, { reply: null, offline: true });

    if (user) {
      const lastUser = [...messages].reverse().find((m) => m?.role === 'user');
      // history is a nicety; a hiccup here must not eat the reply
      await appendChat(user, lastUser?.text || '', out.reply).catch(() => {});
    }
    return sendJson(res, 200, { reply: out.reply });
  } catch (e) {
    sendJson(res, e.status || 500, { error: e.message || 'error' });
  }
}
