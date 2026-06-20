import '../../styles/main.css';
import '../../styles/contact.css';
import { initSite } from '../ui.js';
import { renderSocials } from '../render.js';
import { socials } from '../data.js';

/* per-channel glyph + one-line note, keyed off the socials source of truth.
   WhatsApp is featured statically in the markup, so it's omitted from the grid. */
const META = {
  email: { mono: '@', note: 'For anything formal' },
  linkedin: { mono: 'in', note: 'The professional me' },
  github: { mono: '&lt;&gt;', note: 'Where the code lives' },
  tiktok: { mono: 'T', note: 'Where the 38M views happened' },
  instagram: { mono: 'IG', note: 'Life between deploys' },
  youtube: { mono: '▶', note: 'Long form' },
  agency: { mono: 'O', note: 'My automation studio' },
};

const grid = document.querySelector('[data-channels]');
if (grid) {
  const rows = socials
    .filter((s) => s.id !== 'whatsapp')
    .map((s) => {
      const m = META[s.id] || { mono: s.label[0], note: '' };
      const external = s.href.startsWith('http')
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      return `<a class="chan" href="${s.href}"${external}>
        <span class="chan-mono" aria-hidden="true">${m.mono}</span>
        <span class="chan-txt"><b>${s.label}</b><em>${m.note}</em></span>
        <span class="arr" aria-hidden="true">→</span>
      </a>`;
    })
    .join('');

  grid.innerHTML =
    rows +
    `<a class="chan chan--save" href="/varakorn.vcf" download>
       <span class="chan-mono" aria-hidden="true">↓</span>
       <span class="chan-txt"><b>Save my contact card</b><em>Straight into your phone · varakorn.vcf</em></span>
       <span class="arr" aria-hidden="true">↓</span>
     </a>`;
}

renderSocials();
initSite();
