import { useEffect, useRef, useState } from "react";

import { INTERNAL_H, INTERNAL_W } from "@/engine/constants";

/**
 * Scales the 320x180 internal canvas to fill the viewport while preserving
 * pixel-perfect integer scaling when possible. Falls back to fractional scale
 * on small displays but keeps nearest-neighbor.
 */
export function Viewport({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(3);

  useEffect(() => {
    const recompute = () => {
      const el = ref.current;
      if (!el) return;
      const parent = el.parentElement!;
      const sx = parent.clientWidth / INTERNAL_W;
      const sy = parent.clientHeight / INTERNAL_H;
      const s = Math.max(1, Math.min(sx, sy));
      const integer = Math.floor(s);
      setScale(integer >= 1 ? integer : s);
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden no-select bg-bg-deepest">
      <div
        ref={ref}
        className="relative viewport"
        style={{
          width: INTERNAL_W,
          height: INTERNAL_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          imageRendering: "pixelated",
        }}
      >
        {children}
      </div>
    </div>
  );
}
