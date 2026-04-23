import { useEffect, useMemo, useState } from "react";

import { TILE_PX } from "@/engine/constants";
import { Dungeon } from "@/game/Dungeon";
import { useGame } from "@/stores/gameStore";
import type { Floor } from "@/types/game";

import { fillRect, rectRoom } from "./maps";

/**
 * Floor 2 — Work Experience. Studio-style hall with a single HYGR chest +
 * two Screen Ghosts. Neon CRT pulses across the back wall.
 */
export function FloorExperience({ floor }: { floor: Floor }) {
  const setFloor = useGame((s) => s.setFloor);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const id = window.setInterval(
      () => {
        setGlitch(true);
        window.setTimeout(() => setGlitch(false), 120);
      },
      1500 + Math.random() * 2200,
    );
    return () => window.clearInterval(id);
  }, []);

  const tileMap = useMemo(() => {
    const map = rectRoom(floor.width, floor.height, [
      { x: floor.width - 1, y: 6 },
      { x: floor.width - 1, y: 7 },
    ]);
    // CRT screens on back wall (decor tile 2).
    fillRect(map, 5, 2, 1, 1, 2);
    fillRect(map, 9, 2, 1, 1, 2);
    fillRect(map, 14, 2, 1, 1, 2);
    fillRect(map, 17, 2, 1, 1, 2);
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
              "linear-gradient(180deg, rgba(65,166,246,0.18), transparent 45%), radial-gradient(ellipse at 50% 100%, rgba(177,62,83,0.25), transparent 55%)",
            mixBlendMode: "screen",
            zIndex: 5,
          }}
        />
        {[5, 9, 14, 17].map((tx, i) => (
          <div
            key={tx}
            className="pixel absolute font-pixel"
            style={{
              left: tx * TILE_PX + 1,
              top: 2 * TILE_PX + 1,
              width: TILE_PX - 2,
              height: TILE_PX - 2,
              background: glitch ? "#b13e53" : i % 2 === 0 ? "#41a6f6" : "#fee761",
              color: "#0e0e12",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 6,
              zIndex: 8,
              boxShadow: `0 0 6px ${glitch ? "#b13e53" : "#41a6f6"}`,
              animation: "glow-pulse 1.2s steps(4) infinite",
              animationDelay: `${i * 120}ms`,
            }}
          >
            38M
          </div>
        ))}
      </>
    ),
    [floor.width, floor.height, glitch],
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
