import { useRef } from "react";

import {
  PLAYER_COLLIDER_H,
  PLAYER_COLLIDER_W,
  PLAYER_SPEED,
  type Direction,
} from "./constants";
import { resolveMove, type TileMap } from "./useCollision";
import type { KeyState } from "./useKeyboard";

export type PlayerState = {
  x: number;
  y: number;
  dir: Direction;
  moving: boolean;
};

/**
 * Holds the mutable player position. Movement is smooth (pixels/sec), driven by
 * either held keys or a pathfinding target. The store itself is a ref to avoid
 * per-frame re-renders — subscribers pull via getter.
 */
export function usePlayerState(initial: { x: number; y: number; dir?: Direction }) {
  return useRef<PlayerState>({
    x: initial.x,
    y: initial.y,
    dir: initial.dir ?? "down",
    moving: false,
  });
}

export type MoveIntent = { dx: number; dy: number };

export function intentFromKeys(k: KeyState): MoveIntent {
  const dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  const dy = (k.down ? 1 : 0) - (k.up ? 1 : 0);
  return { dx, dy };
}

export function stepPlayer(
  player: PlayerState,
  intent: MoveIntent,
  dt: number,
  map: TileMap,
): PlayerState {
  let { dx, dy } = intent;
  const mag = Math.hypot(dx, dy);
  if (mag > 0) {
    dx /= mag;
    dy /= mag;
  }
  const ds = PLAYER_SPEED * dt;
  const rect = {
    x: player.x - PLAYER_COLLIDER_W / 2,
    y: player.y - PLAYER_COLLIDER_H / 2,
    w: PLAYER_COLLIDER_W,
    h: PLAYER_COLLIDER_H,
  };
  const next = resolveMove(map, rect, dx * ds, dy * ds);
  player.x = next.x + PLAYER_COLLIDER_W / 2;
  player.y = next.y + PLAYER_COLLIDER_H / 2;

  // Direction priority: horizontal first unless only vertical input.
  if (Math.abs(dx) > 0.001 && Math.abs(dx) >= Math.abs(dy)) {
    player.dir = dx > 0 ? "right" : "left";
  } else if (Math.abs(dy) > 0.001) {
    player.dir = dy > 0 ? "down" : "up";
  }
  player.moving = mag > 0;
  return player;
}
