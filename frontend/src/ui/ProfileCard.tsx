import { useEffect, useState } from "react";

import { play } from "@/engine/audio";
import { api } from "@/lib/api";
import { downloadVCard } from "@/lib/vcard";
import { useGame } from "@/stores/gameStore";
import type { Profile, Social } from "@/types/game";

import { DonationModal } from "./DonationModal";

/**
 * Linktree-style profile card. Shown as a full-screen modal over the dungeon.
 * Responsive: two-column layout on desktop (>= 640px) with avatar + links,
 * single column on mobile.
 */
export function ProfileCard() {
  const open = useGame((s) => s.profileOpen);
  const close = () => useGame.getState().setProfileOpen(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [othersOpen, setOthersOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);

  const onSocialClick = (s: Social) => {
    if (s.disabled) return;
    play("click", { volume: 0.25 });
    if (s.kind === "vcard" && profile) {
      downloadVCard(profile);
      return;
    }
    if (s.kind === "donation") {
      setDonationOpen(true);
      return;
    }
    if (s.href && s.href !== "#") {
      window.open(s.href, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    if (!open || profile) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await api.profile();
        if (!cancelled) setProfile(p);
      } catch (e) {
        if (!cancelled)
          setErr(e instanceof Error ? e.message : "Failed to load profile.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, profile]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-black/90 p-4 sm:p-6"
      style={{ zIndex: 10055 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div
        className="nine-slice mx-auto w-full max-w-[680px] text-parchment"
        style={{ borderColor: "#fee761", padding: 18 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            id="profile-title"
            className="font-pixel text-torch-flame"
            style={{ fontSize: 12, letterSpacing: 2 }}
          >
            ⬥ PROFILE CARD
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
            aria-label="Close profile card"
          >
            [X]
          </button>
        </div>

        {err && (
          <div className="font-dialog text-rune-crimson" style={{ fontSize: 14 }}>
            {err}
          </div>
        )}

        {!profile && !err && (
          <div className="font-dialog text-parchment" style={{ fontSize: 14, opacity: 0.7 }}>
            Loading profile...
          </div>
        )}

        {profile && (
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            {/* Avatar column */}
            <div className="flex flex-col items-center sm:items-start">
              <div
                style={{
                  width: 160,
                  height: 200,
                  overflow: "hidden",
                  background: "#1a1c2c",
                  border: "3px solid #fee761",
                  boxShadow: "4px 4px 0 0 #000",
                  position: "relative",
                }}
                aria-hidden
              >
                <img
                  src="/profile-pic.jpg"
                  alt=""
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    // Face sits slightly right + upper in the source photo.
                    // Tune these two values if the photo changes.
                    objectPosition: "56% 28%",
                    display: "block",
                    imageRendering: "auto",
                  }}
                />
                {/* Scanline overlay to tie portrait into dungeon aesthetic */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0 1px, transparent 1px 3px)",
                    mixBlendMode: "multiply",
                    pointerEvents: "none",
                  }}
                />
                {/* Gold vignette frame */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    boxShadow:
                      "inset 0 0 0 1px #0e0e12, inset 0 -40px 50px rgba(14,14,18,0.55), inset 0 20px 30px rgba(254,231,97,0.08)",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div
                className="font-pixel mt-3 text-center sm:text-left"
                style={{ fontSize: 10, color: "#fee761", letterSpacing: 1, lineHeight: "14px" }}
              >
                {profile.name.toUpperCase()}
                {profile.alias && (
                  <div style={{ fontSize: 7, color: "#c7dcd0", marginTop: 2 }}>
                    a.k.a. {profile.alias}
                  </div>
                )}
              </div>
              <div
                className="font-dialog text-parchment mt-1 text-center sm:text-left"
                style={{ fontSize: 14, opacity: 0.9 }}
              >
                {profile.role}
              </div>
              {profile.location && (
                <div
                  className="font-dialog text-parchment mt-1 text-center sm:text-left"
                  style={{ fontSize: 13, opacity: 0.6 }}
                >
                  ⌖ {profile.location}
                </div>
              )}
            </div>

            {/* Content column */}
            <div>
              {profile.tagline && (
                <div
                  className="font-dialog mb-3"
                  style={{
                    fontSize: 16,
                    lineHeight: "18px",
                    color: "#ffcd75",
                    borderLeft: "3px solid #ffcd75",
                    paddingLeft: 8,
                  }}
                >
                  "{profile.tagline}"
                </div>
              )}

              <div className="font-pixel mb-2" style={{ fontSize: 8, color: "#41a6f6" }}>
                WHAT I DO
              </div>
              <ul className="font-dialog mb-4" style={{ fontSize: 14, lineHeight: "17px" }}>
                {profile.what_i_do.map((w) => (
                  <li key={w} style={{ marginBottom: 2 }}>
                    <span style={{ color: "#a7f070" }}>▸</span> {w}
                  </li>
                ))}
              </ul>

              <div className="font-pixel mb-2" style={{ fontSize: 8, color: "#41a6f6" }}>
                LANGUAGES
              </div>
              <div className="font-dialog mb-4" style={{ fontSize: 14 }}>
                {profile.languages.join(" · ")}
              </div>

              <div className="font-pixel mb-2" style={{ fontSize: 8, color: "#41a6f6" }}>
                LINKS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {profile.socials
                  .filter((s) => (s.group ?? "others") === "primary")
                  .map((s) => (
                    <SocialBtn key={s.id} s={s} big onClick={onSocialClick} />
                  ))}
              </div>

              <button
                type="button"
                onClick={() => setOthersOpen((v) => !v)}
                className="font-pixel no-select mt-3"
                aria-expanded={othersOpen}
                style={{
                  fontSize: 8,
                  padding: "6px 10px",
                  background: "#1a1c2c",
                  color: "#f4f0bc",
                  border: "2px solid #f4f0bc",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0 0 #000",
                  letterSpacing: 2,
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {othersOpen ? "▼" : "▶"} OTHERS
              </button>
              {othersOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {profile.socials
                    .filter((s) => (s.group ?? "others") === "others")
                    .map((s) => (
                      <SocialBtn key={s.id} s={s} onClick={onSocialClick} />
                    ))}
                </div>
              )}

              <div
                className="font-dialog mt-4"
                style={{ fontSize: 13, color: "#c7dcd0", opacity: 0.8 }}
              >
                {profile.bio}
              </div>
            </div>
          </div>
        )}
      </div>
      <DonationModal open={donationOpen} onClose={() => setDonationOpen(false)} />
    </div>
  );
}

function SocialBtn({
  s,
  big = false,
  onClick,
}: {
  s: Social;
  big?: boolean;
  onClick: (s: Social) => void;
}) {
  const dead = s.disabled || !s.href;
  return (
    <button
      type="button"
      onClick={() => onClick(s)}
      disabled={dead}
      className="font-pixel no-select"
      aria-disabled={dead}
      aria-label={s.label}
      style={{
        fontSize: big ? 9 : 8,
        padding: big ? "10px 10px" : "7px 8px",
        background: "#0e0e12",
        border: `2px solid ${dead ? "#566c86" : s.accent}`,
        color: dead ? "#566c86" : s.accent,
        textDecoration: "none",
        cursor: dead ? "not-allowed" : "pointer",
        boxShadow: dead ? "none" : `2px 2px 0 0 #000`,
        display: "flex",
        alignItems: "center",
        gap: 6,
        letterSpacing: 1,
        opacity: dead ? 0.5 : 1,
        textAlign: "left",
      }}
    >
      <span
        style={{
          fontSize: big ? 14 : 12,
          width: big ? 20 : 16,
          textAlign: "center",
          display: "inline-block",
        }}
      >
        {s.glyph}
      </span>
      <span style={{ flex: 1 }}>{s.label.toUpperCase()}</span>
    </button>
  );
}
