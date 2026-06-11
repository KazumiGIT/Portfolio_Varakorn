// ---------------------------------------------------------------------------
// The hero diorama: a desk-life set on a staged island, 2020 anime style.
// Fixed, composed camera with gentle pointer parallax. Three objects are
// doors: the monitor (Experience), the books (Blog), the torii (Journey) —
// labeled with pin tags; click one and the camera dollies in, the curtain
// wipes, and you land on that page. The rest of the desk tells small stories
// on hover/tap.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  PALETTE as P,
  toon,
  outline,
  blobShadow,
  makeDust,
  rand,
  createStage,
  parallaxController,
  popIn,
  warmLights,
} from './core.js';
import { buildTorii, buildCamera, buildMonitor } from './objects.js';
import { createTerminal } from './terminal.js';
import { navigateWithCurtain, isNight, toggleNight } from '../ui.js';
import { experience } from '../data.js';

// --- builders ---------------------------------------------------------------
function buildIsland() {
  const grp = new THREE.Group();
  const slab = new THREE.Mesh(
    new RoundedBoxGeometry(7.6, 0.6, 4.8, 4, 0.16),
    toon(0xe2cfa6)
  );
  slab.position.y = -0.3;
  grp.add(slab);

  const under = new THREE.Mesh(
    new RoundedBoxGeometry(6.9, 0.5, 4.1, 4, 0.14),
    toon(0xc4aa7d)
  );
  under.position.y = -0.78;
  grp.add(under);

  // rug
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.55, 40), toon(0xd9c194));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.35, 0.013, 0.35);
  grp.add(rug);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.34, 1.45, 40), toon(P.gold));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0.35, 0.016, 0.35);
  grp.add(ring);
  return grp;
}

function buildDesk() {
  const grp = new THREE.Group();
  const top = new THREE.Mesh(new RoundedBoxGeometry(3.3, 0.12, 1.5, 3, 0.04), toon(P.wood));
  top.position.y = 0.86;
  outline(top, 1.02);
  grp.add(top);
  const legGeo = new THREE.BoxGeometry(0.1, 0.86, 0.1);
  const legMat = toon(P.woodDark);
  [
    [-1.5, -0.62],
    [1.5, -0.62],
    [-1.5, 0.62],
    [1.5, 0.62],
  ].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.43, z);
    grp.add(leg);
  });
  return grp;
}

function buildKeyboard() {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.05, 0.32, 2, 0.015), toon(P.cream));
  outline(body, 1.03);
  grp.add(body);
  const key = new THREE.BoxGeometry(0.055, 0.022, 0.055);
  const keys = new THREE.InstancedMesh(key, toon(0x6e5f4b), 41);
  const m = new THREE.Matrix4();
  const keyBase = [];
  let i = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      keyBase.push({ x: -0.34 + c * 0.075, y: 0.035, z: -0.1 + r * 0.07, sx: 1 });
      m.setPosition(-0.34 + c * 0.075, 0.035, -0.1 + r * 0.07);
      keys.setMatrixAt(i++, m);
    }
  }
  keyBase.push({ x: 0, y: 0.035, z: 0.115, sx: 4.4 });
  m.makeScale(4.4, 1, 1);
  m.setPosition(0, 0.035, 0.115);
  keys.setMatrixAt(40, m);
  grp.add(keys);
  grp.userData.keys = keys;
  grp.userData.keyBase = keyBase;
  return grp;
}

/* map typed characters onto the dummy keyboard's 4x10 grid + spacebar */
const KEY_ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];
function keyIndexFor(ch) {
  const c = ch.toLowerCase();
  if (c === ' ') return 40;
  for (let r = 0; r < 4; r++) {
    const col = KEY_ROWS[r].indexOf(c);
    if (col !== -1) return r * 10 + col;
  }
  return 10 + Math.floor(Math.random() * 20); // unknown chars land somewhere homey
}

function buildMug() {
  const grp = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.085, 0.17, 20), toon(P.red));
  cup.position.y = 0.085;
  outline(cup, 1.06);
  grp.add(cup);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.082, 20), toon(0x3d2a1a));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.172;
  grp.add(coffee);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 10, 18), toon(P.red));
  handle.position.set(0.105, 0.09, 0);
  handle.rotation.y = Math.PI / 2;
  grp.add(handle);

  // steam sprites
  const steam = [];
  const sc = document.createElement('canvas');
  sc.width = sc.height = 64;
  const sg = sc.getContext('2d');
  const grad = sg.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,250,240,0.9)');
  grad.addColorStop(1, 'rgba(255,250,240,0)');
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 64, 64);
  const stex = new THREE.CanvasTexture(sc);
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: stex, transparent: true, opacity: 0, depthWrite: false })
    );
    s.scale.setScalar(0.1);
    s.position.y = 0.2;
    s.userData.phase = i * 0.85;
    s.raycast = () => {};
    grp.add(s);
    steam.push(s);
  }
  grp.userData.steam = steam;
  return grp;
}

