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

  /* the Experience row folds. Tapping the word still goes to /experience;
     only the caret opens the six chapter links, so the drawer does not spill
     eleven items on a phone screen. */
  menu.querySelectorAll('.menu-sub-toggle').forEach((btn) => {
    const row = btn.closest('.menu-drop');
    if (!row) return;
    const setOpen = (open) => {
      row.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute(
        'aria-label',
        open ? 'Hide the experience pages' : 'Show the experience pages'
      );
    };
    // already reading a chapter? show where you are instead of hiding it
    if (row.querySelector(`.menu-sub a[href="${location.pathname.replace(/\/+$/, '')}"]`)) {
      setOpen(true);
    }
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!row.classList.contains('is-open'));
    });
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

/* ---------- page-edge decor ---------------------------------------------------
   Line-art clouds in the top corners, pines in the bottom ones, and a scallop
   band above the footer. Strokes ride currentColor so night mode recolors
   them through the CSS vars; widths live in main.css under PAGE-EDGE DECOR. */
function initDecor() {
  if (document.querySelector('.page-decor')) return;

  const cloud = `
    <svg class="pd pd-tl" viewBox="0 0 160 92" fill="none" stroke="currentColor"
      stroke-width="1.7" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 66c-9-14 3-31 19-29 1-15 21-22 32-11 10-11 30-7 33 8 14-1 23 14 14 26" />
      <path d="M30 66h84" />
      <path d="M42 74h44" />
      <path d="M66 46c7-8 19-5 20 4 1 8-9 13-15 7-4-4-1-10 5-10" />
    </svg>`;

  const pine = `
    <svg class="pd pd-bl" viewBox="0 0 140 92" fill="none" stroke="currentColor"
      stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M12 58a17 17 0 0 1 24-15 19 19 0 0 1 33-7 17 17 0 0 1 27 6 13 13 0 0 1 12 21c3 8-5 16-13 14H26c-10 2-18-9-14-19z" />
      <path d="M52 78v-26m0 8l-10-8m10 14l12-10" />
      <path d="M40 52c6 4 14 4 20 0m8 10c6 4 14 4 20 0" />
    </svg>`;

  const wrap = document.createElement('div');
  wrap.className = 'page-decor';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML =
    cloud +
    cloud.replace('pd-tl', 'pd-tr') +
    pine +
    pine.replace('pd-bl', 'pd-br');
  document.body.appendChild(wrap);

  const footer = document.querySelector('.footer');
  if (footer && !footer.querySelector('.deco-band')) {
    const band = document.createElement('div');
    band.className = 'deco-band';
    band.setAttribute('aria-hidden', 'true');
    footer.prepend(band);
  }
}

export function initSite() {
  initCurtain();
  initCursor();
  initNav();
  initMenu();
  initReveals();
  initCounters();
  initMisc();
  initDecor();
}

export const prefersReducedMotion = reduced;
