import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { play, tickFootstep } from "@/engine/audio";
import { aabbOverlap, attackHitbox, type EnemyRuntime } from "@/engine/combat";
import {
  ATTACK_COOLDOWN_MS,
  ATTACK_DURATION_MS,
  ENEMY_CHASE_RADIUS_PX,
  ENEMY_SIZE,
  ENEMY_TOUCH_RADIUS_PX,
  INTERACT_RADIUS,
  INTERNAL_H,
  INTERNAL_W,
  JUMP_DURATION_MS,
  PLAYER_COLLIDER_H,
  PLAYER_COLLIDER_W,
  PLAYER_IFRAME_MS,
  PLAYER_KNOCKBACK_PX,
  TILE_PX,
  type Direction,
} from "@/engine/constants";
import { aStar } from "@/engine/pathfind";
import { distanceBetween, resolveMove, type TileMap } from "@/engine/useCollision";
import { useGameLoop } from "@/engine/useGameLoop";
import { useKeyboard } from "@/engine/useKeyboard";
import {
  intentFromKeys,
  stepPlayer,
  usePlayerState,
  type PlayerState,
} from "@/engine/usePlayerMovement";
import { useGame } from "@/stores/gameStore";
import type { Floor as FloorData, Interactable as IData } from "@/types/game";

import { Chest } from "./Chest";
import { Enemy } from "./Enemy";
import { Floor } from "./Floor";
import { Player } from "./Player";
import { TorchMask } from "./TorchMask";

type Props = {
  floor: FloorData;
  tileMap: TileMap;
  ambientOverlay?: React.ReactNode;
  onExit?: (toFloorId: number) => void;
};

/**
 * Top-level playfield. Owns player position, enemy runtimes, combat, and
 * camera. Chests drive story dialogs; portals honor soft gates; enemies do
 * touch damage and can be cleared with F / J attack swings.
 */
