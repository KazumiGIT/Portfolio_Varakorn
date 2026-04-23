import { useEffect, useState } from "react";

import { play } from "@/engine/audio";
import { useGame } from "@/stores/gameStore";

/**
 * 9-slice dialog with typewriter effect. Rules:
 *  - First E press opens dialog.
 *  - Second E press while typing completes the text instantly (skipped).
 *  - Third E press (once complete) closes the dialog.
 * All toggling is driven by the gameStore; the keyboard handler lives in
 * the Dungeon component.
 */
export function DialogBox() {
  const dialog = useGame((s) => s.dialog);
  const close = useGame((s) => s.closeDialog);
  const markComplete = useGame((s) => s.markDialogComplete);
  const [shown, setShown] = useState("");

  // Main typewriter effect. Re-runs only when a new dialog opens (new body).
  useEffect(() => {
    if (!dialog.open) {
      setShown("");
      return;
    }
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(dialog.body.slice(0, i));
      if (i % 4 === 0) play("dialog-beep", { volume: 0.12, rate: 1.2 });
      if (i >= dialog.body.length) {
        window.clearInterval(id);
        markComplete();
      }
    }, 22);
    return () => window.clearInterval(id);
  }, [dialog.open, dialog.body, markComplete]);

  // Instant-complete when user asks to skip the typewriter.
  useEffect(() => {
    if (!dialog.open) return;
    if (dialog.skipped && shown !== dialog.body) {
      setShown(dialog.body);
      markComplete();
    }
  }, [dialog.skipped, dialog.open, dialog.body, shown, markComplete]);

  if (!dialog.open) return null;

  return (
    <div
      className="absolute inset-x-0 bottom-0 flex justify-center px-2 pb-2"
      style={{ zIndex: 500 }}
    >
      <div
        className="nine-slice w-full max-w-[280px] text-parchment"
        style={{
          borderColor: dialog.accent ?? "#f4f0bc",
          animation: "dialog-pop 180ms steps(3) both",
        }}
      >
        <div
          className="font-pixel mb-2"
          style={{ fontSize: 8, color: dialog.accent ?? "#ffcd75", letterSpacing: 1 }}
        >
          ⬥ {dialog.title}
        </div>
        <div
          className="font-dialog text-parchment typewriter-caret"
          style={{ fontSize: 14, lineHeight: "16px" }}
        >
          {shown}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span
            className="font-pixel"
            style={{ fontSize: 6, color: "#566c86", letterSpacing: 1 }}
          >
            {dialog.complete ? "[E] CLOSE" : "[E] SKIP"}
          </span>
          <button
            className="font-pixel text-parchment"
            onClick={close}
            style={{
              fontSize: 8,
              padding: "3px 6px",
              background: "#0e0e12",
              border: `1px solid ${dialog.accent ?? "#f4f0bc"}`,
              cursor: "pointer",
            }}
          >
            ESC
          </button>
        </div>
      </div>
    </div>
  );
}
