// Shared entry for the /experience/* detail pages. All content is static HTML
// in each page (that's the point — SEO/AEO crawlers get everything without JS);
// this entry only wires the chrome: styles, socials, reveals, nav.
import '../../styles/main.css';
import '../../styles/expnav.css';
import '../../styles/exppage.css';
import '../../styles/comments.css';
import { initSite } from '../ui.js';
import { renderSocials } from '../render.js';
import { mountComments } from '../comments.js';

renderSocials();
initSite();

const gb = document.querySelector('[data-guestbook]');
if (gb) mountComments(gb, location.pathname.replace(/\.html$/, ''));
