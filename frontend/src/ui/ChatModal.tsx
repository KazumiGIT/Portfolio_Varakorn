import { useEffect, useRef, useState } from "react";

import { play } from "@/engine/audio";
import { api } from "@/lib/api";
import { useGame } from "@/stores/gameStore";

type Msg = { role: "user" | "assistant"; content: string; source?: "gemini" | "faq" };

const GREETINGS: Msg[] = [
  {
    role: "assistant",
    content:
      "Hey — I'm Varakorn (a.k.a. Kazumi). Ask me about my projects, stack, or how I built this dungeon. Or anything, really.",
  },
];

const QUICK_Q = [
  "What projects have you built?",
  "What's your stack?",
  "Are you available for work?",
  "How can I contact you?",
];

/**
 * In-game chat with the player-character. Posts to /api/chat which routes
 * through Gemini when GEMINI_API_KEY is set, else falls back to a FAQ matcher.
 */
export function ChatModal() {
  const open = useGame((s) => s.chatOpen);
  const close = () => useGame.getState().setChatOpen(false);
  const [msgs, setMsgs] = useState<Msg[]>(GREETINGS);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy]);

  if (!open) return null;

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const history = msgs.map((m) => ({ role: m.role, content: m.content }));
    setMsgs((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    setErr(null);
    play("click", { volume: 0.2 });
    try {
      const res = await api.chat({ message: q, history });
      setMsgs((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, source: res.source },
      ]);
      play("dialog-open", { volume: 0.25 });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Chat failed.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/80"
      style={{ zIndex: 10070 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
    >
      <div
        className="nine-slice w-full max-w-[520px] text-parchment flex flex-col"
        style={{ borderColor: "#a7f070", padding: 14, height: "min(86vh, 620px)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2
              id="chat-title"
              className="font-pixel text-torch-flame"
              style={{ fontSize: 11, letterSpacing: 2 }}
            >
              ⬥ ASK VARAKORN
            </h2>
            <div
              className="font-dialog"
              style={{ fontSize: 12, color: "#566c86", marginTop: 2 }}
            >
              The character talks back. Sort of.
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="font-pixel text-parchment"
            style={{
              fontSize: 10,
              padding: "4px 8px",
              background: "#b13e53",
              border: "2px solid #f4f0bc",
              cursor: "pointer",
            }}
          >
            [X]
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{
            background: "#0e0e12",
            border: "2px solid #566c86",
            padding: 8,
            marginBottom: 8,
          }}
        >
          {msgs.map((m, i) => (
            <Bubble key={i} msg={m} />
          ))}
          {busy && <TypingIndicator />}
          {err && (
            <div
              className="font-dialog text-rune-crimson"
              style={{ fontSize: 13, marginTop: 6 }}
            >
              {err}
            </div>
          )}
        </div>

        {/* Quick questions */}
        <div className="flex flex-wrap gap-1 mb-2">
          {QUICK_Q.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void send(q)}
              className="font-pixel text-parchment"
              disabled={busy}
              style={{
                fontSize: 7,
                padding: "3px 5px",
                background: "#1a1c2c",
                border: "1px solid #a7f070",
                color: "#a7f070",
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.5 : 1,
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder="Ask me anything..."
            maxLength={500}
            className="font-dialog flex-1 bg-bg-deepest text-parchment"
            style={{
              fontSize: 16,
              padding: 8,
              border: "2px solid #f4f0bc",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="btn-pixel"
            style={{ background: "#29366f", opacity: busy ? 0.6 : 1 }}
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const mine = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: mine ? "flex-end" : "flex-start",
        marginBottom: 6,
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "6px 8px",
          background: mine ? "#29366f" : "#1a1c2c",
          border: `1px solid ${mine ? "#41a6f6" : "#a7f070"}`,
          boxShadow: "2px 2px 0 0 #000",
        }}
      >
        <div
          className="font-pixel"
          style={{
            fontSize: 6,
            color: mine ? "#41a6f6" : "#a7f070",
            letterSpacing: 1,
            marginBottom: 2,
          }}
        >
          {mine ? "YOU" : "VARAKORN"}
          {msg.source === "faq" && (
            <span style={{ color: "#566c86", marginLeft: 4 }}>[OFFLINE]</span>
          )}
        </div>
        <div className="font-dialog" style={{ fontSize: 15, lineHeight: "17px" }}>
          {msg.content}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const id = window.setInterval(() => setDots((d) => (d % 3) + 1), 250);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 6 }}>
      <div
        className="font-pixel"
        style={{
          padding: "6px 8px",
          background: "#1a1c2c",
          border: "1px solid #a7f070",
          color: "#a7f070",
          fontSize: 9,
          letterSpacing: 2,
        }}
      >
        {".".repeat(dots)}
      </div>
    </div>
  );
}
