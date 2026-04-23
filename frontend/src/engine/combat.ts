import {
  ATTACK_HITBOX_H,
  ATTACK_HITBOX_W,
  ATTACK_RANGE_PX,
  type Direction,
} from "./constants";

export type EnemyRuntime = {
  id: string;
  x: number; // pixel center
  y: number;
  hp: number;
  maxHp: number;
  speed: number; // pixels per second
  damage: number;
  species: string;
  facing: Direction;
  flashUntil: number; // performance.now when damage flash ends
  knockback: { vx: number; vy: number; until: number } | null;
  dead: boolean;
};

export type AttackState = {
  active: boolean;
  startedAt: number; // performance.now when swing began
  dir: Direction;
  hitEnemyIds: Set<string>;
};

export function attackHitbox(px: number, py: number, dir: Direction) {
  const w = ATTACK_HITBOX_W;
  const h = ATTACK_HITBOX_H;
  const r = ATTACK_RANGE_PX;
  switch (dir) {
    case "right":
      return { x: px + 2, y: py - h / 2, w: r, h };
    case "left":
      return { x: px - r - 2, y: py - h / 2, w: r, h };
    case "up":
      return { x: px - w / 2, y: py - r - 2, w, h: r };
    case "down":
    default:
      return { x: px - w / 2, y: py + 2, w, h: r };
  }
}

export function aabbOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
