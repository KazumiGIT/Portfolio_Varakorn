import { memo } from "react";

import {
  INTERNAL_H,
  INTERNAL_W,
  TORCH_ALPHA_MAX,
  TORCH_ALPHA_MIN,
  TORCH_FLICKER_AMP,
  TORCH_FLICKER_HZ,
  TORCH_RADIUS_MAX,
  TORCH_RADIUS_MIN,
} from "@/engine/constants";

type Props = {
  px: number; // player world x
  py: number;
  camX: number;
  camY: number;
  t: number;
  /** 0..1 — torch grows as the player reads more dungeon content. */
  progress: number;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Player-anchored torch mask. Radius + outer darkness are both driven by
 * `progress`: at 0 the world is nearly black and the torch is tight;
 * at 1 the torch fills the viewport and the dungeon is fully revealed.
 */
function TorchMaskImpl({ px, py, camX, camY, t, progress }: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const flicker = Math.sin(t * TORCH_FLICKER_HZ * Math.PI * 2) * TORCH_FLICKER_AMP;
  const radius = lerp(TORCH_RADIUS_MIN, TORCH_RADIUS_MAX, p) + flicker;
  const outerAlpha = lerp(TORCH_ALPHA_MAX, TORCH_ALPHA_MIN, p);

  const sx = px - camX;
  const sy = py - camY - 10;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        width: INTERNAL_W,
        height: INTERNAL_H,
        background: `
          radial-gradient(circle ${radius}px at ${sx}px ${sy}px,
            rgba(255, 231, 97, 0.0) 0%,
            rgba(255, 205, 117, 0.05) 30%,
            rgba(239, 125, 87, ${0.35 + 0.15 * p}) 72%,
            rgba(0, 0, 0, ${outerAlpha.toFixed(3)}) 100%)
        `,
        mixBlendMode: "multiply",
        zIndex: 300,
      }}
    />
  );
}

export const TorchMask = memo(TorchMaskImpl);
