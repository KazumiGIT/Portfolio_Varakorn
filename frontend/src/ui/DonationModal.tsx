import { useState } from "react";

import { play } from "@/engine/audio";

type Props = {
  open: boolean;
  onClose: () => void;
};

const BANK = "MAYBANK";
const ACCOUNT = "558181076860";
const NAME = "Varakorn";

export function DonationModal({ open, onClose }: Props) {
  const [copied, setCopied] = useState<"account" | null>(null);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ACCOUNT);
      setCopied("account");
      play("click", { volume: 0.3 });
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Best-effort.
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/85"
      style={{ zIndex: 10080 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nine-slice w-full max-w-[400px] text-parchment"
        style={{ borderColor: "#fee761", padding: 16 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            id="donation-title"
            className="font-pixel text-torch-flame"
            style={{ fontSize: 11, letterSpacing: 2 }}
          >
            ♡ DONATION
          </h2>
          <button
            type="button"
            onClick={onClose}
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

        <div className="flex flex-col items-center gap-3">
          <img
            src="/v_qr.jpeg"
            alt="MAYBANK QR code"
            draggable={false}
            style={{
              width: 220,
              height: 220,
              objectFit: "contain",
              background: "#f4f0bc",
              border: "3px solid #fee761",
              padding: 6,
              imageRendering: "auto",
              boxShadow: "4px 4px 0 0 #000",
            }}
          />

          <div className="w-full">
            <Row label="BANK" value={BANK} accent="#41a6f6" />
            <Row label="NAME" value={NAME} accent="#a7f070" />
            <div
              className="flex items-center justify-between mt-1"
              style={{
                background: "#0e0e12",
                border: "2px solid #ffcd75",
                padding: "6px 8px",
              }}
            >
              <div>
                <div
                  className="font-pixel"
                  style={{ fontSize: 6, color: "#ffcd75", letterSpacing: 1 }}
                >
                  ACCOUNT
                </div>
                <div
                  className="font-dialog"
                  style={{ fontSize: 18, letterSpacing: 1, color: "#f4f0bc" }}
                >
                  {ACCOUNT}
                </div>
              </div>
              <button
                type="button"
                onClick={copy}
                className="font-pixel"
                style={{
                  fontSize: 7,
                  padding: "4px 6px",
                  background: copied ? "#a7f070" : "#29366f",
                  color: copied ? "#0e0e12" : "#f4f0bc",
                  border: "2px solid #f4f0bc",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0 0 #000",
                }}
              >
                {copied ? "COPIED ✓" : "COPY"}
              </button>
            </div>
          </div>

          <div
            className="font-dialog text-parchment text-center"
            style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}
          >
            Thank you for the support. Every coin keeps the torch lit.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        background: "#0e0e12",
        border: `2px solid ${accent}`,
        padding: "6px 8px",
        marginBottom: 4,
      }}
    >
      <span
        className="font-pixel"
        style={{ fontSize: 6, color: accent, letterSpacing: 1 }}
      >
        {label}
      </span>
      <span
        className="font-dialog"
        style={{ fontSize: 16, color: "#f4f0bc", letterSpacing: 1 }}
      >
        {value}
      </span>
    </div>
  );
}
