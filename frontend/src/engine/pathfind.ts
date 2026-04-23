import { TILE_PX } from "./constants";
import { isWalkable, type TileMap } from "./useCollision";

type Node = { x: number; y: number; g: number; f: number; parent?: Node };

/**
 * A* on the tile grid, 4-directional (no diagonal to keep motion readable).
 * Returns a list of pixel-centered waypoints (world coords), or [] if no path.
 */
export function aStar(map: TileMap, fromPx: { x: number; y: number }, toPx: { x: number; y: number }) {
  const sx = Math.floor(fromPx.x / TILE_PX);
  const sy = Math.floor(fromPx.y / TILE_PX);
  const tx = Math.floor(toPx.x / TILE_PX);
  const ty = Math.floor(toPx.y / TILE_PX);
  if (!isWalkable(map, tx, ty)) return [];
  if (sx === tx && sy === ty) return [{ x: toPx.x, y: toPx.y }];

  const open: Node[] = [{ x: sx, y: sy, g: 0, f: heuristic(sx, sy, tx, ty) }];
  const closed = new Set<string>();
  const key = (x: number, y: number) => `${x},${y}`;
  const bestG = new Map<string, number>([[key(sx, sy), 0]]);

  while (open.length) {
    // Pop lowest f. Linear scan is fine for tile grids this small.
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
    const cur = open.splice(bi, 1)[0];
    if (cur.x === tx && cur.y === ty) {
      const path: { x: number; y: number }[] = [];
      let n: Node | undefined = cur;
      while (n) {
        path.push({ x: n.x * TILE_PX + TILE_PX / 2, y: n.y * TILE_PX + TILE_PX / 2 });
        n = n.parent;
      }
      path.reverse();
      path[path.length - 1] = { x: toPx.x, y: toPx.y };
      return path;
    }
    closed.add(key(cur.x, cur.y));
    for (const [nx, ny] of [
      [cur.x + 1, cur.y],
      [cur.x - 1, cur.y],
      [cur.x, cur.y + 1],
      [cur.x, cur.y - 1],
    ]) {
      if (closed.has(key(nx, ny))) continue;
      if (!isWalkable(map, nx, ny)) continue;
      const g = cur.g + 1;
      const k = key(nx, ny);
      if (g >= (bestG.get(k) ?? Infinity)) continue;
      bestG.set(k, g);
      open.push({ x: nx, y: ny, g, f: g + heuristic(nx, ny, tx, ty), parent: cur });
    }
  }
  return [];
}

function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
