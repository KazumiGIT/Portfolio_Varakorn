// Vercel serverless function: POST /api/chat { messages } -> { reply }
// The Gemini key lives in the GEMINI_API_KEY environment variable.
import { askVarakornAI } from './_lib/gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  try {
    const out = await askVarakornAI(req.body?.messages);
    if (out.offline) {
      res.status(200).json({ reply: null, offline: true });
      return;
    }
    res.status(200).json({ reply: out.reply });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'error' });
  }
}
