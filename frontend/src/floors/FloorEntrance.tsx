import { useMemo } from "react";

import { TILE_PX } from "@/engine/constants";
import { Dungeon } from "@/game/Dungeon";
import { useGame } from "@/stores/gameStore";
import type { Floor } from "@/types/game";

import { rectRoom, setTile } from "./maps";

/**
 * Entrance — pre-floor intro. A dim stone antechamber with a single portal
 * leading into Floor 1 (Education). No chests, no enemies.
 */
export function FloorEntrance({ floor }: { floor: Floor }) {
  const setFloor = useGame((s) => s.setFloor);

  const tileMap = useMemo(() => {
    const map = rectRoom(floor.width, floor.height);
    // A faint path leading up to the portal — decorative tile 3 strip.
    for (let x = 3; x < 14; x++) setTile(map, x, 7, 3);
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
              "radial-gradient(ellipse at 80% 40%, rgba(177,62,83,0.25), transparent 55%)",
            mixBlendMode: "screen",
            zIndex: 5,
          }}
        />
        {/* Title */}
        <div
          className="font-pixel absolute no-select"
          style={{
            left: "50%",
            top: 6,
            transform: "translateX(-50%)",
            fontSize: 8,
            color: "#ffcd75",
            letterSpacing: 2,
            background: "#0e0e12",
            border: "2px solid #ffcd75",
            padding: "3px 8px",
            zIndex: 25,
          }}
        >
          ⬥ ENTRANCE ⬥
        </div>
        {/* Hint */}
        <div
          className="font-dialog absolute no-select"
          style={{
            left: "50%",
            top: 22,
            transform: "translateX(-50%)",
            fontSize: 10,
            color: "#c7dcd0",
            textAlign: "center",
            whiteSpace: "nowrap",
            zIndex: 25,
            opacity: 0.8,
          }}
        >
          Walk to the portal. Press E.
        </div>
        {/* Ambient dust */}
        {[
          { x: 0.3, y: 0.4 },
          { x: 0.55, y: 0.2 },
          { x: 0.72, y: 0.35 },
          { x: 0.2, y: 0.6 },
          { x: 0.85, y: 0.55 },
        ].map((d, i) => (
          <div
            key={i}
            className="pixel absolute"
            style={{
              left: d.x * floor.width * TILE_PX,
              top: d.y * floor.height * TILE_PX,
              width: 2,
              height: 2,
              background: "#b13e53",
              opacity: 0.55,
              animation: `idle-bob ${700 + i * 210}ms steps(4) infinite`,
              zIndex: 10,
            }}
          />
        ))}
      </>
    ),
    [floor.width, floor.height],
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
