import type { TileMap } from "@/engine/useCollision";

/**
 * Builds a room with solid walls around the perimeter and an open interior.
 * `openings` adds walkable holes in the wall for exits.
 */
export function rectRoom(
  width: number,
  height: number,
  openings: { x: number; y: number }[] = [],
): TileMap {
  const tiles: number[] = new Array(width * height).fill(0);
  for (let x = 0; x < width; x++) {
    tiles[0 * width + x] = 1;
    tiles[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    tiles[y * width + 0] = 1;
    tiles[y * width + (width - 1)] = 1;
  }
  for (const o of openings) {
    if (o.x >= 0 && o.x < width && o.y >= 0 && o.y < height) {
      tiles[o.y * width + o.x] = 3;
    }
  }
  return { width, height, tiles };
}

/** Set a specific tile. Mutates in place. */
export function setTile(map: TileMap, x: number, y: number, v: number): void {
  if (x >= 0 && y >= 0 && x < map.width && y < map.height) {
    map.tiles[y * map.width + x] = v;
  }
}

/** Solid rectangle (wall). */
export function fillRect(map: TileMap, x: number, y: number, w: number, h: number, v = 1): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setTile(map, x + dx, y + dy, v);
    }
  }
}
