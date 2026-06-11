import '../../styles/main.css';
import { initSite, prefersReducedMotion, navigateWithCurtain } from '../ui.js';
import { renderSocials } from '../render.js';
import { timeline } from '../data.js';

renderSocials();

const tl = document.querySelector('[data-timeline]');
if (tl) {
  tl.innerHTML = timeline
    .map(
      (t) => `
      <div class="t-entry" data-reveal>
        <span class="ghost-year" aria-hidden="true">${t.year}</span>
        <div class="meta">
          <span class="era-chip">${t.chip}</span>
          <span>${t.period}</span>
        </div>
        <h3>${t.title}</h3>
        <div class="role">${t.role}</div>
        <p class="story">${t.story}</p>
        ${
          t.photo
            ? `<figure class="polaroid">
                 <span class="tape" aria-hidden="true"></span>
                 <img src="${t.photo}" alt="${t.photoCaption}" loading="lazy" />
                 <figcaption class="cap">${t.photoCaption}</figcaption>
                 <span class="hanko-stamp" aria-hidden="true">V</span>
               </figure>`
            : ''
        }
      </div>`
    )
    .join('');
}

/* the secret gate at the end of the rail — the gate at the end of the
   journey leads to me */
if (tl) {
  const gate = document.createElement('button');
  gate.className = 'secret-gate';
  gate.type = 'button';
  gate.setAttribute('aria-label', 'A small gate');
  gate.innerHTML =
    '<span class="b1"></span><span class="b2"></span><span class="p1"></span><span class="p2"></span>';
  gate.addEventListener('click', () => navigateWithCurtain('contact.html'));
  tl.appendChild(gate);
}

/* after dynamic render, so observers see the new nodes */
initSite();

const canvas = document.getElementById('accent-canvas');
if (canvas && !prefersReducedMotion) {
  import('../three/accentScenes.js').then(({ mountToriiScene }) => mountToriiScene(canvas));
} else if (canvas) {
  canvas.style.display = 'none';
}
