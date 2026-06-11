// ---------------------------------------------------------------------------
// Shared three.js stage: renderer + camera + pause-when-hidden loop,
// toon material helpers, outlines, dust, blob shadows, kana sprites,
// and a drag/parallax spin controller. Every scene on the site sits on this.
// ---------------------------------------------------------------------------
import * as THREE from 'three';

export const PALETTE = {
  paper: 0xf3ebdd,
  paperNight: 0x221c12,
  paperDeep: 0xe0cfa9,
  ink: 0x322a20,
  ink2: 0x6e5f4b,
  red: 0xbf4427,
  redDeep: 0x9e3720,
  gold: 0xcf9a3f,
  green: 0x76865b,
  greenSoft: 0x8a9a72,
  blue: 0x64788f,
  wood: 0xb98a5c,
  woodDark: 0x8a623c,
  cream: 0xefe2c6,
  terracotta: 0xb96a45,
  screen: 0x2c2218,
};

let _gradientMap = null;

function gradientMap() {
  if (_gradientMap) return _gradientMap;
  const data = new Uint8Array([110, 180, 235, 255]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  _gradientMap = tex;
  return tex;
}

export function toon(color, opts = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: gradientMap(), ...opts });
}

/** Inverted-hull anime outline around a mesh. */
export function outline(mesh, thickness = 1.035, color = PALETTE.ink) {
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  const line = new THREE.Mesh(mesh.geometry, mat);
  line.scale.setScalar(thickness);
  line.raycast = () => {}; // outlines never catch rays
  mesh.add(line);
  return line;
}

/** Soft round shadow texture, shared. */
let _blobTex = null;
function blobTexture() {
  if (_blobTex) return _blobTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, 'rgba(50,42,32,0.42)');
  grad.addColorStop(1, 'rgba(50,42,32,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  _blobTex = new THREE.CanvasTexture(c);
  return _blobTex;
}

export function blobShadow(radius = 1, opacity = 0.55) {
  const mat = new THREE.MeshBasicMaterial({
    map: blobTexture(),
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.raycast = () => {};
  return mesh;
}

/** Soft round particle sprite, shared. */
let _dotTex = null;
function dotTexture() {
  if (_dotTex) return _dotTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,250,235,1)');
  grad.addColorStop(0.5, 'rgba(255,245,220,0.55)');
  grad.addColorStop(1, 'rgba(255,245,220,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  _dotTex = new THREE.CanvasTexture(c);
  return _dotTex;
}

/** Floating dust motes. Returns { points, update }. */
export function makeDust(count = 60, spread = [6, 4, 5], color = 0xfff3d8) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count);
  const [sx, sy, sz] = spread;
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * sx;
    pos[i * 3 + 1] = Math.random() * sy - 0.4;
    pos[i * 3 + 2] = (Math.random() - 0.5) * sz;
    vel[i] = 0.06 + Math.random() * 0.14;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    map: dotTexture(),
    color,
    size: 0.075,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.raycast = () => {};

  function update(dt, t) {
    const arr = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += vel[i] * dt;
      arr[i * 3] += Math.sin(t * 0.7 + i) * 0.0012;
      if (arr[i * 3 + 1] > sy - 0.4) arr[i * 3 + 1] = -0.4;
    }
    geo.attributes.position.needsUpdate = true;
  }
  return { points, update };
}