function buildBooks() {
  const grp = new THREE.Group();
  const colors = [P.red, P.green, P.gold];
  let y = 0;
  colors.forEach((col) => {
    const h = 0.075;
    const book = new THREE.Group();
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.52, h, 0.38), toon(col));
    book.add(cover);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.5, h - 0.024, 0.355), toon(0xf6efdd));
    pages.position.x = 0.015;
    book.add(pages);
    book.position.y = y + h / 2;
    book.rotation.y = rand(-0.28, 0.28);
    y += h + 0.004;
    grp.add(book);
  });
  outline(grp.children[0].children[0], 1.04);
  return grp;
}

function buildPlant() {
  const grp = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.23, 0.42, 18), toon(P.terracotta));
  pot.position.y = 0.21;
  outline(pot, 1.045);
  grp.add(pot);
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.31, 0.07, 18), toon(0xc4754e));
  lip.position.y = 0.42;
  grp.add(lip);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.27, 18), toon(0x4a392a));
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = 0.455;
  grp.add(soil);
  const leafMat = toon(P.green);
  const leafMat2 = toon(P.greenSoft);
  const blobs = [
    [0, 0.85, 0, 0.34, leafMat],
    [-0.22, 0.7, 0.1, 0.26, leafMat2],
    [0.2, 0.72, -0.08, 0.27, leafMat],
    [0.05, 0.66, 0.21, 0.22, leafMat2],
    [-0.05, 1.05, -0.05, 0.22, leafMat2],
  ];
  blobs.forEach(([x, y, z, r, mat]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), mat);
    b.position.set(x, y, z);
    grp.add(b);
  });
  outline(grp.children[3], 1.05);
  return grp;
}

function buildLamp() {
  const grp = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.05, 18), toon(P.ink2));
  base.position.y = 0.025;
  grp.add(base);
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 10), toon(P.ink2));
  arm1.position.set(0.08, 0.27, 0);
  arm1.rotation.z = -0.35;
  grp.add(arm1);
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 10), toon(P.ink2));
  arm2.position.set(0.34, 0.56, 0);
  arm2.rotation.z = -1.25;
  grp.add(arm2);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.22, 20, 1, true), toon(P.red));
  shade.position.set(0.52, 0.52, 0);
  shade.rotation.z = 2.5;
  outline(shade, 1.05);
  grp.add(shade);
  const bulb = new THREE.PointLight(0xffd9a0, 1.4, 2.2, 1.7);
  bulb.position.set(0.56, 0.42, 0);
  grp.add(bulb);
  grp.userData.bulb = bulb;

  // generous-but-tight click targets on the shade and base only — a box
  // around the whole arm would shadow the monitor behind it
  const hitMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    colorWrite: false,
  });
  const hitShade = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 8), hitMat);
  hitShade.position.set(0.52, 0.5, 0);
  grp.add(hitShade);
  const hitBase = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), hitMat);
  hitBase.position.set(0, 0.12, 0);
  grp.add(hitBase);
  return grp;
}

/** Small desk details that reward zooming in: sticky notes, a pen, a notebook. */
function buildDeskClutter() {
  const grp = new THREE.Group();

  // sticky notes, slightly askew
  [
    [0xcf9a3f, -1.18, -0.78, 0.3],
    [0x8a9a72, -1.04, -0.62, -0.4],
    [0xd1764a, -1.22, -0.55, 0.1],
  ].forEach(([col, x, z, ry]) => {
    const note = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), toon(col));
    note.rotation.x = -Math.PI / 2;
    note.rotation.z = ry;
    note.position.set(x, 0.927, z);
    grp.add(note);
  });

  // a pen by the keyboard
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.22, 8), toon(P.ink));
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = 0.8;
  pen.position.set(-0.28, 0.937, -0.2);
  grp.add(pen);
  const nib = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.03, 8), toon(P.gold));
  nib.rotation.z = -Math.PI / 2;
  nib.rotation.y = 0.8;
  nib.position.set(-0.28 + Math.cos(-0.8) * 0.125, 0.937, -0.2 + Math.sin(-0.8) * 0.125);
  grp.add(nib);

  // a closed notebook by the mug
  const nb = new THREE.Group();
  const cover = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.035, 0.22, 2, 0.01), toon(P.green));
  outline(cover, 1.04);
  nb.add(cover);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.037, 0.22), toon(P.red));
  band.position.x = 0.08;
  nb.add(band);
  nb.position.set(0.68, 0.945, -0.14);
  nb.rotation.y = -0.3;
  grp.add(nb);

  return grp;
}

