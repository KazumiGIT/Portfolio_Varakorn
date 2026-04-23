import { useEffect, useRef } from "react";

/**
 * Fixed-timestep-ish game loop using requestAnimationFrame.
 * Passes delta seconds to the callback. Pauses on tab blur.
 */
export function useGameLoop(tick: (dt: number) => void, paused = false): void {
  const cbRef = useRef(tick);
  cbRef.current = tick;

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let prev = performance.now();
    let alive = true;

    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - prev) / 1000); // clamp to 50ms to avoid tunneling
      prev = now;
      cbRef.current(dt);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    const onVis = () => {
      prev = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [paused]);
}
