import { useEffect, useMemo, useState } from "react";

import { TILE_PX } from "@/engine/constants";
import { Dungeon } from "@/game/Dungeon";
import { useGame } from "@/stores/gameStore";
import type { Floor } from "@/types/game";

import { fillRect, rectRoom } from "./maps";

/**
 * Floor 3 (final) — Orion Automation. Throne of the dungeon. Gold rays,
 * boss fight, signature chest, and a contact crystal.
 */
export function FloorAgency({ floor }: { floor: Floor }) {
  const setFloor = useGame((s) => s.setFloor);
  const [shimmer, setShimmer] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setShimmer((s) => (s + 1) % 8), 180);
    return () => window.clearInterval(id);
  }, []);

  const tileMap = useMemo(() => {
    const map = rectRoom(floor.width, floor.height);
    // Throne platform decor.
    fillRect(map, 9, 2, 5, 1, 2);
    fillRect(map, 9, 3, 1, 2, 2);
    fillRect(map, 13, 3, 1, 2, 2);
    // Pillars
    for (let y = 5; y < floor.height - 2; y += 3) {
      fillRect(map, 3, y, 1, 1, 2);
      fillRect(map, floor.width - 4, y, 1, 1, 2);
    }
    return map;
  }, [floor.width, floor.height]);

  const ambient = useMemo(
    () => (
      <>
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: floor.width * TILE_PX,
            height: floor.height * TILE_PX,
            background:
              "linear-gradient(180deg, rgba(254,231,97,0.18) 0%, transparent 35%), radial-gradient(ellipse at 50% 25%, rgba(244,240,188,0.22), transparent 60%)",
            mixBlendMode: "screen",
            zIndex: 5,
          }}
        />
        {/* Throne banner */}
        <div
          className="absolute pixel font-pixel no-select"
          style={{
            left: 10 * TILE_PX,
            top: 2 * TILE_PX,
            width: 3 * TILE_PX,
            height: 3 * TILE_PX,
            background: "#29366f",
            border: "2px solid #fee761",
            boxShadow: "inset 0 0 0 1px #0e0e12",
            color: "#fee761",
            fontSize: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            lineHeight: "7px",
            letterSpacing: 1,
            zIndex: 6,
          }}
        >
          ⬥ ORION
          <br />
          AUTOMATION ⬥
        </div>
        {/* Light rays */}
        {[3, 7, 15, 19].map((tx, i) => (
          <div
            key={tx}
            className="absolute pointer-events-none"
            style={{
              left: tx * TILE_PX,
              top: 1 * TILE_PX,
              width: TILE_PX,
              height: 5 * TILE_PX,
              background:
                "linear-gradient(180deg, rgba(254,231,97,0.45), transparent 100%)",
              opacity: ((shimmer + i) % 8) / 16 + 0.3,
              mixBlendMode: "screen",
              zIndex: 7,
            }}
          />
        ))}
        {/* Gold particles */}
        {[
          { x: 0.25, y: 0.4 },
          { x: 0.4, y: 0.25 },
          { x: 0.55, y: 0.5 },
          { x: 0.7, y: 0.3 },
          { x: 0.82, y: 0.55 },
        ].map((p, i) => (
          <div
            key={i}
            className="pixel absolute"
            style={{
              left: p.x * floor.width * TILE_PX,
              top: p.y * floor.height * TILE_PX,
              width: 2,
              height: 2,
              background: "#fee761",
              opacity: 0.85,
              animation: `idle-bob ${900 + i * 170}ms steps(4) infinite`,
              zIndex: 10,
            }}
          />
        ))}
      </>
    ),
    [floor.width, floor.height, shimmer],
  );

  return (
    <Dungeon
      floor={floor}
      tileMap={tileMap}
      ambientOverlay={ambient}
      onExit={(to) => setFloor(to)}
    />
  );
}
