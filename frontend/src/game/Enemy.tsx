import { memo } from "react";

import type { EnemyRuntime } from "@/engine/combat";
import { ENEMY_SIZE } from "@/engine/constants";

type Props = {
  e: EnemyRuntime;
  t: number;
};

/**
 * Minimal pixel-art monster. Species drives palette + silhouette. Bounces
 * subtly every 400ms and flashes white-red on damage.
 */
function EnemyImpl({ e, t }: Props) {
  if (e.dead) return null;
  const size = ENEMY_SIZE;
  const flash = performance.now() < e.flashUntil;
  const bob = Math.floor((t * 2.5) % 2) === 0 ? 0 : -1;

  const { body, eye } = palette(e.species);

  return (
    <div
      className="pixel absolute no-select pointer-events-none"
      style={{
        left: e.x - size / 2,
        top: e.y - size + 2 + bob,
        width: size,
        height: size,
        zIndex: 45,
        filter: flash ? "brightness(2.2) saturate(0)" : undefined,
      }}
    >
      {/* Shadow */}
      <div
        className="absolute"
        style={{
          left: 1,
          bottom: -2,
          width: size - 2,
          height: 2,
          background: "rgba(0,0,0,0.55)",
        }}
      />
      {/* Body — rounded-look via stepped borders (no border-radius). */}
      <div
        className="absolute"
        style={{
          inset: 0,
          background: body,
          boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.12)`,
          border: `1px solid #0e0e12`,
        }}
      />
      {/* Eyes */}
      <div
        className="absolute"
        style={{
          left: 3,
          top: 4,
          width: 2,
          height: 2,
          background: eye,
        }}
      />
      <div
        className="absolute"
        style={{
          right: 3,
          top: 4,
          width: 2,
          height: 2,
          background: eye,
        }}
      />
      {/* HP pips */}
      <HpBar current={e.hp} max={e.maxHp} width={size} />
    </div>
  );
}

function HpBar({ current, max, width }: { current: number; max: number; width: number }) {
  return (
    <div
      className="absolute"
      style={{
        left: 0,
        top: -5,
        width,
        display: "flex",
        gap: 1,
        justifyContent: "center",
      }}
    >
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: Math.max(2, Math.floor((width - max + 1) / max) - 1),
            height: 2,
            background: i < current ? "#ea4f36" : "#3e3546",
            border: "1px solid #0e0e12",
          }}
        />
      ))}
    </div>
  );
}

function palette(species: string): { body: string; eye: string } {
  switch (species) {
    case "ghost":
      return { body: "#b55088", eye: "#fee761" };
    case "boss":
      return { body: "#b13e53", eye: "#fee761" };
    case "slime":
    default:
      return { body: "#a7f070", eye: "#0e0e12" };
  }
}

export const Enemy = memo(EnemyImpl);
