// ---------------------------------------------------------------------------
// Site chrome: curtain page transitions, custom cursor, nav state, mobile
// menu, scroll reveals, stat counters. Imported by every page entry.
// ---------------------------------------------------------------------------

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

/* ---------- night mode (the desk lamp is the switch) ----------------------- */
export function isNight() {
  return document.documentElement.classList.contains('night');
}

export function toggleNight() {
  const on = document.documentElement.classList.toggle('night');
  try {
    localStorage.setItem('theme', on ? 'night' : 'day');
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent('themechange', { detail: { night: on } }));
  return on;
}

/** Wipe the curtain in, then navigate. Used by link clicks and the 3D nav. */
export function navigateWithCurtain(url) {
  const curtain = document.querySelector('.curtain');
  if (reduced || !curtain) {
    window.location.href = url;
    return;
  }
  curtain.classList.remove('is-out');
  curtain.classList.add('is-in');
  setTimeout(() => {
    window.location.href = url;
  }, 460);
}

/* ---------- curtain (markup is static in each page for first paint) ------- */
function initCurtain() {
  const curtain = document.querySelector('.curtain');
  if (!curtain) return;

  const out = () => {
    curtain.classList.remove('is-in');
    curtain.classList.add('is-out');
  };

  if (reduced) {
    curtain.style.display = 'none';
  } else {
    requestAnimationFrame(() => requestAnimationFrame(out));
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) out();
    });
  }

  // wipe in before internal navigation
  document.addEventListener('click', (e) => {
    if (reduced) return;
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const internal =
      /^\/(home|journey|experience|blog|contact)(#[\w-]*)?$/.test(href) &&
      !a.target &&
      !e.metaKey &&
      !e.ctrlKey;
    if (!internal) return;
    e.preventDefault();
    navigateWithCurtain(href);
  });
}

/* ---------- custom cursor -------------------------------------------------- */
function initCursor() {
  if (!finePointer || reduced) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  document.body.classList.add('has-cursor');

  let mx = innerWidth / 2;
  let my = innerHeight / 2;
  let rx = mx;
  let ry = my;

  addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [data-cursor]')) document.body.classList.add('cursor-hot');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, [data-cursor]')) document.body.classList.remove('cursor-hot');
  });
}

/* ---------- nav ------------------------------------------------------------ */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  let here = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '');
  if (here === '' || here === '/index') here = '/home';
  document.querySelectorAll('.nav-link, .menu-link').forEach((a) => {
    if ((a.getAttribute('href') || '') === here) a.classList.add('is-active');
  });
}

/* ---------- mobile menu ----------------------------------------------------- */
function initMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.menu');
  if (!burger || !menu) return;

  menu.querySelectorAll('.menu-link').forEach((a, i) => {
    a.style.transitionDelay = `${0.08 + i * 0.06}s`;
  });

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-locked', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      menu.classList.remove('is-open');
      burger.classList.remove('is-open');
      document.body.classList.remove('menu-locked');
    }
  });
}

/* ---------- scroll reveals --------------------------------------------------- */

/** Reveal every [data-reveal] inside `root`. Safe to call again after a
    dynamic re-render (blog filtering) so fresh nodes get observed too. */
export function revealIn(root = document) {
  // auto-stagger children of [data-stagger]
  root.querySelectorAll('[data-stagger]').forEach((wrap) => {
    [...wrap.children].forEach((child, i) => {
      child.setAttribute('data-reveal', '');
      child.style.setProperty('--d', `${i * 0.08}s`);
    });
  });

  const els = root.querySelectorAll('[data-reveal]:not(.is-in)');
  if (!els.length) return;
  if (reduced) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach((el) => io.observe(el));
}

function initReveals() {
  revealIn(document);
}

/* ---------- counters --------------------------------------------------------- */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const ease = (x) => 1 - Math.pow(1 - x, 3);

  const run = (el) => {
    const to = parseFloat(el.dataset.count);
    const dur = 1400;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(ease(k) * to).toLocaleString('en-US');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (reduced) {
    els.forEach((el) => (el.textContent = parseFloat(el.dataset.count).toLocaleString('en-US')));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          run(en.target);
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- misc -------------------------------------------------------------- */
function initMisc() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

export function initSite() {
  initCurtain();
  initCursor();
  initNav();
  initMenu();
  initReveals();
  initCounters();
  initMisc();
}

export const prefersReducedMotion = reduced;
