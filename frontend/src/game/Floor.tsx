import { memo } from "react";

import { TILE_PX } from "@/engine/constants";
import type { TileMap } from "@/engine/useCollision";

type Props = {
  map: TileMap;
  palette: string[];
  ambientOverlay?: React.ReactNode;
};

/**
 * 2.5D-styled dungeon tiles. Each wall tile is rendered as a block with a
 * top face (lighter, 3-4 px tall) and a front face (the tile's own space).
 * Floor tiles dither in a subtle checker for depth.
 *
 *   palette[0] = wall dark (top face of wall)
 *   palette[1] = wall mid (front face of wall)
 *   palette[2] = floor dark
 *   palette[3] = floor light
 *   palette[4] = accent (exit/door/rune highlights)
 */
function FloorImpl({ map, palette, ambientOverlay }: Props) {
  const wallTop = palette[0] ?? "#0e0e12";
  const wallFront = palette[1] ?? "#1a1c2c";
  const wallEdge = palette[2] ?? "#3e3546";
  const floorDark = palette[2] ?? "#3e3546";
  const floorLight = palette[3] ?? "#566c86";
  const exitColor = palette[4] ?? "#ffcd75";

  const cells: React.ReactNode[] = [];

  const isWall = (tx: number, ty: number) => {
    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return true;
    const t = map.tiles[ty * map.width + tx];
    return t === 1 || t === 2;
  };

  for (let ty = 0; ty < map.height; ty++) {
    for (let tx = 0; tx < map.width; tx++) {
      const t = map.tiles[ty * map.width + tx];
      const px = tx * TILE_PX;
      const py = ty * TILE_PX;
      const checker = (tx + ty) % 2 === 0;

      if (t === 1) {
        // Wall block. Cap (top face) only visible when tile below is a floor.
        const hasFloorBelow = !isWall(tx, ty + 1);
        cells.push(
          <div
            key={`${tx}-${ty}`}
            className="pixel absolute"
            style={{
              left: px,
              top: py,
              width: TILE_PX,
              height: TILE_PX,
              background: wallFront,
              boxShadow: `inset 0 0 0 1px ${wallTop}, inset -1px 1px 0 ${wallEdge}`,
            }}
          />,
        );
        if (hasFloorBelow) {
          // Top cap — a small highlight strip under the wall indicating depth.
          cells.push(
            <div
              key={`${tx}-${ty}-cap`}
              className="pixel absolute"
              style={{
                left: px,
                top: py + TILE_PX - 4,
                width: TILE_PX,
                height: 4,
                background: wallTop,
                boxShadow: `inset 0 1px 0 ${wallEdge}`,
                zIndex: 2,
              }}
            />,
          );
        }
        continue;
      }
      if (t === 2) {
        // Decor / non-walkable accent tile.
        cells.push(
          <div
            key={`${tx}-${ty}`}
            className="pixel absolute"
            style={{
              left: px,
              top: py,
              width: TILE_PX,
              height: TILE_PX,
              background: wallEdge,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.6)",
            }}
          />,
        );
        continue;
      }
      if (t === 3) {
        // Exit marker — same base as floor + tinted stripes.
        cells.push(
          <div
            key={`${tx}-${ty}`}
            className="pixel absolute"
            style={{
              left: px,
              top: py,
              width: TILE_PX,
              height: TILE_PX,
              background: floorDark,
              boxShadow: `inset 0 0 0 2px ${exitColor}`,
            }}
          />,
        );
        continue;
      }
      // Floor — checker dither + stipple dots for grit.
      const base = checker ? floorDark : floorLight;
      cells.push(
        <div
          key={`${tx}-${ty}`}
          className="pixel absolute"
          style={{
            left: px,
            top: py,
            width: TILE_PX,
            height: TILE_PX,
            background: base,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35)",
          }}
        />,
      );
      // 1-pixel stipple every few tiles for texture.
      if ((tx * 7 + ty * 13) % 17 === 0) {
        cells.push(
          <div
            key={`${tx}-${ty}-stip`}
            className="pixel absolute"
            style={{
              left: px + ((tx * 5) % (TILE_PX - 2)),
              top: py + ((ty * 3) % (TILE_PX - 2)),
              width: 1,
              height: 1,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1,
            }}
          />,
        );
      }
    }
  }

  return (
    <div
      className="absolute"
      style={{
        left: 0,
        top: 0,
        width: map.width * TILE_PX,
        height: map.height * TILE_PX,
      }}
    >
      {cells}
      {ambientOverlay}
    </div>
  );
}

export const Floor = memo(FloorImpl);