/** A small desk globe — the door to the Journey page. */
function buildGlobe() {
  const grp = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 16), toon(P.woodDark));
  base.position.y = 0.02;
  grp.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.14, 8), toon(P.ink2));
  post.position.y = 0.1;
  grp.add(post);

  const tilt = new THREE.Group();
  tilt.position.y = 0.36;
  tilt.rotation.z = 0.41;
  grp.add(tilt);
  const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.52, 8), toon(P.ink2));
  tilt.add(axis);
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 18), toon(P.blue));
  outline(sphere, 1.05);
  tilt.add(sphere);

  // low-poly continents riding the surface
  const land = toon(P.green);
  [
    [0.2, 0.5],
    [1.2, -0.2],
    [2.4, 0.4],
    [3.6, -0.5],
    [4.7, 0.1],
    [5.5, 0.6],
  ].forEach(([lon, lat]) => {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), land);
    blob.position.set(
      Math.cos(lat) * Math.cos(lon) * 0.19,
      Math.sin(lat) * 0.19,
      Math.cos(lat) * Math.sin(lon) * 0.19
    );
    blob.scale.setScalar(rand(0.75, 1.2));
    sphere.add(blob);
  });

  grp.userData.sphere = sphere;
  return grp;
}

function buildCassette() {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.035, 0.15, 2, 0.01), toon(P.cream));
  outline(body, 1.05);
  grp.add(body);
  const label = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.037, 0.08), toon(P.red));
  label.position.z = -0.01;
  grp.add(label);
  return grp;
}

/** A floating experience card: a paper sheet stamped with one chapter of the
    résumé (org, type chip, headline stat). Replaces the old blank papers. */
function buildExpCard({ type, title, sub }) {
  const grp = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = '#faf3e2';
  g.fillRect(0, 0, 256, 160);
  g.strokeStyle = 'rgba(50,42,32,0.4)';
  g.lineWidth = 4;
  g.strokeRect(3, 3, 250, 154);

  // red type chip
  g.fillStyle = '#bf4427';
  g.font = '800 15px "Manrope", sans-serif';
  const chipW = g.measureText(type).width + 18;
  g.fillRect(16, 16, chipW, 24);
  g.fillStyle = '#faf3e2';
  g.textBaseline = 'middle';
  g.fillText(type, 25, 29);

  // org name, shrunk to fit
  g.fillStyle = '#322a20';
  let size = 30;
  do {
    g.font = `800 ${size}px "Fraunces", Georgia, serif`;
    size -= 2;
  } while (g.measureText(title).width > 222 && size > 14);
  g.fillText(title, 16, 84);

  // headline stat
  g.fillStyle = '#6e5f4b';
  g.font = '600 16px "Manrope", sans-serif';
  g.fillText(sub, 16, 122);

  // hanko corner mark
  g.fillStyle = '#bf4427';
  g.fillRect(218, 118, 22, 22);
  g.fillStyle = '#faf3e2';
  g.font = '800 16px "Fraunces", Georgia, serif';
  g.textAlign = 'center';
  g.fillText('V', 229, 130);

  const tex = new THREE.CanvasTexture(c);
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.4875),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
  );
  grp.add(sheet);
  return grp;
}

// --- flavor tooltip copy -----------------------------------------------------
const TIPS = {
  camera: { title: 'The camera', cap: '38M+ views started on the other side of this lens.' },
  mug: { title: 'The fuel', cap: 'Subang Jaya nights run on this.' },
  plant: { title: 'The growth', cap: 'Watered between deploys. Mostly.' },
  lamp: { title: 'The lamp', cap: 'Click it. Lights on, lights off.' },
  cassette: { title: 'Lofi on loop', cap: '2020 never ended on this desk.' },
  torii: { title: 'The gate', cap: 'Every journey passes under one.' },
  keyboard: { title: 'The keyboard', cap: 'Click it. Ask my AI anything about me.' },
};

/** Invisible (but raycastable) fat hit box around a nav object. */
function addHitProxy(group, inflate = 1.3) {
  const box = new THREE.Box3().setFromObject(group);
  const worldScale = group.getWorldScale(new THREE.Vector3());
  const size = box
    .getSize(new THREE.Vector3())
    .multiplyScalar(inflate)
    .divide(worldScale); // proxy lives inside the (possibly scaled) group
  const center = group.worldToLocal(box.getCenter(new THREE.Vector3()));
  const proxy = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(size.x, 0.3), Math.max(size.y, 0.3), Math.max(size.z, 0.3)),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
  );
  proxy.position.copy(center);
  group.add(proxy);
  return proxy;
}

