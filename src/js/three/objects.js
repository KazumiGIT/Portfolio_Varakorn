// ---------------------------------------------------------------------------
// Shared object builders used by more than one scene.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PALETTE as P, toon, outline, rand } from './core.js';

/**
 * A vermilion torii gate. `scale` sizes the whole gate; `stones` adds the
 * floating stepping stones used by the journey header scene.
 * The group's origin is at the foot of the pillars.
 */
export function buildTorii({ scale = 1, stones = true } = {}) {
  const grp = new THREE.Group();
  const redMat = toon(P.red);
  const darkMat = toon(0x4a3328);

  // pillars
  [-0.78, 0.78].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.7, 14), redMat);
    pillar.position.set(x, 0.85, 0);
    outline(pillar, 1.06);
    grp.add(pillar);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.12, 14), darkMat);
    foot.position.set(x, 0.06, 0);
    grp.add(foot);
  });

  // nuki (lower beam)
  const nuki = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.13, 0.12), redMat);
  nuki.position.y = 1.28;
  outline(nuki, 1.04);
  grp.add(nuki);

  // center strut
  const strut = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.1), redMat);
  strut.position.y = 1.51;
  grp.add(strut);

  // top beams, ends kicked up
  const shimaki = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.13, 0.16), redMat);
  shimaki.position.y = 1.7;
  outline(shimaki, 1.04);
  grp.add(shimaki);

  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.15, 0.2), darkMat);
  kasagi.position.y = 1.84;
  outline(kasagi, 1.04);
  grp.add(kasagi);
  [-1.24, 1.24].forEach((x, i) => {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.2), darkMat);
    tip.position.set(x, 1.89, 0);
    tip.rotation.z = i === 0 ? 0.18 : -0.18;
    grp.add(tip);
  });

  if (stones) {
    const stoneMat = toon(0xcdb88e);
    [
      [0, -0.25, 0.25, 0.6],
      [-0.85, -0.5, 0.7, 0.42],
      [0.9, -0.62, 0.55, 0.38],
    ].forEach(([x, y, z, s]) => {
      const stone = new THREE.Mesh(new RoundedBoxGeometry(s, 0.16, s * 0.8, 2, 0.05), stoneMat);
      stone.position.set(x, y, z);
      stone.rotation.y = rand(-0.5, 0.5);
      stone.userData.float = { y, phase: rand(0, Math.PI * 2) };
      grp.add(stone);
    });
  }

  grp.scale.setScalar(scale);
  return grp;
}

/** Scrolling warm "code" texture for monitor screens. */
export function codeTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#2c2218';
  g.fillRect(0, 0, 256, 512);
  const colors = ['#f3ebdd', '#cf9a3f', '#bf4427', '#8a9a72', '#a3937a'];
  let y = 14;
  while (y < 500) {
    const indent = 14 + (Math.random() < 0.45 ? 22 * Math.ceil(Math.random() * 3) : 0);
    let x = indent;
    const chunks = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < chunks; i++) {
      const w = 18 + Math.random() * 64;
      g.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      g.globalAlpha = 0.55 + Math.random() * 0.45;
      g.fillRect(x, y, w, 7);
      x += w + 10;
      if (x > 220) break;
    }
    y += 16;
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 0.45);
  return tex;
}

/** The terminal — monitor on a stand with animated code screen. */
export function buildMonitor() {
  const grp = new THREE.Group();
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.05, 18), toon(0x4a4036));
  foot.position.y = 0.025;
  grp.add(foot);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.06), toon(0x4a4036));
  neck.position.y = 0.16;
  grp.add(neck);

  const shell = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.78, 0.1, 3, 0.035), toon(0x4a4036));
  shell.position.y = 0.62;
  shell.rotation.x = -0.06;
  outline(shell, 1.025);
  grp.add(shell);

  const tex = codeTexture();
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.02, 0.64),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  screen.position.set(0, 0.62, 0.056);
  screen.rotation.x = -0.06;
  grp.add(screen);

  const glow = new THREE.PointLight(0xffe2a8, 1.6, 2.4, 1.8);
  glow.position.set(0, 0.62, 0.5);
  grp.add(glow);

  grp.userData.screenTex = tex;
  grp.userData.screen = screen; // for swapping the screen content (terminal)
  return grp;
}

/** One anime four-point sparkle. */
function sparkle(size, color) {
  const star = new THREE.Group();
  const a = new THREE.Mesh(new THREE.OctahedronGeometry(size), toon(color));
  a.scale.y = 2.6;
  star.add(a);
  const b = new THREE.Mesh(new THREE.OctahedronGeometry(size * 0.55), toon(color));
  b.scale.y = 2.6;
  b.rotation.z = Math.PI / 2;
  star.add(b);
  return star;
}

/** A small Orion-ish constellation of sparkles — the founder's star sign. */
export function buildSparkles() {
  const grp = new THREE.Group();
  const stars = [
    [0, 0.55, 0, 0.16, P.gold],
    [-0.55, 0.18, 0.1, 0.11, P.gold],
    [0.5, 0.05, -0.1, 0.12, P.red],
    [-0.25, -0.42, 0.05, 0.09, P.gold],
    [0.3, -0.55, 0.12, 0.07, P.red],
  ].map(([x, y, z, s, col]) => {
    const st = sparkle(s, col);
    st.position.set(x, y, z);
    st.userData.twinkle = { phase: Math.random() * Math.PI * 2, base: 1 };
    grp.add(st);
    return st;
  });
  outline(stars[0].children[0], 1.12);
  grp.userData.stars = stars;
  return grp;
}

/** Retro camera — the HYGR-era lens. */
export function buildCamera(scale = 1) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.26, 0.2, 3, 0.03), toon(0x4a4036));
  outline(body, 1.035);
  grp.add(body);
  const grip = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.2, 0.21, 2, 0.03), toon(0x5c4f3d));
  grip.position.set(-0.15, -0.01, 0.002);
  grp.add(grip);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.12, 20), toon(0x322a20));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0.04, 0.01, 0.14);
  grp.add(lens);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), toon(0x64788f));
  glass.position.set(0.04, 0.01, 0.205);
  grp.add(glass);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 8, 20), toon(P.gold));
  ring.position.set(0.04, 0.01, 0.2);
  grp.add(ring);
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 12), toon(P.red));
  button.position.set(0.12, 0.145, 0);
  grp.add(button);
  const vf = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.08), toon(0x322a20));
  vf.position.set(-0.08, 0.16, -0.02);
  grp.add(vf);
  grp.scale.setScalar(scale);
  return grp;
}
