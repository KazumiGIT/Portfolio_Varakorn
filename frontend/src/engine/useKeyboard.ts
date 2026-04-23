import { useEffect, useRef } from "react";

export type KeyState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  jump: boolean;
  attack: boolean;
  cancel: boolean;
};

const KEY_MAP: Record<string, keyof KeyState> = {
  w: "up",
  W: "up",
  ArrowUp: "up",
  s: "down",
  S: "down",
  ArrowDown: "down",
  a: "left",
  A: "left",
  ArrowLeft: "left",
  d: "right",
  D: "right",
  ArrowRight: "right",
  e: "interact",
  E: "interact",
  Enter: "interact",
  " ": "jump",
  Spacebar: "jump",
  f: "attack",
  F: "attack",
  j: "attack",
  J: "attack",
  Escape: "cancel",
};

/**
 * Returns a ref whose .current always reflects which movement/action keys are held.
 * Also fires onPress for the interact + cancel edges (not repeat).
 */
export function useKeyboard(
  onPress?: (k: "interact" | "cancel" | "jump" | "attack") => void,
) {
  const state = useRef<KeyState>({
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
    jump: false,
    attack: false,
    cancel: false,
  });
  const pressCb = useRef(onPress);
  pressCb.current = onPress;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const mapped = KEY_MAP[e.key];
      if (!mapped) return;
      if (
        mapped === "interact" ||
        mapped === "cancel" ||
        mapped === "jump" ||
        mapped === "attack"
      ) {
        if (!state.current[mapped]) pressCb.current?.(mapped);
      }
      state.current[mapped] = true;
      // Block default for arrow keys and space to avoid page scroll.
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      const mapped = KEY_MAP[e.key];
      if (!mapped) return;
      state.current[mapped] = false;
    };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    const blur = () => {
      for (const k of Object.keys(state.current) as (keyof KeyState)[]) {
        state.current[k] = false;
      }
    };
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return state;
}
