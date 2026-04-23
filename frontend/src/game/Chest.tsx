import { memo } from "react";

import { TILE_PX } from "@/engine/constants";
import type { Interactable } from "@/types/game";

type Props = {
  data: Interactable;
  inRange: boolean;
  looted: boolean;
  t: number;
};

/**
 * Pixel-art chest. Rendered with divs for flexibility — base box, lid, lock,
 * and a soft glow when the player can loot it. Uses only palette colors.
 */
function ChestImpl({ data, inRange, looted, t }: Props) {
  const x = data.x * TILE_PX;
  const y = data.y * TILE_PX;
  const w = data.w * TILE_PX;
  const h = data.h * TILE_PX;
  const accent = data.accent ?? "#ffcd75";
  const crystal = data.kind === "chest_contact";

  const glow = inRange && !looted ? (Math.sin(t * 7) + 1) * 0.5 : 0;

  const woodDark = crystal ? "#193c3e" : "#3e2731";
  const woodMid = crystal ? "#265c42" : "#733e39";
  const woodLight = crystal ? "#3e8948" : "#ab947a";
  const bandColor = accent;

  return (
    <div
      className="pixel absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: 20,
      }}
    >
      {/* Drop shadow */}
      <div
        className="absolute"
        style={{
          left: 1,
          bottom: -2,
          width: w - 2,
          height: 3,
          background: "rgba(0,0,0,0.55)",
          borderRadius: 0,
        }}
      />

      {/* Chest body — lid + base */}
      <div
        className="absolute"
        style={{
          inset: 0,
          background: woodMid,
          border: `1px solid ${woodDark}`,
          boxShadow: `
            inset 0 -3px 0 ${woodDark},
            inset 0 3px 0 ${woodLight},
            inset -2px 0 0 ${woodDark},
            inset 2px 0 0 ${woodLight}
          `,
        }}
      />
      {/* Metal band */}
      <div
        className="absolute"
        style={{
          left: 2,
          right: 2,
          top: Math.floor(h * 0.4),
          height: 2,
          background: bandColor,
          opacity: looted ? 0.35 : 1,
        }}
      />
      {/* Lock */}
      <div
        className="absolute"
        style={{
          left: Math.floor(w / 2) - 2,
          top: Math.floor(h * 0.38),
          width: 4,
          height: 4,
          background: looted ? "#566c86" : bandColor,
          border: "1px solid #0e0e12",
        }}
      />
      {/* Open-state: X mark on lid */}
      {looted && (
        <div
          className="absolute font-pixel"
          style={{
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#566c86",
            fontSize: 8,
            letterSpacing: 0,
          }}
        >
          ·
        </div>
      )}
      {/* Crystal chest: inner glowing shard */}
      {crystal && !looted && (
        <div
          className="absolute"
          style={{
            left: Math.floor(w / 2) - 1,
            top: Math.floor(h * 0.2),
            width: 2,
            height: 4,
            background: "#41a6f6",
            boxShadow: `0 0 4px #41a6f6`,
            animation: "glow-pulse 1.2s steps(4) infinite",
          }}
        />
      )}
      {/* Ready-to-loot glow */}
      {inRange && !looted && (
        <div
          className="absolute pointer-events-none"
          style={{
            inset: -4,
            boxShadow: `0 0 ${8 + glow * 6}px ${accent}`,
            opacity: 0.6 + glow * 0.4,
          }}
        />
      )}
      {inRange && !looted && (
        <div
          className="absolute font-pixel no-select"
          style={{
            left: w / 2,
            top: -9,
            transform: "translate(-50%, -100%)",
            background: "#0e0e12",
            border: `1px solid ${accent}`,
            color: "#f4f0bc",
            padding: "1px 3px",
            fontSize: 5,
            lineHeight: "7px",
            letterSpacing: 0,
            whiteSpace: "nowrap",
            zIndex: 25,
            animation: "idle-bob 500ms steps(2) infinite",
          }}
        >
          <span style={{ color: accent }}>E</span> LOOT
        </div>
      )}
    </div>
  );
}

export const Chest = memo(ChestImpl);
