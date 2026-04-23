/** Engine-wide constants. Tune in one place. */

export const TILE_PX = 16;
export const RENDER_SCALE = 3;
export const PLAYER_SPRITE_W = 32;
export const PLAYER_SPRITE_H = 48;

export const INTERNAL_W = 320;
export const INTERNAL_H = 180;

export const PLAYER_SPEED = 180;
export const PLAYER_COLLIDER_W = 10;
export const PLAYER_COLLIDER_H = 8;

export const TORCH_RADIUS_MIN = 56;
export const TORCH_RADIUS_MAX = 360;
export const TORCH_ALPHA_MIN = 0.12;
export const TORCH_ALPHA_MAX = 0.985;
export const TORCH_FLICKER_HZ = 5;
export const TORCH_FLICKER_AMP = 4;
/** Kept for any legacy callers — prefer the MIN/MAX constants above. */
export const TORCH_RADIUS = TORCH_RADIUS_MIN;
export const PERIPHERAL_RADIUS = 0;

export const INTERACT_RADIUS = 22;
export const WALK_ANIM_FPS = 8;
export const IDLE_BOB_MS = 500;

// Jump tuning
export const JUMP_FRAMES = 6;
export const JUMP_DURATION_MS = 620;
export const JUMP_ARC_PX = 12;

// Combat tuning
export const ATTACK_DURATION_MS = 260;
export const ATTACK_COOLDOWN_MS = 320;
export const ATTACK_RANGE_PX = 18;
export const ATTACK_HITBOX_W = 20;
export const ATTACK_HITBOX_H = 14;
export const PLAYER_DAMAGE = 1;
export const PLAYER_IFRAME_MS = 700;
export const PLAYER_KNOCKBACK_PX = 14;
export const ENEMY_CHASE_RADIUS_PX = 90;
export const ENEMY_TOUCH_RADIUS_PX = 12;
export const ENEMY_SIZE = 14;

export type Direction = "up" | "down" | "left" | "right";
