import { useState } from "react";

import { play } from "@/engine/audio";
import { api } from "@/lib/api";
import { useGame } from "@/stores/gameStore";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactModal() {
  const open = useGame((s) => s.contactOpen);
  const close = useGame((s) => s.closeContact);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await api.sendContact({ name, email, message, honeypot });
      play("contact-send");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/70"
      style={{ zIndex: 10040 }}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="nine-slice w-full max-w-[480px] text-parchment"
        style={{ borderColor: "#41a6f6" }}
      >
        <div className="flex items-start justify-between mb-3">
          <h2 className="font-pixel text-torch-flame" style={{ fontSize: 12 }}>
            ◉ CRYSTAL BALL — SEND A MESSAGE
          </h2>
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

        {status === "sent" ? (
          <div className="font-dialog" style={{ fontSize: 16 }}>
            <div className="font-pixel text-rune-green mb-2" style={{ fontSize: 10 }}>
              ✦ MESSAGE SENT ✦
            </div>
            <p>Your message reached varakornm0403@gmail.com. The crystal fades.</p>
          </div>
        ) : (
          <>
            <Field label="NAME" value={name} onChange={setName} required disabled={status === "sending"} />
            <Field
              label="EMAIL"
              type="email"
              value={email}
              onChange={setEmail}
              required
              disabled={status === "sending"}
            />
            <label className="font-pixel block mt-3 mb-1" style={{ fontSize: 8, color: "#41a6f6" }}>
              MESSAGE
            </label>
            <textarea
              required
              disabled={status === "sending"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="font-dialog w-full bg-bg-deepest text-parchment"
              style={{
                fontSize: 16,
                padding: 8,
                border: "2px solid #f4f0bc",
                outline: "none",
                minHeight: 96,
                resize: "vertical",
              }}
            />
            {/* honeypot — hidden from real users */}
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              aria-hidden
              style={{ position: "absolute", left: "-9999px" }}
              autoComplete="off"
            />

            {error && (
              <div className="font-dialog text-rune-crimson mt-2" style={{ fontSize: 14 }}>
                {error}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-pixel"
                style={{ background: "#29366f" }}
              >
                {status === "sending" ? "SENDING..." : "SEND"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <>
      <label className="font-pixel block mt-3 mb-1" style={{ fontSize: 8, color: "#41a6f6" }}>
        {label}
      </label>
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-dialog w-full bg-bg-deepest text-parchment"
        style={{
          fontSize: 16,
          padding: 8,
          border: "2px solid #f4f0bc",
          outline: "none",
        }}
      />
    </>
  );
}
