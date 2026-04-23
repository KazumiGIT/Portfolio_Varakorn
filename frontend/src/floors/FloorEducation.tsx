import { useMemo } from "react";

import { TILE_PX } from "@/engine/constants";
import { Dungeon } from "@/game/Dungeon";
import { useGame } from "@/stores/gameStore";
import type { Floor } from "@/types/game";

import { fillRect, rectRoom } from "./maps";

/**
 * Floor 1 — Education. Study hall with 3 chests + 2 slimes. Portal sealed
 * until all chests looted.
 */
export function FloorEducation({ floor }: { floor: Floor }) {
  const setFloor = useGame((s) => s.setFloor);

  const tileMap = useMemo(() => {
    const map = rectRoom(floor.width, floor.height, [
      { x: floor.width - 1, y: 6 },
      { x: floor.width - 1, y: 7 },
    ]);
    // Desks / bookshelves — small decor pillars.
    fillRect(map, 5, 7, 1, 2);
    fillRect(map, 11, 7, 1, 2);
    fillRect(map, 17, 7, 1, 2);
    fillRect(map, 21, 7, 1, 2);
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
              "radial-gradient(ellipse at 50% 70%, rgba(65,166,246,0.18), transparent 55%)",
            mixBlendMode: "screen",
            zIndex: 5,
          }}
        />
        {[
          { x: 0.15, y: 0.3 },
          { x: 0.4, y: 0.2 },
          { x: 0.6, y: 0.45 },
          { x: 0.8, y: 0.3 },
          { x: 0.3, y: 0.65 },
        ].map((d, i) => (
          <div
            key={i}
            className="pixel absolute"
            style={{
              left: d.x * floor.width * TILE_PX,
              top: d.y * floor.height * TILE_PX,
              width: 2,
              height: 2,
              background: "#fee761",
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
