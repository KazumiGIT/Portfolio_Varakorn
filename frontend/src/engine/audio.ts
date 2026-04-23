import { Howl } from "howler";

/**
 * Thin SFX manager. Loaded lazily — if a file is missing, play is a no-op,
 * so the game never crashes waiting on assets. BGM hook exposed but muted
 * until the user hands over a playlist.
 */

type SfxName =
  | "click"
  | "interact"
  | "dialog-open"
  | "dialog-beep"
  | "footstep"
  | "door-open"
  | "portal"
  | "contact-send"
  | "jump"
  | "land";

const MANIFEST: Record<SfxName, string> = {
  click: "/audio/click.ogg",
  interact: "/audio/interact.ogg",
  "dialog-open": "/audio/dialog-open.ogg",
  "dialog-beep": "/audio/dialog-beep.ogg",
  footstep: "/audio/footstep.ogg",
  "door-open": "/audio/door-open.ogg",
  portal: "/audio/portal.ogg",
  "contact-send": "/audio/contact-send.ogg",
  jump: "/audio/jump.ogg",
  land: "/audio/land.ogg",
};

const cache = new Map<SfxName, Howl>();
let muted = false;

export function setMuted(m: boolean): void {
  muted = m;
}
export function isMuted(): boolean {
  return muted;
}

export function play(name: SfxName, opts?: { volume?: number; rate?: number }): void {
  if (muted) return;
  let h = cache.get(name);
  if (!h) {
    h = new Howl({
      src: [MANIFEST[name]],
      volume: opts?.volume ?? 0.4,
      rate: opts?.rate ?? 1,
      preload: true,
      onloaderror: () => {
        // Silent — file not yet in /public/audio.
      },
    });
    cache.set(name, h);
  }
  try {
    h.volume(opts?.volume ?? h.volume());
    h.rate(opts?.rate ?? 1);
    h.play();
  } catch {
    // Swallow — audio is best-effort.
  }
}

let footstepCooldown = 0;
export function tickFootstep(dt: number, moving: boolean): void {
  footstepCooldown -= dt;
  if (moving && footstepCooldown <= 0) {
    play("footstep", { volume: 0.2, rate: 0.9 + Math.random() * 0.2 });
    footstepCooldown = 0.28;
  }
}
