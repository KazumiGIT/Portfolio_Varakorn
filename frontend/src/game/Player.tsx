import { memo } from "react";

import {
  JUMP_ARC_PX,
  JUMP_DURATION_MS,
  JUMP_FRAMES,
  PLAYER_SPRITE_H,
  PLAYER_SPRITE_W,
  WALK_ANIM_FPS,
  type Direction,
} from "@/engine/constants";

const ROW_BY_DIR: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

type Props = {
  x: number;
  y: number;
  dir: Direction;
  moving: boolean;
  t: number;
  /** Seconds since last jump start, or null if not jumping. */
  jumpT: number | null;
  /** Damage iframe flash — inverts + desaturates the sprite briefly. */
  flashing?: boolean;
};

/**
 * Player sprite. Two atlases:
 *   - walk atlas (`/sprites/player/atlas.png`) for idle + 4-dir walk frames
 *   - jump atlas (`/sprites/player/jump.png`) with 6 horizontal frames
 * Jump temporarily overrides the rendered sheet and adds a sine-arc y offset.
 */
function PlayerImpl({ x, y, dir, moving, t, jumpT, flashing = false }: Props) {
  const damageFilter = flashing
    ? "brightness(2.3) saturate(0) drop-shadow(0 0 3px #ea4f36)"
    : undefined;
  const jumping = jumpT !== null && jumpT < JUMP_DURATION_MS / 1000;
  if (jumping && jumpT !== null) {
    const p = Math.min(1, jumpT / (JUMP_DURATION_MS / 1000));
    const frame = Math.min(JUMP_FRAMES - 1, Math.floor(p * JUMP_FRAMES));
    const arcY = -Math.sin(p * Math.PI) * JUMP_ARC_PX;
    return (
      <div
        className="pixel absolute pointer-events-none"
        style={{
          left: x - PLAYER_SPRITE_W / 2,
          top: y - PLAYER_SPRITE_H + arcY + 4,
          width: PLAYER_SPRITE_W,
          height: PLAYER_SPRITE_H,
          backgroundImage: "url(/sprites/player/jump.png)",
          backgroundPosition: `${-frame * PLAYER_SPRITE_W}px 0px`,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          zIndex: 50,
          transform: dir === "left" ? "scaleX(-1)" : undefined,
          filter: damageFilter,
        }}
      />
    );
  }

  const frame = moving ? 1 + (Math.floor(t * WALK_ANIM_FPS) % 2) : 0;
  const row = ROW_BY_DIR[dir];
  const bgX = -frame * PLAYER_SPRITE_W;
  const bgY = -row * PLAYER_SPRITE_H;
  const bobY = moving ? 0 : Math.floor((t * 2) % 2) === 0 ? 0 : -1;

  return (
    <div
      className="pixel absolute pointer-events-none"
      style={{
        left: x - PLAYER_SPRITE_W / 2,
        top: y - PLAYER_SPRITE_H + bobY + 4,
        width: PLAYER_SPRITE_W,
        height: PLAYER_SPRITE_H,
        backgroundImage: "url(/sprites/player/atlas.png)",
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        zIndex: 50,
        filter: damageFilter,
      }}
    />
  );
}

export const Player = memo(PlayerImpl);
