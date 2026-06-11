import '../../styles/main.css';
import { initSite, prefersReducedMotion } from '../ui.js';
import { renderSocials, tagList } from '../render.js';
import { stats, projects, services, timeline } from '../data.js';

renderSocials();

/* stats */
const statsEl = document.querySelector('[data-stats]');
if (statsEl) {
  statsEl.innerHTML = stats
    .map(
      (s) => `
      <div class="stat" data-reveal>
        <div class="num"><span data-count="${s.value}">0</span><span class="suf">${s.suffix}</span></div>
        <div class="lbl">${s.label}</div>
      </div>`
    )
    .join('');
}

/* projects */
const projEl = document.querySelector('[data-projects]');
if (projEl) {
  projEl.innerHTML = projects
    .map(
      (p) => `
      <a class="proj-row" href="experience.html" data-reveal data-cursor>
        <div class="idx">${p.index}</div>
        <div>
          <h3 class="name">${p.title} <span class="go" aria-hidden="true">→</span></h3>
          <div class="kick">${p.kicker}</div>
          <p class="desc">${p.description}</p>
        </div>
        <div class="tags">${tagList(p.stack)}</div>
      </a>`
    )
    .join('');
}

/* services */
const svcEl = document.querySelector('[data-services]');
if (svcEl) {
  svcEl.innerHTML = services
    .map(
      (s, i) => `
      <div class="svc" data-reveal>
        <span class="bg-mark" aria-hidden="true">0${i + 1}</span>
        <div class="bar"></div>
        <h3>${s.title}</h3>
        <p>${s.body}</p>
      </div>`
    )
    .join('');
}

/* journey chapters teaser */
const chEl = document.querySelector('[data-chapters]');
if (chEl) {
  chEl.innerHTML = timeline
    .map(
      (t) => `
      <a class="chapter" href="journey.html">
        <span class="chap-chip" aria-hidden="true">${t.chip}</span>
        <div class="yr">${t.year}</div>
        <h3>${t.title}</h3>
        <p>${t.role}</p>
      </a>`
    )
    .join('');
}

/* chrome behaviors — must run after the dynamic sections are in the DOM,
   so the reveal/counter observers actually see them */
initSite();

/* hero 3D — the centerpiece */
const heroCanvas = document.getElementById('hero-canvas');
const tipEl = document.getElementById('scene-tip');
const pinsEl = document.getElementById('hero-pins');
if (heroCanvas && tipEl && pinsEl && !prefersReducedMotion) {
  import('../three/heroScene.js').then(({ mountHeroScene }) => {
    mountHeroScene(heroCanvas, tipEl, pinsEl);
  });
} else if (heroCanvas) {
  heroCanvas.style.display = 'none';
  document.querySelector('.hero-hint')?.remove();
}