export function Dungeon({ floor, tileMap, ambientOverlay, onExit }: Props) {
  const spawnPx = {
    x: floor.spawn[0] * TILE_PX + TILE_PX / 2,
    y: floor.spawn[1] * TILE_PX + TILE_PX / 2,
  };
  const player = usePlayerState({ x: spawnPx.x, y: spawnPx.y, dir: "down" });
  const path = useRef<{ x: number; y: number }[]>([]);
  const tAccum = useRef(0);
  const jumpElapsed = useRef<number | null>(null);
  const [, force] = useState(0);

  // Combat refs (don't want to tear down on re-render).
  const enemiesRef = useRef<EnemyRuntime[]>([]);
  const attackRef = useRef<{ startedAt: number; dir: Direction; hit: Set<string> } | null>(null);
  const lastAttackAt = useRef(0);
  const iframesUntil = useRef(0);
  const playerKnockback = useRef<{ vx: number; vy: number; until: number } | null>(null);

  const openDialog = useGame((s) => s.openDialog);
  const closeDialog = useGame((s) => s.closeDialog);
  const skipDialog = useGame((s) => s.skipDialogTypewriter);
  const markInteracted = useGame((s) => s.markInteracted);
  const isInteracted = useGame((s) => s.isInteracted);
  const dialogOpen = useGame((s) => s.dialog.open);
  const openContact = useGame((s) => s.openContact);
  const damagePlayer = useGame((s) => s.damagePlayer);
  const markEnemyDefeated = useGame((s) => s.markEnemyDefeated);
  const isEnemyDefeated = useGame((s) => s.isEnemyDefeated);
  const playerHp = useGame((s) => s.playerHp);
  const deathOverlayOpen = useGame((s) => s.deathOverlayOpen);

  // Rebuild enemy runtimes when the floor changes.
  useEffect(() => {
    enemiesRef.current = floor.interactables
      .filter((i) => i.kind === "enemy")
      .map<EnemyRuntime>((i) => {
        const id = i.id;
        const defeated = isEnemyDefeated(id);
        return {
          id,
          x: i.x * TILE_PX + TILE_PX / 2,
          y: i.y * TILE_PX + TILE_PX / 2,
          hp: Number(i.meta?.hp ?? 2),
          maxHp: Number(i.meta?.hp ?? 2),
          speed: Number(i.meta?.speed ?? 32),
          damage: Number(i.meta?.damage ?? 1),
          species: String(i.meta?.species ?? "slime"),
          facing: "down",
          flashUntil: 0,
          knockback: null,
          dead: defeated,
        };
      });
    path.current = [];
    player.current.x = spawnPx.x;
    player.current.y = spawnPx.y;
    // Clear combat transients.
    attackRef.current = null;
    iframesUntil.current = 0;
    playerKnockback.current = null;
  }, [floor.id, floor.interactables, isEnemyDefeated, player, spawnPx.x, spawnPx.y]);

  // Nearest non-enemy interactable for [E] prompt.
  const nearest = useNearestNonEnemy(player.current, floor.interactables);

  const tryInteract = useCallback(() => {
    if (!nearest) return;
    if (nearest.kind === "portal_locked") {
      const required = floor.soft_gate_required ?? [];
      const interactedState = useGame.getState().interacted;
      const interactedAll =
        required.length > 0 && required.every((id) => interactedState.has(id));
      if (!interactedAll) {
        play("interact");
        play("dialog-open");
        openDialog(nearest); // shows "Portal Sealed" body
        return;
      }
      // Unlocked — teleport like a normal portal.
      play("portal", { volume: 0.55, rate: 0.95 });
      play("door-open");
      const to = Number(nearest.meta?.to_floor);
      if (!Number.isNaN(to) && to > 0 && onExit) onExit(to);
      return;
    }
    if (nearest.kind === "portal_entrance") {
      play("portal", { volume: 0.55, rate: 1 });
      play("door-open");
      const to = Number(nearest.meta?.to_floor);
      if (!Number.isNaN(to) && to >= 0 && onExit) onExit(to);
      return;
    }
    if (nearest.kind === "chest_contact") {
      markInteracted(nearest.id, true);
      play("interact");
      play("dialog-open");
      openContact();
      return;
    }
    if (nearest.kind === "chest") {
      markInteracted(nearest.id, true);
      play("interact");
      play("dialog-open");
      openDialog(nearest);
      return;
    }
    // Fallback: open dialog for any unknown content.
    markInteracted(nearest.id, true);
    play("dialog-open");
    openDialog(nearest);
  }, [nearest, floor.soft_gate_required, markInteracted, openDialog, openContact, onExit]);

  const tryAttack = useCallback(() => {
    const now = performance.now();
    if (now - lastAttackAt.current < ATTACK_COOLDOWN_MS) return;
    if (dialogOpen || deathOverlayOpen) return;
    lastAttackAt.current = now;
    attackRef.current = {
      startedAt: now,
      dir: player.current.dir,
      hit: new Set(),
    };
    play("interact", { volume: 0.35, rate: 1.4 });
  }, [dialogOpen, deathOverlayOpen, player]);

  const startJump = useCallback(() => {
    if (jumpElapsed.current !== null) return;
    jumpElapsed.current = 0;
    play("jump", { volume: 0.28, rate: 1.1 });
  }, []);

  const keys = useKeyboard((k) => {
    if (k === "jump") {
      if (!useGame.getState().dialog.open) startJump();
      return;
    }
    if (k === "attack") {
      tryAttack();
      return;
    }
    if (k === "interact") {
      const d = useGame.getState().dialog;
      if (d.open) {
        if (!d.complete) skipDialog();
        else closeDialog();
        return;
      }
      tryInteract();
      return;
    }
    if (k === "cancel") {
      if (useGame.getState().dialog.open) closeDialog();
    }
  });

  // Mouse click pathing.
  const containerRef = useRef<HTMLDivElement>(null);
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (dialogOpen || deathOverlayOpen) return;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scale = rect.width / (floor.width * TILE_PX);
      const worldX = (e.clientX - rect.left) / scale;
      const worldY = (e.clientY - rect.top) / scale;
      path.current = aStar(tileMap, player.current, { x: worldX, y: worldY });
    },
    [dialogOpen, deathOverlayOpen, floor.width, tileMap, player],
  );

  useGameLoop((dt) => {
    tAccum.current += dt;
    if (dialogOpen || deathOverlayOpen) {
      player.current.moving = false;
      force((n) => n + 1);
      return;
    }

    // --- Player movement --------------------------------------------------
    let intent = intentFromKeys(keys.current);
    if (path.current.length > 0 && intent.dx === 0 && intent.dy === 0) {
      const wp = path.current[0];
      const dx = wp.x - player.current.x;
      const dy = wp.y - player.current.y;
      const d = Math.hypot(dx, dy);
      if (d < 2) path.current.shift();
      else intent = { dx: dx / d, dy: dy / d };
    } else if (intent.dx !== 0 || intent.dy !== 0) {
      path.current = [];
    }

    // Knockback overrides intent for its duration.
    const now = performance.now();
    if (playerKnockback.current && playerKnockback.current.until > now) {
      const k = playerKnockback.current;
      stepKnockback(player.current, k.vx * dt, k.vy * dt, tileMap);
    } else {
      playerKnockback.current = null;
      stepPlayer(player.current, intent, dt, tileMap);
    }
    tickFootstep(dt, player.current.moving && jumpElapsed.current === null);

    // Jump timer.
    if (jumpElapsed.current !== null) {
      jumpElapsed.current += dt;
      if (jumpElapsed.current >= JUMP_DURATION_MS / 1000) {
        jumpElapsed.current = null;
        play("land", { volume: 0.22 });
      }
    }

    // --- Enemy AI + combat ------------------------------------------------
    for (const e of enemiesRef.current) {
      if (e.dead) continue;
      const dx = player.current.x - e.x;
      const dy = player.current.y - e.y;
      const dist = Math.hypot(dx, dy) || 0.0001;

      // Chase if in sight.
      if (e.knockback && e.knockback.until > now) {
        const kk = e.knockback;
        const step = { x: e.x + kk.vx * dt, y: e.y + kk.vy * dt };
        const clamped = resolveMove(
          tileMap,
          { x: e.x - ENEMY_SIZE / 2, y: e.y - ENEMY_SIZE / 2, w: ENEMY_SIZE, h: ENEMY_SIZE },
          kk.vx * dt,
          kk.vy * dt,
        );
        e.x = clamped.x + ENEMY_SIZE / 2;
        e.y = clamped.y + ENEMY_SIZE / 2;
        void step; // suppress unused
      } else {
        e.knockback = null;
        if (dist < ENEMY_CHASE_RADIUS_PX) {
          const nx = dx / dist;
          const ny = dy / dist;
          const ds = e.speed * dt;
          const clamped = resolveMove(
            tileMap,
            { x: e.x - ENEMY_SIZE / 2, y: e.y - ENEMY_SIZE / 2, w: ENEMY_SIZE, h: ENEMY_SIZE },
            nx * ds,
            ny * ds,
          );
          e.x = clamped.x + ENEMY_SIZE / 2;
          e.y = clamped.y + ENEMY_SIZE / 2;
          e.facing = Math.abs(nx) >= Math.abs(ny) ? (nx > 0 ? "right" : "left") : ny > 0 ? "down" : "up";
        }
      }

      // Contact damage.
      if (dist < ENEMY_TOUCH_RADIUS_PX && now > iframesUntil.current) {
        damagePlayer(e.damage);
        iframesUntil.current = now + PLAYER_IFRAME_MS;
        const kx = dx / dist;
        const ky = dy / dist;
        playerKnockback.current = {
          vx: -kx * PLAYER_KNOCKBACK_PX * 4,
          vy: -ky * PLAYER_KNOCKBACK_PX * 4,
          until: now + 140,
        };
        play("interact", { volume: 0.4, rate: 0.7 });
      }
    }

    // Active attack hitbox.
    if (attackRef.current) {
      const a = attackRef.current;
      if (now - a.startedAt > ATTACK_DURATION_MS) {
        attackRef.current = null;
      } else {
        const hb = attackHitbox(player.current.x, player.current.y, a.dir);
        for (const e of enemiesRef.current) {
          if (e.dead) continue;
          if (a.hit.has(e.id)) continue;
          const ex = e.x - ENEMY_SIZE / 2;
          const ey = e.y - ENEMY_SIZE / 2;
          if (aabbOverlap(hb.x, hb.y, hb.w, hb.h, ex, ey, ENEMY_SIZE, ENEMY_SIZE)) {
            e.hp -= 1;
            e.flashUntil = now + 120;
            a.hit.add(e.id);
            const ndx = e.x - player.current.x;
            const ndy = e.y - player.current.y;
            const nd = Math.hypot(ndx, ndy) || 1;
            e.knockback = {
              vx: (ndx / nd) * PLAYER_KNOCKBACK_PX * 8,
              vy: (ndy / nd) * PLAYER_KNOCKBACK_PX * 8,
              until: now + 160,
            };
            play("interact", { volume: 0.5, rate: 1.8 });
            if (e.hp <= 0) {
              e.dead = true;
              markEnemyDefeated(e.id);
              play("door-open", { volume: 0.3, rate: 1.4 });
            }
          }
        }
      }
    }

    force((n) => n + 1);
  }, false);

  const camX = useMemo(
    () =>
      Math.max(
        0,
        Math.min(floor.width * TILE_PX - INTERNAL_W, player.current.x - INTERNAL_W / 2),
      ),
    [player.current.x, floor.width],
  );
  const camY = useMemo(
    () =>
      Math.max(
        0,
        Math.min(floor.height * TILE_PX - INTERNAL_H, player.current.y - INTERNAL_H / 2),
      ),
    [player.current.y, floor.height],
  );

  const gateRequired = floor.soft_gate_required ?? [];
  const gateOpen =
    gateRequired.length === 0 ||
    gateRequired.every((id) => useGame.getState().interacted.has(id));

  // Flash the player sprite during iframes for damage feedback.
  const playerFlashing = performance.now() < iframesUntil.current;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onClick={onClick}
      style={{ cursor: "crosshair" }}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${-camX}px, ${-camY}px)`,
          width: floor.width * TILE_PX,
          height: floor.height * TILE_PX,
        }}
      >
        <Floor map={tileMap} palette={floor.palette} ambientOverlay={ambientOverlay} />

        {/* Interactables other than enemies. */}
        {floor.interactables
          .filter((i) => i.kind !== "enemy")
          .map((i) => {
            const inRange = nearest?.id === i.id;
            const looted = isInteracted(i.id);
            if (i.kind === "chest" || i.kind === "chest_contact") {
              return (
                <Chest
                  key={i.id}
                  data={i}
                  inRange={inRange}
                  looted={looted}
                  t={tAccum.current}
                />
              );
            }
            // Portals rendered as accent-colored blocks with glow.
            return (
              <PortalSprite
                key={i.id}
                data={i}
                inRange={inRange}
                locked={i.kind === "portal_locked" && !gateOpen}
                t={tAccum.current}
              />
            );
          })}

        {/* Enemy runtimes. */}
        {enemiesRef.current.map((e) => (
          <Enemy key={e.id} e={e} t={tAccum.current} />
        ))}

        {/* Attack swing visual. */}
        {attackRef.current && (
          <AttackSwing
            px={player.current.x}
            py={player.current.y}
            dir={attackRef.current.dir}
          />
        )}

        <Player
          x={player.current.x}
          y={player.current.y}
          dir={player.current.dir}
          moving={player.current.moving}
          t={tAccum.current}
          jumpT={jumpElapsed.current}
          flashing={playerFlashing}
        />
      </div>
      <TorchMask
        px={player.current.x}
        py={player.current.y}
        camX={camX}
        camY={camY}
        t={tAccum.current}
        progress={useGame.getState().lightProgress()}
      />
      {playerHp === 0 && <div className="absolute inset-0 bg-black/60" />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Local helpers                                                               */
/* -------------------------------------------------------------------------- */

function useNearestNonEnemy(player: PlayerState, list: IData[]): IData | null {
  let best: IData | null = null;
  let bestD = Infinity;
  for (const i of list) {
    if (i.kind === "enemy") continue;
    const cx = i.x * TILE_PX + (i.w * TILE_PX) / 2;
    const cy = i.y * TILE_PX + (i.h * TILE_PX) / 2;
    const d = distanceBetween(player.x, player.y, cx, cy);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best && bestD <= INTERACT_RADIUS ? best : null;
}

function stepKnockback(p: PlayerState, dx: number, dy: number, map: TileMap): void {
  const rect = {
    x: p.x - PLAYER_COLLIDER_W / 2,
    y: p.y - PLAYER_COLLIDER_H / 2,
    w: PLAYER_COLLIDER_W,
    h: PLAYER_COLLIDER_H,
  };
  const next = resolveMove(map, rect, dx, dy);
  p.x = next.x + PLAYER_COLLIDER_W / 2;
  p.y = next.y + PLAYER_COLLIDER_H / 2;
}

function AttackSwing({ px, py, dir }: { px: number; py: number; dir: Direction }) {
  const hb = attackHitbox(px, py, dir);
  return (
    <div
      className="pixel absolute pointer-events-none"
      style={{
        left: hb.x,
        top: hb.y,
        width: hb.w,
        height: hb.h,
        background: "rgba(254,231,97,0.55)",
        border: "1px solid #ffcd75",
        boxShadow: "0 0 6px #ffcd75",
        zIndex: 52,
      }}
    />
  );
}

function PortalSprite({
  data,
  inRange,
  locked,
  t,
}: {
  data: IData;
  inRange: boolean;
  locked: boolean;
  t: number;
}) {
  const x = data.x * TILE_PX;
  const y = data.y * TILE_PX;
  const w = data.w * TILE_PX;
  const h = data.h * TILE_PX;
  const accent = locked ? "#566c86" : data.accent ?? "#b13e53";
  const pulse = (Math.sin(t * 3) + 1) * 0.5;
  return (
    <div
      className="pixel absolute"
      style={{ left: x, top: y, width: w, height: h, zIndex: 18 }}
    >
      <div
        className="absolute"
        style={{
          inset: 0,
          background: locked ? "#1a1c2c" : "#0e0e12",
          border: `2px solid ${accent}`,
          boxShadow: locked
            ? "inset 0 0 6px rgba(0,0,0,0.6)"
            : `inset 0 0 ${6 + pulse * 6}px ${accent}, 0 0 ${6 + pulse * 10}px ${accent}`,
        }}
      />
      {/* Swirl stripes */}
      {!locked && (
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 3,
            background:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 4px)",
            animation: "idle-bob 400ms steps(4) infinite",
          }}
        />
      )}
      {locked && (
        <div
          className="absolute font-pixel"
          style={{
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b13e53",
            fontSize: 10,
          }}
        >
          ⍂
        </div>
      )}
      {inRange && (
        <div
          className="absolute font-pixel no-select"
          style={{
            left: w / 2,
            top: -9,
            transform: "translate(-50%, -100%)",
            background: "#0e0e12",
            border: `1px solid ${accent}`,
            color: "#f4f0bc",
            padding: "1px 3px",
            fontSize: 5,
            lineHeight: "7px",
            whiteSpace: "nowrap",
            zIndex: 25,
            animation: "idle-bob 500ms steps(2) infinite",
          }}
        >
          <span style={{ color: accent }}>E</span>{" "}
          {locked ? "SEALED" : "ENTER"}
        </div>
      )}
    </div>
  );
}
