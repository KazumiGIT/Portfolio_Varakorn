// Shared entry for the /experience/* detail pages. All content is static HTML
// in each page (that's the point — SEO/AEO crawlers get everything without JS);
// this entry wires the chrome plus the account era extras: the guestbook, the
// vouches section, and the passport stamp for actually reading the chapter.
import '../../styles/main.css';
import '../../styles/expnav.css';
import '../../styles/exppage.css';
import '../../styles/comments.css';
import { initSite } from '../ui.js';
import { renderSocials } from '../render.js';
import { mountComments } from '../comments.js';
import { mountTestimonials } from '../testimonials.js';
import { onAuth, userOf, authedFetch } from '../supa.js';

renderSocials();
initSite();

const page = location.pathname.replace(/\.html$/, '');

const gb = document.querySelector('[data-guestbook]');
if (gb) {
  mountComments(gb, page);

  // vouches live right above the whole comments block, same section rhythm
  const head = gb.previousElementSibling; // the "Leave a comment" section-head
  const anchor = head && head.classList.contains('section-head') ? head : gb;
  const holder = document.createElement('div');
  holder.className = 'vouches';
  gb.parentElement.insertBefore(holder, anchor);
  mountTestimonials(holder, page);
}

/* the hanko passport: reading a chapter properly earns its stamp. "Properly"
   means the tab was open on it for twenty seconds while signed in. */
let stamped = false;
onAuth((session) => {
  if (!userOf(session) || stamped) return;
  setTimeout(async () => {
    if (stamped || document.hidden) return;
    stamped = true;
    await authedFetch('/api/me', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ stamp: page }),
    }).catch(() => {});
  }, 20000);
});
