// ---------------------------------------------------------------------------
// Trading-card artwork: a tiny rotating 3D object inside each card's art
// window. Same toon language as everything else. No interaction — the card
// itself handles tilt/flip; this just breathes.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { createStage, warmLights, makeDust } from './core.js';
import { buildCamera, buildMonitor, buildSparkles } from './objects.js';

const KINDS = {
  camera: {
    build: () => {
      const g = buildCamera(2.0);
      g.position.y = 0.05;
      return g;
    },
    spin: 0.45,
  },
  monitor: {
    build: () => {
      const g = buildMonitor();
      g.scale.setScalar(1.05);
      g.position.y = -0.42;
      return g;
    },
    spin: 0.35,
  },
  stars: {
    build: () => {
      const g = buildSparkles();
      g.scale.setScalar(0.85);
      return g;
    },
    spin: 0.25,
  },
};

export function mountCardArt(canvas, kind) {
  const cfg = KINDS[kind];
  if (!cfg) return null;

  const stage = createStage(canvas, {
    fov: 32,
    camPos: [0, 0.35, 3.1],
    lookAt: [0, 0.05, 0],
    fogNear: 6,
    fogFar: 11,
  });
  warmLights(stage.scene, { hemiIntensity: 1.35 });

  const subject = cfg.build();
  stage.scene.add(subject);

  const dust = makeDust(10, [2.4, 2, 2]);
  dust.points.position.y = -0.6;
  stage.scene.add(dust.points);

  stage.onFrame((dt, t) => {
    subject.rotation.y = Math.sin(t * cfg.spin) * 0.55;
    subject.position.y += Math.sin(t * 0.9) * 0.0006;

    // monitor screen keeps scrolling; stars keep twinkling
    if (subject.userData.screenTex) subject.userData.screenTex.offset.y = (t * 0.045) % 1;
    if (subject.userData.stars) {
      subject.userData.stars.forEach((s) => {
        const k = 1 + Math.sin(t * 2.2 + s.userData.twinkle.phase) * 0.18;
        s.scale.setScalar(k);
        s.rotation.z = Math.sin(t * 0.6 + s.userData.twinkle.phase) * 0.2;
      });
    }

    dust.update(dt, t);
  });

  stage.start();
  return stage;
}
