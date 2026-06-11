// ---------------------------------------------------------------------------
// Small floating dioramas for the subpage headers. Same toon language as the
// hero: one key object, dust, soft shadow, drag-to-spin, tap-to-nudge.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import {
  PALETTE as P,
  toon,
  outline,
  blobShadow,
  makeDust,
  glyphSprite,
  rand,
  createStage,
  spinController,
  popIn,
  warmLights,
} from './core.js';
import { buildTorii, buildCamera } from './objects.js';

/** Shared mount: floating object + dust + shadow + spin. */
function mountAccent(canvas, buildFn, opts = {}) {
  const {
    camPos = [0, 0.9, 5.4],
    lookAt = [0, 0.55, 0],
    fov = 34,
    yawRange = 0.9,
    baseYaw = -0.25,
    bobAmp = 0.09,
    shadowY = -1.35,
    shadowR = 2.1,
    onFrame,
  } = opts;

  const stage = createStage(canvas, { fov, camPos, lookAt, fogNear: 7, fogFar: 13 });
  const { scene } = stage;
  warmLights(scene);

  const world = new THREE.Group();
  scene.add(world);

  const subject = buildFn();
  world.add(subject);

  const shadow = blobShadow(shadowR, 0.35);
  shadow.position.y = shadowY;
  scene.add(shadow);

  const dust = makeDust(34, [5, 3.6, 4]);
  scene.add(dust.points);

  const pop = popIn([{ obj: subject, delay: 0.1 }], 0.9);
  const spin = spinController(stage, world, { yawRange, pitchRange: 0.12, baseYaw });

  canvas.addEventListener('pointerup', () => {
    if (spin.dragDistance() < 9) spin.nudge(0.35);
  });

  stage.onResize((aspect) => {
    world.scale.setScalar(aspect < 0.9 ? 0.82 : 1);
  });

  let lastScroll = window.scrollY;
  stage.onFrame((dt, t) => {
    pop.update(dt);
    spin.update(dt);
    subject.position.y = Math.sin(t * 0.9) * bobAmp;
    // scrolling gives the subject a gentle push
    const sy = window.scrollY;
    spin.nudge((sy - lastScroll) * 0.0011);
    lastScroll = sy;
    dust.update(dt, t);
    onFrame?.(dt, t, subject);
  });

  stage.start();
  return stage;
}

// --- journey: vermilion torii over floating stones --------------------------
export function mountToriiScene(canvas) {
  return mountAccent(canvas, () => buildTorii({ stones: true }), {
    camPos: [0.4, 1.0, 5.6],
    lookAt: [0, 0.62, 0],
    baseYaw: -0.3,
    onFrame: (dt, t, subject) => {
      subject.children.forEach((c) => {
        if (c.userData.float) {
          c.position.y = c.userData.float.y + Math.sin(t * 1.1 + c.userData.float.phase) * 0.07;
          c.rotation.y += dt * 0.08;
        }
      });
    },
  });
}

// --- experience: the camera that earned 38M views ---------------------------
function buildCameraRig() {
  const grp = new THREE.Group();
  const cam = buildCamera(2.6);
  cam.rotation.y = -0.4;
  cam.position.y = 0.35;
  grp.add(cam);

  // floating "frames" — little photos drifting around the lens
  const frameMat = toon(0xfaf3e2);
  const photos = [];
  for (let i = 0; i < 3; i++) {
    const photo = new THREE.Group();
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.015), frameMat);
    photo.add(card);
    const img = new THREE.Mesh(
      new THREE.PlaneGeometry(0.34, 0.34),
      toon([P.green, P.gold, P.blue][i])
    );
    img.position.set(0, 0.05, 0.01);
    photo.add(img);
    const angle = (i / 3) * Math.PI * 2;
    photo.userData.orbit = { angle, r: 1.45, speed: 0.25 + i * 0.06, h: 0.45 + i * 0.22 };
    photos.push(photo);
    grp.add(photo);
  }
  grp.userData.photos = photos;
  return grp;
}

export function mountCameraScene(canvas) {
  return mountAccent(canvas, buildCameraRig, {
    camPos: [0.3, 0.85, 5.2],
    lookAt: [0, 0.45, 0],
    baseYaw: 0.15,
    onFrame: (dt, t, subject) => {
      subject.userData.photos.forEach((p) => {
        const o = p.userData.orbit;
        o.angle += dt * o.speed;
        p.position.set(Math.cos(o.angle) * o.r, o.h + Math.sin(t + o.angle) * 0.08, Math.sin(o.angle) * o.r * 0.6);
        p.rotation.y = Math.sin(o.angle) * 0.5;
        p.rotation.z = Math.sin(t * 0.8 + o.angle) * 0.1;
      });
    },
  });
}

// --- blog: an open book shedding kana ---------------------------------------
function pageTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#faf4e4';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(50,42,32,0.22)';
  g.lineWidth = 2.5;
  for (let y = 22; y < 116; y += 13) {
    g.beginPath();
    g.moveTo(16, y);
    g.lineTo(16 + rand(56, 92), y);
    g.stroke();
  }
  return new THREE.CanvasTexture(c);
}

function buildBook() {
  const grp = new THREE.Group();

  const coverMat = toon(P.red);
  const pageMat = new THREE.MeshToonMaterial({ map: pageTexture() });

  [-1, 1].forEach((side) => {
    const wing = new THREE.Group();
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 1.3), coverMat);
    if (side === -1) outline(cover, 1.04);
    wing.add(cover);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.07, 1.2), toon(0xf6efdd));
    pages.position.y = 0.06;
    wing.add(pages);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 1.16), pageMat);
    face.rotation.x = -Math.PI / 2;
    face.position.y = 0.096;
    wing.add(face);
    wing.position.x = side * 0.46;
    wing.rotation.z = side * -0.22;
    grp.add(wing);
  });

  // spine
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 1.3), coverMat);
  spine.position.y = -0.05;
  grp.add(spine);

  // bookmark ribbon
  const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.5), toon(P.gold, { side: THREE.DoubleSide }));
  ribbon.position.set(0.2, 0.05, 0.78);
  ribbon.rotation.x = 0.5;
  grp.add(ribbon);

  // serif glyphs drifting up out of the pages
  const chars = ['✶', '¶', '&', '§', '✳', '❡'];
  const glyphs = chars.map((ch, i) => {
    const s = glyphSprite(ch, i % 2 ? '#bf4427' : '#6e5f4b', 0.3);
    s.userData.drift = { phase: rand(0, 6), speed: 0.28 + i * 0.04, x: rand(-0.7, 0.7) };
    grp.add(s);
    return s;
  });
  grp.userData.glyphs = glyphs;

  grp.position.y = 0.1;
  grp.rotation.x = 0.25;
  return grp;
}

export function mountBookScene(canvas) {
  return mountAccent(canvas, buildBook, {
    camPos: [0, 1.2, 5.0],
    lookAt: [0, 0.7, 0],
    baseYaw: -0.15,
    bobAmp: 0.07,
    shadowY: -1.1,
    shadowR: 1.7,
    onFrame: (dt, t, subject) => {
      subject.userData.glyphs.forEach((s) => {
        const d = s.userData.drift;
        const k = ((t * d.speed + d.phase) % 3) / 3;
        s.position.set(
          d.x + Math.sin(t * 1.4 + d.phase) * 0.12,
          0.25 + k * 1.6,
          Math.cos(d.phase) * 0.3
        );
        s.material.opacity = k < 0.12 ? k * 8 : 1 - k;
      });
    },
  });
}