// --- mount -------------------------------------------------------------------
export function mountHeroScene(canvas, tipEl, pinsEl) {
  const stage = createStage(canvas, {
    fov: 36,
    camPos: [0, 2.85, 6.85], // straight-on front view, slightly elevated
    lookAt: [0, 0.62, 0],
    fogNear: 8.5,
    fogFar: 15,
  });
  const { scene, camera } = stage;

  const lights = warmLights(scene, { hemiIntensity: 1.3 });

  const world = new THREE.Group(); // parallax target
  const diorama = new THREE.Group(); // idle-motion target
  world.add(diorama);
  scene.add(world);

  const island = buildIsland();
  diorama.add(island);

  const desk = buildDesk();
  desk.position.set(-0.1, 0, -0.85);
  diorama.add(desk);

  const monitor = buildMonitor();
  monitor.position.set(-0.62, 0.92, -1.0);
  diorama.add(monitor);

  const keyboard = buildKeyboard();
  keyboard.position.set(-0.55, 0.95, -0.42);
  keyboard.rotation.y = 0.04;
  keyboard.userData.tip = TIPS.keyboard;
  diorama.add(keyboard);

  const mug = buildMug();
  mug.position.set(0.42, 0.92, -0.5);
  mug.userData.tip = TIPS.mug;
  diorama.add(mug);

  const books = buildBooks();
  books.position.set(1.08, 0.92, -1.05);
  diorama.add(books);

  // back-left corner BESIDE the monitor, arm reaching toward the viewer so it
  // never crosses the screen; this is the night-mode switch
  const lamp = buildLamp();
  lamp.position.set(-1.45, 0.92, -1.05);
  lamp.rotation.y = -1.25;
  lamp.userData.tip = TIPS.lamp;
  diorama.add(lamp);

  // back row BESIDE the books, not in front of them
  const cam = buildCamera();
  cam.position.set(0.55, 1.05, -1.05);
  cam.rotation.y = -0.25;
  cam.userData.tip = TIPS.camera;
  diorama.add(cam);

  const cassette = buildCassette();
  cassette.position.set(0.05, 0.94, -0.18);
  cassette.rotation.y = 0.4;
  cassette.userData.tip = TIPS.cassette;
  diorama.add(cassette);

  const clutter = buildDeskClutter();
  diorama.add(clutter);

  const plant = buildPlant();
  plant.position.set(-2.6, 0, 0.55);
  plant.userData.tip = TIPS.plant;
  diorama.add(plant);

  // the torii is scenery now — the journey door moved onto the desk
  const torii = buildTorii({ scale: 0.52, stones: false });
  torii.position.set(2.02, 0, 0.55);
  torii.rotation.y = -0.42;
  torii.userData.tip = TIPS.torii;
  diorama.add(torii);

  const globe = buildGlobe();
  globe.position.set(1.38, 0.92, -0.22);
  diorama.add(globe);

  // floating experience cards — the résumé drifting around the desk
  const expCards = experience.map((x) =>
    buildExpCard({
      type: x.card.type,
      title: x.org,
      sub: `${x.card.stats[0].k} · ${x.card.stats[0].v}`,
    })
  );
  const cardSpotsWide = [
    [2.85, 2.2, 0.2], // Orion, upper right
    [-2.75, 2.35, 0.3], // Gamuda, upper left
    [-3.0, 1.5, -0.3], // HYGR, lower left
  ];
  // narrow screens can't see the island's far edges — float the cards in the
  // sky above the desk instead
  const cardSpotsNarrow = [
    [1.35, 2.6, 0.2],
    [-1.2, 2.85, 0.3],
    [-1.5, 2.0, -0.3],
  ];
  expCards.forEach((p, i) => {
    p.position.set(...cardSpotsWide[i]);
    p.userData.baseY = cardSpotsWide[i][1];
    p.userData.tip = { title: experience[i].org, cap: experience[i].role };
    diorama.add(p);
  });
  function placeCards(aspect) {
    const spots = aspect < 0.8 ? cardSpotsNarrow : cardSpotsWide;
    expCards.forEach((p, i) => {
      p.position.x = spots[i][0];
      p.position.z = spots[i][2];
      p.userData.baseY = spots[i][1];
    });
  }

  const shadow = blobShadow(3.5, 0.5);
  shadow.position.y = -1.45;
  shadow.scale.x = 1.5;
  world.add(shadow);

  const dust = makeDust(70, [7.5, 4.5, 5.5]);
  dust.points.position.y = 0.2;
  scene.add(dust.points);

  // --- the three doors -------------------------------------------------------
  const navTargets = [
    // tighter proxy on the monitor so it never swallows clicks meant for the
    // lamp sitting right beside it
    // pin sits ON the screen (not above it) so the sky stays clear for the name
    { group: monitor, url: '/experience', label: 'Experience', anchor: new THREE.Vector3(0, 0.62, 0), inflate: 1.1 },
    // anchor hugs the stack so the pin doesn't drift high in close-up
    { group: books, url: '/blog', label: 'Blog', anchor: new THREE.Vector3(0, 0.3, 0), inflate: 1.3 },
    { group: globe, url: '/journey', label: 'Journey', anchor: new THREE.Vector3(0, 0.45, 0), inflate: 1.25 },
  ];
  navTargets.forEach((nt) => {
    nt.group.userData.nav = nt;
    nt.proxy = addHitProxy(nt.group, nt.inflate);
  });

  // pin labels
  navTargets.forEach((nt) => {
    const pin = document.createElement('button');
    pin.className = 'pin';
    pin.type = 'button';
    pin.textContent = nt.label;
    pin.setAttribute('aria-label', `Go to ${nt.label}`);
    pin.addEventListener('click', () => flyTo(nt));
    pin.addEventListener('pointerenter', () => setNavHover(nt));
    pin.addEventListener('pointerleave', () => setNavHover(null));
    pinsEl.appendChild(pin);
    nt.pin = pin;
  });

  // hover-pulse targets — capture base scales BEFORE popIn zeroes them
  const flavor = [mug, lamp, cam, cassette, plant, torii, keyboard, ...expCards];
  const pulseTargets = [...flavor, monitor, books, globe];
  pulseTargets.forEach((g) => {
    g.userData.hoverK = 0;
    g.userData.baseScale = g.scale.x; // torii is 0.52, everything else 1
  });

  // entrance
  const pop = popIn(
    [
      { obj: island, delay: 0 },
      { obj: desk, delay: 0.16 },
      { obj: monitor, delay: 0.3 },
      { obj: keyboard, delay: 0.4 },
      { obj: lamp, delay: 0.48 },
      { obj: plant, delay: 0.54 },
      { obj: books, delay: 0.6 },
      { obj: mug, delay: 0.68 },
      { obj: cam, delay: 0.76 },
      { obj: cassette, delay: 0.84 },
      { obj: clutter, delay: 0.88 },
      { obj: globe, delay: 0.9 },
      { obj: torii, delay: 0.92 },
      { obj: expCards[0], delay: 1.02 },
      { obj: expCards[1], delay: 1.1 },
      { obj: expCards[2], delay: 1.18 },
    ],
    0.85
  );
  let pinsShown = false;

  const parallax = parallaxController(stage, world, {
    yaw: 0.055,
    pitch: 0.028,
    baseYaw: 0, // desk faces the visitor straight on
  });

  // night mode — the lamp is the switch
  function applyNight(on) {
    lights.hemi.intensity = on ? 0.42 : 1.3;
    lights.dir.intensity = on ? 0.45 : 1.6;
    const bulb = lamp.userData.bulb;
    bulb.intensity = on ? 3.6 : 1.4;
    bulb.distance = on ? 3.6 : 2.2;
  }
  applyNight(isNight());

  // --- zoom: dolly into the desk (wheel / pinch / double tap) ----------------
  // The page OPENS on the close-up and STAYS there; scrolling the page (or
  // wheeling out) releases it to the wide view.
  const camBase = new THREE.Vector3(0, 2.85, 6.85);
  const deskFocus = new THREE.Vector3(-0.05, 1.05, -0.5); // diorama-local
  const lookZoom = new THREE.Vector3();
  const camZoom = new THREE.Vector3();
  const heroEl = canvas.closest('.hero');
  let zoomT = 1; // target 0..1
  let zoomK = 1; // smoothed
  let panX = 0; // drag-to-pan across the desk while zoomed (diorama-local x)
  let panC = 0; // smoothed

  // leaving the hero by scrolling pulls the camera back out
  addEventListener(
    'scroll',
    () => {
      if (zoomT > 0 && window.scrollY > 60) {
        zoomT = 0;
        exitTerminal();
      }
    },
    { passive: true }
  );

  canvas.addEventListener(
    'wheel',
    (e) => {
      if (flight) return;
      const zoomingIn = e.deltaY < 0;
      if (zoomingIn && termT > 0) {
        e.preventDefault(); // already at the deepest level
        return;
      }
      if (!zoomingIn && termT > 0) {
        e.preventDefault(); // first wheel-out leaves the terminal
        exitTerminal();
        return;
      }
      if (zoomingIn && zoomT >= 0.999) {
        // zooming past the close-up while pointing at the desk dives into
        // the terminal
        const hit = raycastAt(pointerClient.x, pointerClient.y);
        if (hit.flavor === keyboard || (hit.nav && hit.nav.group === monitor)) {
          e.preventDefault();
          enterTerminal();
          return;
        }
      }
      if (!zoomingIn && zoomT <= 0) return; // hand the wheel back to the page
      if (zoomingIn && zoomT === 0 && window.scrollY > 40) return; // mid-page scroll up stays scroll
      e.preventDefault();
      const step = Math.min(Math.abs(e.deltaY) / 480, 0.34);
      zoomT = THREE.MathUtils.clamp(zoomT + (zoomingIn ? step : -step), 0, 1);
    },
    { passive: false }
  );

  // drag left/right to slide along the desk while zoomed in
  let dragLast = null;
  canvas.addEventListener('pointerdown', (e) => {
    dragLast = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragLast || flight || touchPts.size > 1 || zoomT <= 0.05 || termT > 0) return;
    panX = THREE.MathUtils.clamp(panX - (e.clientX - dragLast.x) * 0.003, -1.9, 1.9);
    dragLast = { x: e.clientX, y: e.clientY };
  });
  const endDrag = () => {
    dragLast = null;
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // pinch (when the browser lets two pointers through)
  const touchPts = new Map();
  let pinchDist = 0;
  canvas.addEventListener('pointerdown', (e) => {
    touchPts.set(e.pointerId, [e.clientX, e.clientY]);
    if (touchPts.size === 2) {
      const [a, b] = [...touchPts.values()];
      pinchDist = Math.hypot(a[0] - b[0], a[1] - b[1]);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!touchPts.has(e.pointerId)) return;
    touchPts.set(e.pointerId, [e.clientX, e.clientY]);
    if (touchPts.size === 2 && !flight) {
      const [a, b] = [...touchPts.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      zoomT = THREE.MathUtils.clamp(zoomT + (d - pinchDist) / 260, 0, 1);
      pinchDist = d;
    }
  });
  const endTouch = (e) => touchPts.delete(e.pointerId);
  canvas.addEventListener('pointerup', endTouch);
  canvas.addEventListener('pointercancel', endTouch);

  // double click / double tap an empty spot toggles the close-up
  canvas.addEventListener('dblclick', (e) => {
    if (flight || termT > 0) return;
    const hit = raycastAt(e.clientX, e.clientY);
    if (hit.nav || hit.flavor) return;
    zoomT = zoomT > 0.5 ? 0 : 1;
  });

  // --- the terminal: zoom past the close-up into the screen and talk to it --
  const term = createTerminal();
  const termLook = new THREE.Vector3();
  const termCam = new THREE.Vector3();
  let termT = 0;
  let termK = 0;
  let screenIsTerm = false;
  const keyPresses = []; // { idx, t } animating dummy keys
  const keyMat = new THREE.Matrix4();

  term.onType.cb = (ch) => {
    keyPresses.push({ idx: keyIndexFor(ch), t: 0 });
  };

  function applyScreen(on) {
    if (screenIsTerm === on) return;
    screenIsTerm = on;
    const screen = monitor.userData.screen;
    screen.material.map = on ? term.texture : monitor.userData.screenTex;
    screen.material.needsUpdate = true;
  }

  function enterTerminal() {
    if (termT > 0 || flight) return;
    hideTip();
    zoomT = 1;
    termT = 1;
    term.setActive(true);
  }

  function exitTerminal() {
    if (termT === 0) return;
    termT = 0;
    term.setActive(false);
  }

  term.field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      term.submit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      exitTerminal();
    }
  });
  // typing anywhere while the terminal is up funnels back into the field
  addEventListener('keydown', (e) => {
    if (termT > 0 && document.activeElement !== term.field && !e.metaKey && !e.ctrlKey) {
      term.field.focus({ preventScroll: true });
    }
  });

  // responsive framing — sits low enough to leave sky for the headline above
  let frameY = 0.04;
  stage.onResize((aspect) => {
    let s = 0.92;
    let y = 0.04;
    let fov = 36;
    if (aspect < 0.72) {
      s = 0.56;
      y = 1.05;
      fov = 42;
    } else if (aspect < 1.05) {
      s = 0.72;
      y = 0.52;
      fov = 39;
    } else if (aspect < 1.45) {
      s = 0.84;
      y = 0.2;
    } else if (aspect >= 1.8) {
      s = 0.8;
      y = 0.26;
    }
    world.scale.setScalar(s);
    frameY = y;
    world.position.y = y;
    world.position.x = 0;
    camera.fov = fov;
    camera.updateProjectionMatrix();
    placeCards(aspect);
  });

  // --- interaction -----------------------------------------------------------
  const finePointer = matchMedia('(pointer: fine)');

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let pointerClient = { x: 0, y: 0 };
  let hoveredFlavor = null;
  let hoveredNav = null;
  let tipTimer = 0;
  let frameCount = 0;
  let flight = null;
  const baseLook = new THREE.Vector3(0, 0.62, 0);
  const lookCur = baseLook.clone();
  let downPos = null;

  function setNavHover(nt) {
    if (flight) return;
    hoveredNav = nt;
    navTargets.forEach((n) => n.pin.classList.toggle('is-hot', n === nt));
    document.body.classList.toggle('cursor-hot', !!nt || !!hoveredFlavor);
  }

  function findUp(obj, key) {
    let n = obj;
    while (n) {
      if (n.userData?.[key]) return n;
      n = n.parent;
    }
    return null;
  }

  function showTip(group, x, y) {
    const { title, cap } = group.userData.tip;
    tipEl.querySelector('.t .txt').textContent = title;
    tipEl.querySelector('.c').textContent = cap;
    const pad = 16;
    const w = 250;
    const left = Math.min(x + pad, window.innerWidth - w - 10);
    const top = Math.min(y + pad, window.innerHeight - 110);
    tipEl.style.left = `${left}px`;
    tipEl.style.top = `${top}px`;
    tipEl.classList.add('is-on');
  }

  function hideTip() {
    tipEl.classList.remove('is-on');
  }

  function raycastAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([...navTargets.map((n) => n.proxy), ...flavor], true);
    if (!hits.length) return { nav: null, flavor: null };
    const navGroup = findUp(hits[0].object, 'nav');
    if (navGroup) return { nav: navGroup.userData.nav, flavor: null };
    return { nav: null, flavor: findUp(hits[0].object, 'tip') };
  }

  function flyTo(nt) {
    if (flight) return;
    hideTip();
    pinsEl.classList.add('is-gone');
    canvas.closest('.hero')?.classList.add('is-flying');
    document.body.classList.remove('cursor-hot');
    const objPos = nt.group.getWorldPosition(new THREE.Vector3());
    flight = {
      t: 0,
      fromPos: camera.position.clone(),
      toPos: camera.position.clone().lerp(objPos, 0.85).add(new THREE.Vector3(0, 0.08, 0)),
      fromLook: lookCur.clone(),
      toLook: objPos,
      fromFov: camera.fov,
    };
    // let the dive be felt before the curtain wipes over it
    setTimeout(() => navigateWithCurtain(nt.url), 520);
  }

  canvas.addEventListener('pointermove', (e) => {
    pointerClient = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerdown', (e) => {
    downPos = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (flight) return;
    const moved = downPos
      ? Math.abs(e.clientX - downPos.x) + Math.abs(e.clientY - downPos.y)
      : 99;
    downPos = null;
    if (moved >= 9) return;
    if (termT > 0) {
      term.field.focus({ preventScroll: true }); // keep the phone keyboard up
      return;
    }
    const hit = raycastAt(e.clientX, e.clientY);
    if (hit.nav) {
      flyTo(hit.nav);
    } else if (hit.flavor === lamp) {
      applyNight(toggleNight());
      hideTip();
    } else if (hit.flavor === keyboard) {
      enterTerminal();
    } else if (hit.flavor) {
      hoveredFlavor = hit.flavor;
      showTip(hit.flavor, e.clientX, e.clientY);
      tipTimer = 3;
    } else {
      hideTip();
      hoveredFlavor = null;
    }
  });

  stage.onFrame((dt, t) => {
    pop.update(dt);
    parallax.update(dt, t);

    // grounded idle: barely-there breathing, no sway
    diorama.position.y = Math.sin(t * 0.6) * 0.015;

    // scroll parallax: the island drifts up and tilts away as you scroll past
    const sp = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
    world.position.y = frameY + sp * sp * 1.7;
    world.rotation.z = -sp * 0.05;

    // zoom dolly toward the desk top (scaled with the responsive framing),
    // panned left/right by dragging; the terminal stage dives to the screen
    zoomK = THREE.MathUtils.lerp(zoomK, zoomT, 1 - Math.pow(0.004, dt));
    termK = THREE.MathUtils.lerp(termK, termT, 1 - Math.pow(0.004, dt));
    panC = THREE.MathUtils.lerp(panC, panX, 1 - Math.pow(0.002, dt));
    if (zoomT === 0) panX = THREE.MathUtils.lerp(panX, 0, 1 - Math.pow(0.05, dt));
    if (!flight) {
      const zk = zoomK * zoomK * (3 - 2 * zoomK);
      const s = world.scale.x;
      lookZoom.set(deskFocus.x + panC, deskFocus.y, deskFocus.z).multiplyScalar(s).add(world.position);
      camZoom.set(lookZoom.x, lookZoom.y + 0.5 * s, lookZoom.z + 3.2 * s);
      camera.position.lerpVectors(camBase, camZoom, zk);
      lookCur.lerpVectors(baseLook, lookZoom, zk);
      if (termK > 0.001) {
        // monitor screen center, framed straight on with the keyboard below
        const tk = termK * termK * (3 - 2 * termK);
        termLook.set(-0.62, 1.36, -0.95).multiplyScalar(s).add(world.position);
        termCam.set(termLook.x, termLook.y + 0.2 * s, termLook.z + 1.74 * s);
        camera.position.lerp(termCam, tk);
        lookCur.lerp(termLook, tk);
      }
      camera.lookAt(lookCur);
    }
    applyScreen(termK > 0.45);
    if (heroEl) {
      heroEl.classList.toggle('is-zoomed', zoomK > 0.35);
      heroEl.classList.toggle('is-term', termK > 0.35);
    }

    // dummy keyboard key presses ride along with the typing
    if (keyPresses.length) {
      const keysMesh = keyboard.userData.keys;
      const base = keyboard.userData.keyBase;
      for (let i = keyPresses.length - 1; i >= 0; i--) {
        const p = keyPresses[i];
        p.t += dt;
        const k = Math.min(p.t / 0.16, 1);
        const dip = Math.sin(k * Math.PI) * 0.013;
        const b = base[p.idx];
        keyMat.makeScale(b.sx, 1, 1);
        keyMat.setPosition(b.x, b.y - dip, b.z);
        keysMesh.setMatrixAt(p.idx, keyMat);
        if (k >= 1) keyPresses.splice(i, 1);
      }
      keysMesh.instanceMatrix.needsUpdate = true;
    }

    term.update(dt);

    // camera flight (door transition) — eases in, accelerating into the wipe
    if (flight) {
      flight.t = Math.min(flight.t + dt / 1.05, 1);
      const k = flight.t * flight.t * (1.2 - 0.2 * flight.t); // gentle start, fast finish
      camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
      lookCur.lerpVectors(flight.fromLook, flight.toLook, k);
      camera.lookAt(lookCur);
      camera.fov = flight.fromFov - 8 * k; // slight dolly-zoom tunnel feel
      camera.updateProjectionMatrix();
    }

    // screen scroll
    monitor.userData.screenTex.offset.y = (t * 0.045) % 1;

    // the globe turns slowly, as journeys do
    globe.userData.sphere.rotation.y = t * 0.35;

    // steam
    mug.userData.steam.forEach((s) => {
      const k = ((t + s.userData.phase) % 2.4) / 2.4;
      s.position.y = 0.2 + k * 0.42;
      s.position.x = Math.sin((t + s.userData.phase) * 2.2) * 0.035;
      s.material.opacity = k < 0.15 ? k * 4 : 0.6 * (1 - k);
      s.scale.setScalar(0.07 + k * 0.16);
    });

    // floating experience cards: bob and sway, always readable from the front
    expCards.forEach((p, i) => {
      p.position.y = p.userData.baseY + Math.sin(t * 0.8 + i * 2.1) * 0.09;
      p.rotation.y = Math.sin(t * 0.5 + i * 1.7) * 0.2;
      p.rotation.z = Math.sin(t * 0.65 + i) * 0.06;
    });

    dust.update(dt, t);

    // pins: show once the entrance settles, then track their anchors
    if (!pinsShown && pop.isDone()) {
      pinsShown = true;
      pinsEl.classList.add('is-on');
    }
    // pins stay up while zoomed, but clear out of the terminal view
    if (pinsShown && !flight) pinsEl.classList.toggle('is-gone', termK > 0.35);
    if (pinsShown && !flight) {
      const rect = canvas.getBoundingClientRect();
      navTargets.forEach((nt) => {
        const p = nt.group.localToWorld(nt.anchor.clone()).project(camera);
        const top = Math.max((-p.y * 0.5 + 0.5) * rect.height, 92); // never under the navbar
        nt.pin.style.left = `${(p.x * 0.5 + 0.5) * rect.width}px`;
        nt.pin.style.top = `${top}px`;
      });
    }

    // hover raycast, throttled (fine pointers only)
    frameCount++;
    const fine = finePointer.matches;
    if (fine && frameCount % 3 === 0 && !flight) {
      const hit = raycastAt(pointerClient.x, pointerClient.y);
      if (hit.nav !== hoveredNav) setNavHover(hit.nav);
      if (hit.flavor !== hoveredFlavor) {
        hoveredFlavor = hit.flavor;
        if (hit.flavor) showTip(hit.flavor, pointerClient.x, pointerClient.y);
        else hideTip();
        document.body.classList.toggle('cursor-hot', !!hit.flavor || !!hit.nav);
      } else if (hit.flavor) {
        showTip(hit.flavor, pointerClient.x, pointerClient.y);
      }
    }

    // tap tooltip timeout (touch)
    if (tipTimer > 0) {
      tipTimer -= dt;
      if (tipTimer <= 0 && !fine) {
        hideTip();
        hoveredFlavor = null;
      }
    }

    // hover scale pulse (after the entrance pop)
    if (pop.isDone()) {
      pulseTargets.forEach((g) => {
        const isHot = g === hoveredFlavor || (hoveredNav && g.userData.nav === hoveredNav);
        const target = isHot ? 1 : 0;
        g.userData.hoverK = THREE.MathUtils.lerp(g.userData.hoverK, target, 1 - Math.pow(0.002, dt));
        g.scale.setScalar(g.userData.baseScale * (1 + g.userData.hoverK * 0.06));
      });
    }
  });

  stage.start();
  return stage;
}
