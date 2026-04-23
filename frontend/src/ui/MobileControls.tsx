import { useEffect, useRef } from "react";

/**
 * Touch virtual D-pad + interact button. Simulates keyboard events so the
 * main engine doesn't need a special path for touch.
 */
export function MobileControls() {
  const dispatch = (key: string, down: boolean) => {
    window.dispatchEvent(
      new KeyboardEvent(down ? "keydown" : "keyup", { key, bubbles: true }),
    );
  };

  const activeDir = useRef<string | null>(null);

  const setDir = (k: string | null) => {
    if (activeDir.current === k) return;
    if (activeDir.current) dispatch(activeDir.current, false);
    activeDir.current = k;
    if (k) dispatch(k, true);
  };

  useEffect(() => () => setDir(null), []);

  const pad = (arrow: string, label: string, extra: React.CSSProperties) => (
    <button
      onTouchStart={(e) => {
        e.preventDefault();
        setDir(arrow);
      }}
      onTouchEnd={() => setDir(null)}
      onMouseDown={() => setDir(arrow)}
      onMouseUp={() => setDir(null)}
      onMouseLeave={() => activeDir.current === arrow && setDir(null)}
      className="font-pixel text-parchment select-none"
      style={{
        width: 44,
        height: 44,
        background: "#0e0e12",
        border: "2px solid #f4f0bc",
        boxShadow: "2px 2px 0 0 #000",
        position: "absolute",
        touchAction: "none",
        ...extra,
      }}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <>
      <div
        className="fixed"
        style={{
          left: 12,
          bottom: 12,
          width: 140,
          height: 140,
          zIndex: 600,
          touchAction: "none",
        }}
      >
        {pad("ArrowUp", "▲", { left: 48, top: 0 })}
        {pad("ArrowLeft", "◄", { left: 0, top: 48 })}
        {pad("ArrowRight", "►", { left: 96, top: 48 })}
        {pad("ArrowDown", "▼", { left: 48, top: 96 })}
      </div>
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          dispatch("e", true);
        }}
        onTouchEnd={() => dispatch("e", false)}
        onMouseDown={() => dispatch("e", true)}
        onMouseUp={() => dispatch("e", false)}
        className="fixed font-pixel text-parchment select-none"
        style={{
          right: 16,
          bottom: 88,
          width: 60,
          height: 60,
          background: "#b13e53",
          border: "3px solid #f4f0bc",
          boxShadow: "3px 3px 0 0 #000",
          fontSize: 10,
          zIndex: 600,
          touchAction: "none",
        }}
        aria-label="Interact"
      >
        [E]
      </button>
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          dispatch(" ", true);
        }}
        onTouchEnd={() => dispatch(" ", false)}
        onMouseDown={() => dispatch(" ", true)}
        onMouseUp={() => dispatch(" ", false)}
        className="fixed font-pixel text-parchment select-none"
        style={{
          right: 86,
          bottom: 22,
          width: 54,
          height: 54,
          background: "#29366f",
          border: "3px solid #a7f070",
          boxShadow: "3px 3px 0 0 #000",
          fontSize: 9,
          color: "#a7f070",
          zIndex: 600,
          touchAction: "none",
        }}
        aria-label="Jump"
      >
        ↟ JUMP
      </button>
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          dispatch("f", true);
        }}
        onTouchEnd={() => dispatch("f", false)}
        onMouseDown={() => dispatch("f", true)}
        onMouseUp={() => dispatch("f", false)}
        className="fixed font-pixel text-parchment select-none"
        style={{
          right: 152,
          bottom: 56,
          width: 54,
          height: 54,
          background: "#1a1c2c",
          border: "3px solid #ffcd75",
          boxShadow: "3px 3px 0 0 #000",
          fontSize: 10,
          color: "#ffcd75",
          zIndex: 600,
          touchAction: "none",
        }}
        aria-label="Attack"
      >
        ⚔ ATK
      </button>
    </>
  );
}
