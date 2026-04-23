import { useEffect, useRef, useState } from "react";

import { setMuted } from "@/engine/audio";
import { useGame } from "@/stores/gameStore";

type Props = {
  floorId: number;
  floorName: string;
};

/**
 * Top HUD sized for the 320x180 internal canvas. Three zones at y=1:
 *   - left: compact torch progress bar
 *   - center: short floor banner ("F1 | ARCHIVES")
 *   - right: 3 icon buttons (?, ♪, ☰) — ☰ opens a dropdown menu with
 *     ASK / CARD / RESUME to avoid overflowing the narrow viewport.
 */
export function HUD({ floorId, floorName }: Props) {
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);
  const setResumeOpen = useGame((s) => s.setResumeOpen);
  const setHelpOpen = useGame((s) => s.setHelpOpen);
  const setProfileOpen = useGame((s) => s.setProfileOpen);
  const setChatOpen = useGame((s) => s.setChatOpen);
  const contentCount = useGame((s) => s.contentInteracted.size);
  const totalContent = useGame((s) => s.totalContentCount);

  const pct = Math.min(100, Math.round((contentCount / totalContent) * 100));
  const short = floorName.replace(/^THE\s+/i, "").toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const openItem = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };

  return (
    <>
      {/* Top-left: torch progress */}
      <div
        className="absolute font-pixel text-parchment no-select"
        style={{
          top: 1,
          left: 1,
          fontSize: 5,
          background: "#0e0e12",
          border: "1px solid #f4f0bc",
          padding: "2px 3px",
          zIndex: 400,
          boxShadow: "1px 1px 0 0 #000",
          width: 42,
          lineHeight: "6px",
        }}
      >
        <div
          style={{
            height: 3,
            width: "100%",
            background: "#1a1c2c",
            border: "1px solid #566c86",
          }}
          aria-label={`Torch ${pct}%`}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: "#ffcd75",
              transition: "width 400ms steps(6)",
            }}
          />
        </div>
        <div style={{ fontSize: 5, color: "#566c86", marginTop: 1, letterSpacing: 1 }}>
          {pct}%
        </div>
      </div>

      {/* Top-center: floor banner */}
      <div
        className="absolute font-pixel text-parchment no-select"
        style={{
          top: 1,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 6,
          background: "#0e0e12",
          border: "1px solid #f4f0bc",
          padding: "3px 6px",
          zIndex: 400,
          boxShadow: "1px 1px 0 0 #000",
          letterSpacing: 1,
          whiteSpace: "nowrap",
          maxWidth: 140,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <span style={{ color: "#ffcd75" }}>F{floorId}</span>
        <span style={{ color: "#566c86", margin: "0 4px" }}>|</span>
        <span>{short}</span>
      </div>

      {/* Top-right: 3-button cluster with menu dropdown */}
      <div
        className="absolute flex gap-1"
        style={{ top: 1, right: 1, zIndex: 401 }}
        ref={menuRef}
      >
        <IconBtn label="?" onClick={() => setHelpOpen(true)} aria="How to play" />
        <IconBtn
          label={muted ? "♪✕" : "♪"}
          onClick={() => {
            toggleMute();
            setMuted(!muted);
          }}
          aria={muted ? "Unmute" : "Mute"}
        />
        <IconBtn
          label="☰"
          onClick={() => setMenuOpen((v) => !v)}
          aria="Open menu"
          active={menuOpen}
        />

        {menuOpen && (
          <div
            className="absolute font-pixel"
            style={{
              top: 16,
              right: 0,
              background: "#0e0e12",
              border: "2px solid #f4f0bc",
              padding: 3,
              minWidth: 70,
              boxShadow: "2px 2px 0 0 #000",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              zIndex: 402,
            }}
          >
            <MenuItem
              label="ASK ME"
              accent="#a7f070"
              onClick={() => openItem(() => setChatOpen(true))}
            />
            <MenuItem
              label="PROFILE"
              accent="#41a6f6"
              onClick={() => openItem(() => setProfileOpen(true))}
            />
            <MenuItem
              label="RESUME"
              accent="#b13e53"
              onClick={() => openItem(() => setResumeOpen(true))}
            />
          </div>
        )}
      </div>
    </>
  );
}

function IconBtn({
  label,
  onClick,
  aria,
  active = false,
}: {
  label: string;
  onClick: () => void;
  aria: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="font-pixel"
      style={{
        fontSize: 6,
        width: 16,
        height: 16,
        background: active ? "#f4f0bc" : "#0e0e12",
        color: active ? "#0e0e12" : "#f4f0bc",
        border: "1px solid #f4f0bc",
        cursor: "pointer",
        boxShadow: "1px 1px 0 0 #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        lineHeight: "7px",
      }}
    >
      {label}
    </button>
  );
}

function MenuItem({
  label,
  onClick,
  accent,
}: {
  label: string;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-pixel no-select"
      style={{
        fontSize: 6,
        background: "#1a1c2c",
        color: accent,
        border: `1px solid ${accent}`,
        padding: "4px 6px",
        cursor: "pointer",
        textAlign: "left",
        letterSpacing: 1,
        lineHeight: "7px",
      }}
    >
      {label}
    </button>
  );
}
