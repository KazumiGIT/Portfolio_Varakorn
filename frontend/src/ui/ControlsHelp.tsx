import { useEffect, useState } from "react";

import { useGame } from "@/stores/gameStore";

const STORAGE_KEY = "kz-controls-seen-v1";

type Props = {
  isTouch: boolean;
};

/**
 * Two-column controls cheatsheet (keyboard + touch). Auto-opens on first visit
 * per browser (localStorage flag). Toggleable via HUD [?] button.
 */
export function ControlsHelp({ isTouch }: Props) {
  const open = useGame((s) => s.helpOpen);
  const setOpen = useGame((s) => s.setHelpOpen);

  // Auto-open on first ever visit.
  const [bootChecked, setBootChecked] = useState(false);
  useEffect(() => {
    if (bootChecked) return;
    setBootChecked(true);
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
        localStorage.setItem(STORAGE_KEY, "1");
      }
    } catch {
      // localStorage blocked — still show help.
      setOpen(true);
    }
  }, [bootChecked, setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/80"
      style={{ zIndex: 10060 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="controls-title"
    >
      <div
        className="nine-slice w-full max-w-[540px] text-parchment"
        style={{ borderColor: "#ffcd75", padding: 18 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            id="controls-title"
            className="font-pixel text-torch-flame"
            style={{ fontSize: 12, letterSpacing: 2 }}
          >
            ⬥ HOW TO PLAY
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
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
          className="font-dialog text-parchment mb-3"
          style={{ fontSize: 14, lineHeight: "16px", opacity: 0.8 }}
        >
          Explore the dungeon. Interact with pedestals, statues, anvils, and
          runes to read about my work. The torch grows as you learn more.
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: isTouch ? "1fr" : "1fr 1fr" }}>
          {/* Keyboard column */}
          <div
            className="nine-slice-dark"
            style={{
              borderColor: "#41a6f6",
              padding: 10,
              display: isTouch ? "none" : "block",
            }}
          >
            <div className="font-pixel text-stone-cool mb-2" style={{ fontSize: 9 }}>
              ⌨ KEYBOARD + MOUSE
            </div>
            <KBRow keys={["W", "A", "S", "D"]} label="Move" />
            <KBRow keys={["↑", "←", "↓", "→"]} label="Move (arrows)" />
            <KBRow keys={["E"]} label="Interact / Skip / Close" />
            <KBRow keys={["F", "J"]} label="Attack" />
            <KBRow keys={["Space"]} label="Jump" />
            <KBRow keys={["Enter"]} label="Interact (alt)" />
            <KBRow keys={["Esc"]} label="Close dialog" />
            <KBRow keys={["Click"]} label="Move to (pathfinds)" />
          </div>

          {/* Touch column */}
          <div
            className="nine-slice-dark"
            style={{
              borderColor: "#a7f070",
              padding: 10,
              display: isTouch ? "block" : "block",
            }}
          >
            <div className="font-pixel text-rune-green mb-2" style={{ fontSize: 9 }}>
              ⍟ MOBILE / TOUCH
            </div>
            <KBRow keys={["▲", "◄", "►", "▼"]} label="D-pad — move" />
            <KBRow keys={["[E]"]} label="Interact — bottom-right button" />
            <KBRow keys={["[⚔]"]} label="Attack — bottom-right button" />
            <KBRow keys={["[↟]"]} label="Jump — bottom-right button" />
            <KBRow keys={["Tap"]} label="Tap floor to path-move" />
            <KBRow keys={["[X]"]} label="Close dialog via button" />
          </div>
        </div>

        <div
          className="font-dialog text-parchment mt-3"
          style={{ fontSize: 13, lineHeight: "15px", opacity: 0.85 }}
        >
          <span style={{ color: "#ffcd75" }}>TIPS</span>
          <br />
          • Loot <strong>all chests</strong> on a floor to break the portal seal.
          <br />
          • Press <strong>[F]</strong> (or J) to swing at monsters. HP returns
          on respawn.
          <br />
          • First press <strong>[E]</strong> opens dialog. Second press skips
          typewriter. Third press closes.
          <br />
          • Press <strong>[Space]</strong> to jump.
          <br />
          • Top-right buttons: <strong>?</strong> help · <strong>♪</strong> mute ·{" "}
          <strong>☰</strong> menu (ASK / PROFILE / RESUME).
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-pixel"
          >
            START
          </button>
        </div>
      </div>
    </div>
  );
}

function KBRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1" style={{ minHeight: 20 }}>
      <div className="flex gap-1" style={{ minWidth: 88 }}>
        {keys.map((k) => (
          <kbd
            key={k}
            className="font-pixel text-parchment no-select"
            style={{
              fontSize: 8,
              padding: "3px 5px",
              background: "#0e0e12",
              border: "1px solid #f4f0bc",
              boxShadow: "1px 1px 0 0 #000",
              minWidth: 16,
              textAlign: "center",
              display: "inline-block",
            }}
          >
            {k}
          </kbd>
        ))}
      </div>
      <span className="font-dialog text-parchment" style={{ fontSize: 14 }}>
        {label}
      </span>
    </div>
  );
}
