// ---------------------------------------------------------------------------
// The guestbook wall on the home page: approved vouches and comments from
// across the site, drifting gently like notes pinned to a corkboard. Tapping
// a name opens the profile card. When there are more notes than slots, the
// wall quietly swaps one out for another with a fade, so everyone gets seen.
// Styling lives in main.css under GUESTBOOK WALL.
// ---------------------------------------------------------------------------
import { bindProfileClicks } from './profilecard.js';
import { experience, posts } from './data.js';

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

const chapterByPage = Object.fromEntries(
  experience.filter((x) => x.page).map((x) => [x.page, x.org])
);
const postBySlug = Object.fromEntries(posts.map((p) => [p.slug, p.title]));

const pageLabel = (page) => {
  if (chapterByPage[page]) return chapterByPage[page];
  const slug = (String(page).split('#')[1] || '').trim();
  return postBySlug[slug] || 'the blog';
};

const avatar = (x) =>
  x.picture
    ? `<img class="gb-ava" src="${esc(x.picture)}" alt="" referrerpolicy="no-referrer" loading="lazy" />`
    : `<span class="gb-ava gb-ava--letter">${esc((x.name || '?')[0].toUpperCase())}</span>`;

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function cardInner(item, pid) {
  const clipped = item.body.length > 220 ? item.body.slice(0, 200).trimEnd() + '…' : item.body;
  return `
    <span class="wcard-kind wcard-kind--${item.kind}">${item.kind}</span>
    <p class="wcard-body">${esc(clipped)}</p>
    <footer class="wcard-foot">
      <button class="gb-name gb-name--btn" type="button" data-pc="${pid}" title="View profile">
        ${avatar(item)}
        <span class="wcard-who">
          <strong>${esc(item.name)}</strong>
          ${item.title || item.relation ? `<span class="wcard-title">${esc(item.title || item.relation)}</span>` : ''}
        </span>
      </button>
      <a class="wcard-where" href="${esc(item.page.split('#')[0] + (item.page.includes('#') ? '#' + item.page.split('#')[1] : ''))}"
         title="Where this was left">${esc(pageLabel(item.page))}</a>
    </footer>`;
}

export function mountWall(section) {
  const wall = section?.querySelector('[data-wall]');
  if (!wall || wall.dataset.mounted) return;
  wall.dataset.mounted = '1';

  const people = new Map();
  bindProfileClicks(wall, people);

  fetch('/api/wall')
    .then((r) => (r.ok ? r.json() : { items: [] }))
    .then(({ items }) => {
      if (!items?.length) return; // nothing yet: the section simply stays away

      const SLOTS = Math.min(items.length, innerWidth < 700 ? 4 : 6);
      items.forEach((it, i) => {
        it._pid = 'w' + i;
        people.set(it._pid, {
          name: it.name,
          picture: it.picture,
          title: it.title,
          bio: it.bio,
          links: it.links,
        });
      });

      wall.innerHTML = items
        .slice(0, SLOTS)
        .map(
          (it, i) => `
          <article class="wcard" style="--rot:${((i * 37) % 5) - 2}deg; --dur:${6 + ((i * 13) % 5)}s; --delay:-${(i * 17) % 7}s">
            ${cardInner(it, it._pid)}
          </article>`
        )
        .join('');
      section.hidden = false;

      /* more notes than slots: one card at a time trades places, gently */
      if (items.length > SLOTS && !reduced) {
        let nextItem = SLOTS;
        let slot = 0;
        setInterval(() => {
          if (document.hidden) return;
          const r = section.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return; // off screen, save the breath
          const card = wall.children[slot];
          if (!card) return;
          const item = items[nextItem % items.length];
          card.classList.add('is-swapping');
          setTimeout(() => {
            card.innerHTML = cardInner(item, item._pid);
            card.classList.remove('is-swapping');
          }, 450);
          nextItem += 1;
          slot = (slot + 1) % SLOTS;
        }, 5000);
      }
    })
    .catch(() => {});
}
