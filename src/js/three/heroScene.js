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
import { navigateWithCurtain } from '../ui.js';

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
  let i = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      m.setPosition(-0.34 + c * 0.075, 0.035, -0.1 + r * 0.07);
      keys.setMatrixAt(i++, m);
    }
  }
  m.makeScale(4.4, 1, 1);
  m.setPosition(0, 0.035, 0.115);
  keys.setMatrixAt(40, m);
  grp.add(keys);
  return grp;
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

function buildPaper() {
  const grp = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#faf3e2';
  g.fillRect(0, 0, 96, 128);
  g.strokeStyle = 'rgba(50,42,32,0.25)';
  g.lineWidth = 3;
  for (let y = 26; y < 118; y += 16) {
    g.beginPath();
    g.moveTo(14, y);
    g.lineTo(14 + rand(40, 68), y);
    g.stroke();
  }
  g.fillStyle = 'rgba(191,68,39,0.85)';
  g.fillRect(14, 10, 26, 7);
  const tex = new THREE.CanvasTexture(c);
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.45),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
  );
  grp.add(sheet);
  return grp;
}

// --- flavor tooltip copy -----------------------------------------------------
const TIPS = {
  camera: { title: 'The camera', cap: '38M+ views started on the other side of this lens.' },
  mug: { title: 'The fuel', cap: 'Shah Alam nights run on this.' },
  plant: { title: 'The growth', cap: 'Watered between deploys. Mostly.' },
  lamp: { title: 'The late nights', cap: 'Most things ship after midnight.' },
  cassette: { title: 'Lo-fi on loop', cap: '2020 never ended on this desk.' },
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
    camPos: [3.7, 2.75, 5.8],
    lookAt: [0, 0.62, 0],
    fogNear: 8.5,
    fogFar: 15,
  });
  const { scene, camera } = stage;

  warmLights(scene, { hemiIntensity: 1.3 });

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
  diorama.add(keyboard);

  const mug = buildMug();
  mug.position.set(0.42, 0.92, -0.5);
  mug.userData.tip = TIPS.mug;
  diorama.add(mug);

  const books = buildBooks();
  books.position.set(1.08, 0.92, -1.05);
  diorama.add(books);

  const lamp = buildLamp();
  lamp.position.set(-1.62, 0.92, -1.1);
  lamp.rotation.y = 0.5;
  lamp.userData.tip = TIPS.lamp;
  diorama.add(lamp);

  const cam = buildCamera();
  cam.position.set(0.95, 1.05, -0.35);
  cam.rotation.y = -0.5;
  cam.userData.tip = TIPS.camera;
  diorama.add(cam);

  const cassette = buildCassette();
  cassette.position.set(0.05, 0.94, -0.18);
  cassette.rotation.y = 0.4;
  cassette.userData.tip = TIPS.cassette;
  diorama.add(cassette);

  const plant = buildPlant();
  plant.position.set(-2.6, 0, 0.55);
  plant.userData.tip = TIPS.plant;
  diorama.add(plant);

  const torii = buildTorii({ scale: 0.52, stones: false });
  torii.position.set(2.02, 0, 0.55);
  torii.rotation.y = -0.42;
  diorama.add(torii);

  const papers = [buildPaper(), buildPaper()];
  papers[0].position.set(-2.8, 1.65, -0.7);
  papers[1].position.set(-3.05, 2.2, 0.35);
  papers.forEach((p) => diorama.add(p));

  const shadow = blobShadow(3.5, 0.5);
  shadow.position.y = -1.45;
  shadow.scale.x = 1.5;
  world.add(shadow);

  const dust = makeDust(70, [7.5, 4.5, 5.5]);
  dust.points.position.y = 0.2;
  scene.add(dust.points);

  // --- the three doors -------------------------------------------------------
  const navTargets = [
    { group: monitor, url: 'experience.html', label: 'Experience', anchor: new THREE.Vector3(0, 1.08, 0) },
    { group: books, url: 'blog.html', label: 'Blog', anchor: new THREE.Vector3(0, 0.55, 0) },
    { group: torii, url: 'journey.html', label: 'Journey', anchor: new THREE.Vector3(0, 2.3, 0) },
  ];
  navTargets.forEach((nt) => {
    nt.group.userData.nav = nt;
    nt.proxy = addHitProxy(nt.group);
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
  const flavor = [mug, lamp, cam, cassette, plant];
  const pulseTargets = [...flavor, monitor, books, torii];
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
      { obj: torii, delay: 0.92 },
      { obj: papers[0], delay: 1.02 },
      { obj: papers[1], delay: 1.1 },
    ],
    0.85
  );
  let pinsShown = false;

  const parallax = parallaxController(stage, world, {
    yaw: 0.055,
    pitch: 0.028,
    baseYaw: -0.14,
  });

  // responsive framing — centered, floating above the headline
  let frameY = 0.36;
  stage.onResize((aspect) => {
    let s = 0.92;
    let y = 0.36;
    let fov = 36;
    if (aspect < 0.72) {
      s = 0.56;
      y = 1.05;
      fov = 42;
    } else if (aspect < 1.05) {
      s = 0.72;
      y = 0.74;
      fov = 39;
    } else if (aspect < 1.45) {
      s = 0.84;
      y = 0.5;
    } else if (aspect >= 1.8) {
      s = 0.8;
      y = 0.52;
    }
    world.scale.setScalar(s);
    frameY = y;
    world.position.y = y;
    world.position.x = 0;
    camera.fov = fov;
    camera.updateProjectionMatrix();
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
    const hit = raycastAt(e.clientX, e.clientY);
    if (hit.nav) {
      flyTo(hit.nav);
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

    // steam
    mug.userData.steam.forEach((s) => {
      const k = ((t + s.userData.phase) % 2.4) / 2.4;
      s.position.y = 0.2 + k * 0.42;
      s.position.x = Math.sin((t + s.userData.phase) * 2.2) * 0.035;
      s.material.opacity = k < 0.15 ? k * 4 : 0.6 * (1 - k);
      s.scale.setScalar(0.07 + k * 0.16);
    });

    // floating papers
    papers.forEach((p, i) => {
      p.position.y = (i ? 2.2 : 1.65) + Math.sin(t * 0.9 + i * 2) * 0.1;
      p.rotation.y = t * (0.25 + i * 0.1);
      p.rotation.z = Math.sin(t * 0.7 + i) * 0.16;
    });

    dust.update(dt, t);

    // pins: show once the entrance settles, then track their anchors
    if (!pinsShown && pop.isDone()) {
      pinsShown = true;
      pinsEl.classList.add('is-on');
    }
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
