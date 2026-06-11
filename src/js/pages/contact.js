import '../../styles/main.css';
import '../../styles/manga.css';
import { initSite } from '../ui.js';
import { socials } from '../data.js';

/* contact rows, from the same source of truth as the footer */
const META = {
  whatsapp: { mono: 'W', note: 'Fastest reply, usually within the hour' },
  email: { mono: '@', note: 'For anything formal' },
  linkedin: { mono: 'in', note: 'The professional me' },
  github: { mono: '<>', note: 'Where the code lives' },
  tiktok: { mono: 'T', note: 'Where the 38M views happened' },
  instagram: { mono: 'IG', note: 'Life between deploys' },
  youtube: { mono: '▶', note: 'Long form' },
  agency: { mono: 'O', note: 'My automation studio' },
};

const linksEl = document.querySelector('[data-mlinks]');
if (linksEl) {
  const rows = socials
    .map((s) => {
      const m = META[s.id] || { mono: s.label[0], note: '' };
      const primary = s.id === 'whatsapp' ? ' is-primary' : '';
      const external = s.href.startsWith('http')
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      return `<a class="m-link${primary}" href="${s.href}"${external}>
        <span class="m-mono" aria-hidden="true">${m.mono}</span>
        <span class="txt"><b>${s.label}</b><em>${m.note}</em></span>
        <span class="arr" aria-hidden="true">→</span>
      </a>`;
    })
    .join('');
  linksEl.innerHTML =
    rows +
    `<a class="m-link m-save" href="/varakorn.vcf" download>
       <span class="m-mono" aria-hidden="true">↓</span>
       <span class="txt"><b>Save my contact card</b><em>straight into your phone</em></span>
       <span class="arr" aria-hidden="true">↓</span>
     </a>`;
}

initSite();
