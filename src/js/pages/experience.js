import '../../styles/main.css';
import { initSite, prefersReducedMotion } from '../ui.js';
import { renderSocials } from '../render.js';
import { experience, skills, goals, profile } from '../data.js';

renderSocials();

/* ---------- trading cards ---------- */
const cardsEl = document.querySelector('[data-cards]');
if (cardsEl) {
  cardsEl.innerHTML = experience
    .map(
      (x) => `
      <div class="tcard accent-${x.card.accent}" data-reveal tabindex="0" role="button"
           aria-label="${x.org} card — activate to flip">
        <div class="tcard-inner">
          <div class="tface tface-front">
            <header class="tc-head">
              <span class="tc-type">${x.card.type}</span>
              <span class="tc-hp">${x.period}</span>
              <h3>${x.org}</h3>
            </header>
            <div class="tc-art" data-letter="${x.org[0]}">
              <canvas data-art="${x.card.art}" aria-hidden="true"></canvas>
              <span class="tc-no">No. ${x.card.no} / 003</span>
            </div>
            <ul class="tc-stats">
              ${x.card.stats
                .map(
                  (s) =>
                    `<li><span class="k">${s.k}</span><span class="dots"></span><span class="v">${s.v}</span></li>`
                )
                .join('')}
            </ul>
            <p class="tc-flavor">${x.card.flavor}</p>
            <footer class="tc-foot">
              <span>VARAKORN · FIRST EDITION</span>
              <span class="spark" aria-hidden="true">✦</span>
            </footer>
            <div class="tc-shine" aria-hidden="true"></div>
          </div>
          <div class="tface tface-back">
            <div class="tb-role">${x.role}</div>
            <div class="tb-meta">${x.period} · ${x.place}</div>
            <ul>${x.points.map((p) => `<li>${p}</li>`).join('')}</ul>
            ${
              x.link
                ? `<p class="tb-link"><a class="link-u" href="${x.link}" target="_blank" rel="noopener noreferrer">Visit ${x.org} ↗</a></p>`
                : ''
            }
            <div class="tb-flip">flip back</div>
            <div class="tc-shine" aria-hidden="true"></div>
          </div>
        </div>
      </div>`
    )
    .join('');

  const fine = matchMedia('(pointer: fine)').matches;
  cardsEl.querySelectorAll('.tcard').forEach((card) => {
    // tilt + shine (fine pointers only)
    if (fine && !prefersReducedMotion) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', `${((nx - 0.5) * 16).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${(-(ny - 0.5) * 14).toFixed(2)}deg`);
        card.style.setProperty('--mx', `${(nx * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(ny * 100).toFixed(1)}%`);
        card.classList.add('is-tilting');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
        card.classList.remove('is-tilting');
      });
    }

    // flip
    const flip = () => {
      card.classList.add('is-flipping');
      card.classList.toggle('is-flipped');
      setTimeout(() => card.classList.remove('is-flipping'), 700);
    };
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      flip();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    });
  });

  // 3D art inside the cards
  if (!prefersReducedMotion) {
    import('../three/cardArt.js').then(({ mountCardArt }) => {
      cardsEl.querySelectorAll('.tc-art canvas').forEach((cv) => {
        mountCardArt(cv, cv.dataset.art);
      });
    });
  } else {
    cardsEl.querySelectorAll('.tc-art').forEach((art) => {
      art.classList.add('no3d');
      art.querySelector('canvas')?.remove();
    });
  }
}

const skEl = document.querySelector('[data-skills]');
if (skEl) {
  skEl.innerHTML = skills
    .map(
      (s) => `
      <div class="skill-cell" data-reveal>
        <div class="head">
          <h3>${s.group}</h3>
          <span class="mark" aria-hidden="true">${s.group[0]}</span>
        </div>
        <ul>${s.items.map((i) => `<li>${i}</li>`).join('')}</ul>
      </div>`
    )
    .join('');
}

const glEl = document.querySelector('[data-goals]');
if (glEl) {
  glEl.innerHTML = goals
    .map(
      (g) => `
      <div class="goal" data-reveal>
        <div class="gi" aria-hidden="true">${g.index}</div>
        <div>
          <h3>${g.title}</h3>
          <p>${g.body}</p>
        </div>
      </div>`
    )
    .join('');
}

const langEl = document.querySelector('[data-langs]');
if (langEl) {
  langEl.innerHTML = profile.languages
    .map((l) => `<span class="tag red">${l}</span>`)
    .join('');
}

/* after dynamic render, so observers see the new nodes */
initSite();

const canvas = document.getElementById('accent-canvas');
if (canvas && !prefersReducedMotion) {
  import('../three/accentScenes.js').then(({ mountCameraScene }) => mountCameraScene(canvas));
} else if (canvas) {
  canvas.style.display = 'none';
}