/** A single serif glyph as a floating sprite. */
export function glyphSprite(char, color = '#6e5f4b', size = 0.5) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.font = `700 86px "Fraunces", Georgia, serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = color;
  g.fillText(char, 64, 70);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(size);
  return sprite;
}

export const rand = (a, b) => a + Math.random() * (b - a);

export function elasticOut(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c4 = (2 * Math.PI) / 3.2;
  return Math.pow(2, -9 * x) * Math.sin((x * 9 - 0.75) * c4) + 1;
}

/**
 * Stage = renderer + scene + camera + frame loop that pauses when the canvas
 * is offscreen or the tab is hidden. All scenes use alpha canvases over the
 * page's paper background, with matching fog so geometry melts into paper.
 */
export function createStage(canvas, opts = {}) {
  const {
    fov = 36,
    camPos = [3.6, 2.9, 5.6],
    lookAt = [0, 0.55, 0],
    fogNear = 9,
    fogFar = 16,
    maxDpr = matchMedia('(pointer: coarse)').matches ? 1.75 : 2,
  } = opts;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  // fog matches the page paper so geometry melts into it — track night mode
  const night = () => document.documentElement.classList.contains('night');
  scene.fog = new THREE.Fog(night() ? PALETTE.paperNight : PALETTE.paper, fogNear, fogFar);
  window.addEventListener('themechange', () => {
    scene.fog.color.setHex(night() ? PALETTE.paperNight : PALETTE.paper);
  });

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 60);
  camera.position.set(...camPos);
  camera.lookAt(...lookAt);

  const clock = new THREE.Clock();
  const frameCbs = [];
  const resizeCbs = [];
  let inView = true;
  let pageVisible = !document.hidden;
  let running = false;
  let rafId = 0;

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    resizeCbs.forEach((cb) => cb(w / h, w, h));
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      syncLoop();
    },
    { threshold: 0 }
  );
  io.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    syncLoop();
  });

  function tick() {
    rafId = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    frameCbs.forEach((cb) => cb(dt, t));
    renderer.render(scene, camera);
  }

  function syncLoop() {
    const should = inView && pageVisible;
    if (should && !running) {
      running = true;
      clock.getDelta(); // swallow the pause gap
      rafId = requestAnimationFrame(tick);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(rafId);
    }
  }

  return {
    renderer,
    scene,
    camera,
    canvas,
    onFrame: (cb) => frameCbs.push(cb),
    onResize: (cb) => {
      resizeCbs.push(cb);
      cb(camera.aspect, canvas.clientWidth, canvas.clientHeight);
    },
    start: syncLoop,
  };
}

/**
 * Fixed-angle parallax: no dragging. The scene tilts a few degrees toward
 * the pointer and eases back; on touch devices it sways slowly on its own.
 * Calm, stable, still alive.
 */
export function parallaxController(stage, target, opts = {}) {
  const { yaw = 0.05, pitch = 0.025, baseYaw = 0, basePitch = 0 } = opts;
  const coarse = matchMedia('(pointer: coarse)').matches;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;

  if (!coarse) {
    stage.canvas.addEventListener('pointermove', (e) => {
      const r = stage.canvas.getBoundingClientRect();
      tx = (((e.clientX - r.left) / r.width) * 2 - 1) * yaw;
      ty = (((e.clientY - r.top) / r.height) * 2 - 1) * pitch;
    });
    stage.canvas.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
    });
  }

  function update(dt, t) {
    if (coarse) {
      tx = Math.sin(t * 0.45) * yaw * 0.4;
      ty = Math.cos(t * 0.32) * pitch * 0.4;
    }
    const k = 1 - Math.pow(0.02, dt);
    cx = THREE.MathUtils.lerp(cx, tx, k);
    cy = THREE.MathUtils.lerp(cy, ty, k);
    target.rotation.y = baseYaw + cx;
    target.rotation.x = basePitch + cy;
  }

  return { update };
}

/**
 * Pointer-driven rotation for a group: hover parallax + drag spin with
 * inertia. Touch keeps vertical page scroll (canvas uses touch-action:pan-y).
 */
export function spinController(stage, target, opts = {}) {
  const {
    yawRange = 0.55,
    pitchRange = 0.16,
    parallax = 0.085,
    baseYaw = 0,
    basePitch = 0,
  } = opts;

  let yaw = baseYaw;
  let pitch = basePitch;
  let targetYaw = baseYaw;
  let targetPitch = basePitch;
  let hoverYaw = 0;
  let hoverPitch = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let velYaw = 0;
  let moved = 0;

  const el = stage.canvas;

  el.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    velYaw = 0;
    el.setPointerCapture?.(e.pointerId);
  });

  el.addEventListener('pointermove', (e) => {
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    hoverYaw = nx * parallax;
    hoverPitch = ny * parallax * 0.55;

    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    moved += Math.abs(dx) + Math.abs(dy);
    lastX = e.clientX;
    lastY = e.clientY;
    targetYaw += dx * 0.006;
    targetPitch += dy * 0.003;
    velYaw = dx * 0.006;
    targetYaw = THREE.MathUtils.clamp(targetYaw, baseYaw - yawRange, baseYaw + yawRange);
    targetPitch = THREE.MathUtils.clamp(
      targetPitch,
      basePitch - pitchRange,
      basePitch + pitchRange
    );
  });

  const end = () => {
    dragging = false;
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', () => {
    if (!dragging) {
      hoverYaw = 0;
      hoverPitch = 0;
    }
  });

  function update(dt) {
    if (!dragging) {
      // inertia, then ease home toward hover-parallax pose
      targetYaw += velYaw;
      velYaw *= 0.92;
      targetYaw = THREE.MathUtils.clamp(targetYaw, baseYaw - yawRange, baseYaw + yawRange);
      targetYaw = THREE.MathUtils.lerp(targetYaw, baseYaw + hoverYaw, 1 - Math.pow(0.25, dt));
      targetPitch = THREE.MathUtils.lerp(
        targetPitch,
        basePitch + hoverPitch,
        1 - Math.pow(0.25, dt)
      );
    }
    const k = 1 - Math.pow(0.0014, dt);
    yaw = THREE.MathUtils.lerp(yaw, targetYaw, k);
    pitch = THREE.MathUtils.lerp(pitch, targetPitch, k);
    target.rotation.y = yaw;
    target.rotation.x = pitch;
  }

  return {
    update,
    isDragging: () => dragging,
    dragDistance: () => moved,
    nudge: (dy) => {
      targetYaw += dy;
    },
  };
}

/** Staggered elastic pop-in for a list of objects. Call update each frame. */
export function popIn(items, duration = 0.7) {
  const entries = items.map(({ obj, delay = 0 }) => {
    const base = obj.scale.clone();
    obj.scale.setScalar(0.0001);
    return { obj, delay, base };
  });
  let elapsed = 0;
  let done = false;

  function update(dt) {
    if (done) return;
    elapsed += dt;
    let allDone = true;
    for (const e of entries) {
      const k = (elapsed - e.delay) / duration;
      if (k < 1) allDone = false;
      const s = elasticOut(THREE.MathUtils.clamp(k, 0, 1));
      e.obj.scale.set(e.base.x * Math.max(s, 0.0001), e.base.y * Math.max(s, 0.0001), e.base.z * Math.max(s, 0.0001));
    }
    done = allDone;
  }
  return { update, isDone: () => done };
}

/** Standard warm lighting rig for every scene. */
export function warmLights(scene, opts = {}) {
  const { dirIntensity = 1.6, hemiIntensity = 1.15 } = opts;
  const hemi = new THREE.HemisphereLight(0xfff6e0, 0xd9c39a, hemiIntensity);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffeecf, dirIntensity);
  dir.position.set(4, 6, 3);
  scene.add(dir);
  return { hemi, dir };
}
