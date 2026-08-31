// ---------------------------------------------------------------------------
// Shared Gemini call used by both the Vercel function (api/chat.js) and the
// Vite dev middleware. Never ships to the browser; the key stays server side.
// ---------------------------------------------------------------------------
import { systemPrompt } from './persona.js';

const MAX_TURNS = 10;
const MAX_CHARS = 600;

/**
 * messages: [{ role: 'user' | 'model', text: string }, ...]
 * Returns { reply } or { offline: true } when no key is configured.
 * Throws Error with .status for bad requests / upstream failures.
 */
export async function askVarakornAI(messages, env = process.env) {
  const key = env.GEMINI_API_KEY;
  if (!key) return { offline: true };

  const turns = (Array.isArray(messages) ? messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string')
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, MAX_CHARS) }] }));

  if (!turns.length || turns[turns.length - 1].role !== 'user') {
    throw Object.assign(new Error('bad request'), { status: 400 });
  }

  // A bad GEMINI_MODEL (a pasted key, a stray quote) makes every call 400 with
  // "unexpected model name format", so only trust values that look like a model.
  const configured = (env.GEMINI_MODEL || '').trim();
  const model = /^gemini[a-z0-9.\-]*$/i.test(configured) ? configured : 'gemini-2.5-flash';
  const generationConfig = { temperature: 0.6, maxOutputTokens: 500 };
  // 2.5 models spend "thinking" tokens out of the same budget — turn it off,
  // this is a 60 word chat reply, not a proof
  if (model.includes('2.5')) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt() }] },
        contents: turns,
        generationConfig,
      }),
    }
  );

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw Object.assign(new Error(data?.error?.message || `Gemini error ${r.status}`), {
      status: 502,
    });
  }

  const reply = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || '')
    .join('')
    .trim();
  return { reply: reply || 'Hmm, say that again?' };
}
