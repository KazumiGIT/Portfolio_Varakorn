import { TILE_PX } from "./constants";

export type TileMap = {
  width: number; // tile columns
  height: number; // tile rows
  /** 0 = walkable floor, 1 = wall, 2 = wall-hole decor, 3 = door/exit (walkable) */
  tiles: number[];
};

export type Rect = { x: number; y: number; w: number; h: number };

export function tileAt(map: TileMap, tx: number, ty: number): number {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return 1;
  return map.tiles[ty * map.width + tx] ?? 1;
}

export function isWalkable(map: TileMap, tx: number, ty: number): boolean {
  const t = tileAt(map, tx, ty);
  return t === 0 || t === 3;
}

/** Swept AABB against tile grid. Returns clamped next position. */
export function resolveMove(map: TileMap, rect: Rect, dx: number, dy: number): { x: number; y: number } {
  let x = rect.x + dx;
  let y = rect.y;
  if (collides(map, { x, y, w: rect.w, h: rect.h })) {
    x = rect.x;
  }
  y = y + dy;
  if (collides(map, { x, y, w: rect.w, h: rect.h })) {
    y = rect.y;
  }
  return { x, y };
}

export function collides(map: TileMap, rect: Rect): boolean {
  const minTX = Math.floor(rect.x / TILE_PX);
  const minTY = Math.floor(rect.y / TILE_PX);
  const maxTX = Math.floor((rect.x + rect.w - 1) / TILE_PX);
  const maxTY = Math.floor((rect.y + rect.h - 1) / TILE_PX);
  for (let ty = minTY; ty <= maxTY; ty++) {
    for (let tx = minTX; tx <= maxTX; tx++) {
      if (!isWalkable(map, tx, ty)) return true;
    }
  }
  return false;
}

export function rectOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function distanceBetween(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}
