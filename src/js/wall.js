// ---------------------------------------------------------------------------
// The guestbook wall on the home page: approved vouches and comments from
// across the site, drifting gently like notes pinned to a corkboard. Tapping
// a name opens the profile card. When there are more notes than slots, the
// wall quietly swaps one out for another with a fade, so everyone gets seen.
// Styling lives in main.css under GUESTBOOK WALL.
// ---------------------------------------------------------------------------
import { bindProfileClicks } from './profilecard.js';
import { askConfirm } from './confirm.js';
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

/* ---------- compose: leave a comment or vouch without leaving home -------- */

const chapters = experience.filter((x) => x.page);

let composeEl = null;

function composeOptions(kind) {
  const chapterOpts = chapters
    .map((x) => `<option value="${esc(x.page)}">${esc(x.org)}</option>`)
    .join('');
  if (kind === 'vouch') return chapterOpts;
  const noteOpts = posts
    .map((x) => `<option value="/blog#${esc(x.slug)}">${esc(x.title)}</option>`)
    .join('');
  return `<optgroup label="Chapters">${chapterOpts}</optgroup>
          <optgroup label="Field notes">${noteOpts}</optgroup>`;
}

function buildCompose() {
  if (composeEl) return composeEl;
  composeEl = document.createElement('div');
  composeEl.className = 'wcompose';
  composeEl.innerHTML = `
    <div class="wcompose-scrim" data-wc-close></div>
    <div class="wcompose-card" role="dialog" aria-modal="true" aria-label="Leave your words">
      <button class="wcompose-close" type="button" data-wc-close aria-label="Close">&#10005;</button>
      <h3 class="wcompose-title">Leave your words</h3>
      <div class="wcompose-kinds" role="tablist" aria-label="What kind">
        <button type="button" class="wcompose-kind is-on" data-kind="comment">Comment</button>
        <button type="button" class="wcompose-kind" data-kind="vouch">Vouch</button>
      </div>
      <p class="wcompose-sub" data-wc-sub>A thought, a question, or just hi. It lands on the page you pick.</p>
      <form class="wcompose-form" novalidate>
        <label class="ad-label" for="wc-page">Where</label>
        <select class="acct-input wcompose-select" id="wc-page" name="page"></select>
        <div data-wc-rel hidden>
          <label class="ad-label" for="wc-rel">How you know Varakorn</label>
          <input class="acct-input" id="wc-rel" name="relation" maxlength="80"
                 placeholder="Teammate, client, classmate…" />
        </div>
        <label class="ad-label" for="wc-body">Your words</label>
        <textarea class="acct-input acct-area" id="wc-body" name="body" maxlength="2000" rows="4" required
                  placeholder="Write it here"></textarea>
        <div class="wcompose-actions">
          <button class="btn" type="submit" data-wc-submit>Leave it</button>
          <p class="wcompose-status" role="status" aria-live="polite" data-wc-status></p>
        </div>
      </form>
    </div>`;
  document.body.appendChild(composeEl);

  const state = { kind: 'comment' };
  const select = composeEl.querySelector('[name="page"]');
  const relRow = composeEl.querySelector('[data-wc-rel]');
  const sub = composeEl.querySelector('[data-wc-sub]');
  const status = composeEl.querySelector('[data-wc-status]');
  const say = (msg, tone = '') => {
    status.textContent = msg;
    status.dataset.tone = tone;
  };

  const applyKind = (kind) => {
    state.kind = kind;
    composeEl.querySelectorAll('.wcompose-kind').forEach((b) => {
      b.classList.toggle('is-on', b.dataset.kind === kind);
      b.setAttribute('aria-selected', String(b.dataset.kind === kind));
    });
    select.innerHTML = composeOptions(kind);
    relRow.hidden = kind !== 'vouch';
    sub.textContent =
      kind === 'vouch'
        ? 'For people who worked with him: pick the chapter you shared.'
        : 'A thought, a question, or just hi. It lands on the page you pick.';
    say('');
  };
  applyKind('comment');

  composeEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-wc-close]')) composeEl.classList.remove('is-open');
    const kindBtn = e.target.closest('.wcompose-kind');
    if (kindBtn) applyKind(kindBtn.dataset.kind);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') composeEl.classList.remove('is-open');
  });

  composeEl.querySelector('.wcompose-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = composeEl.querySelector('[name="body"]').value.trim();
    const relation = composeEl.querySelector('[name="relation"]').value.trim();
    const page = select.value;
    const label = select.options[select.selectedIndex]?.textContent || 'that page';
    if (!body) return say('Write something first.', 'err');
    if (state.kind === 'vouch' && !relation) return say('Say how you know him first.', 'err');

    // auth loads only when someone actually tries to post
    const { getSession, authedFetch } = await import('./supa.js');
    if (!(await getSession())) {
      const { openAuthDialog } = await import('./authui.js');
      say('Sign in first, then your words go through.', 'err');
      openAuthDialog();
      return;
    }

    const sure = await askConfirm({
      title: `Leave this ${state.kind} on ${label}?`,
      message:
        'It shows once Varakorn approves it. You can edit or delete it any time from your account page' +
        (state.kind === 'vouch' ? ', and leave one on every chapter you shared.' : '.'),
      yes: 'Yes, leave it',
    });
    if (!sure) return;

    const btn = composeEl.querySelector('[data-wc-submit]');
    btn.disabled = true;
    say('Sending…');
    try {
      const r =
        state.kind === 'vouch'
          ? await authedFetch('/api/testimonials', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ page, relation, body }),
            })
          : await authedFetch('/api/comments', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ page, body }),
            });
      const out = await r.json();
      if (!r.ok) throw new Error(out.error || 'error');
      composeEl.querySelector('[name="body"]').value = '';
      say(`Thank you. It shows on ${label} once Varakorn approves it.`, 'ok');
    } catch (err) {
      say(String(err.message || 'That did not go through.'), 'err');
    } finally {
      btn.disabled = false;
    }
  });

  return composeEl;
}

function openCompose() {
  buildCompose().classList.add('is-open');
}

function cardInner(item, pid) {
  const long = item.body.length > 180;
  return `
    <span class="wcard-kind wcard-kind--${item.kind}">${item.kind}</span>
    <p class="wcard-body${long ? ' wcard-body--clamp' : ''}">${esc(item.body)}</p>
    ${long ? '<button class="wcard-more" type="button" data-more>Read all</button>' : ''}
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

  // long notes unfold in place; the rotator leaves an open card alone
  wall.addEventListener('click', (e) => {
    const more = e.target.closest('[data-more]');
    if (!more) return;
    const card = more.closest('.wcard');
    const open = card.classList.toggle('is-open');
    more.textContent = open ? 'Show less' : 'Read all';
  });

  wall.addEventListener('click', (e) => {
    if (e.target.closest('[data-compose]')) openCompose();
  });

  fetch('/api/wall')
    .then((r) => (r.ok ? r.json() : { items: [] }))
    .then(({ items }) => {
      items = items || [];
      const SLOTS = Math.min(Math.max(items.length, 1), innerWidth < 700 ? 4 : 6);
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

      wall.innerHTML =
        items
          .slice(0, SLOTS)
          .map(
            (it, i) => `
          <article class="wcard" style="--rot:${((i * 37) % 5) - 2}deg; --dur:${6 + ((i * 13) % 5)}s; --delay:-${(i * 17) % 7}s">
            ${cardInner(it, it._pid)}
          </article>`
          )
          .join('') +
        `<button class="wcard wcard--compose" type="button" data-compose
                 style="--rot:1.6deg; --dur:8s; --delay:-3s">
          <span class="wcompose-pen" aria-hidden="true">✎</span>
          <span class="wcard-body">${items.length ? 'Leave yours here' : 'No words yet. Leave the first one.'}</span>
          <span class="wcard-hintline">a comment, or a vouch if you worked with him</span>
        </button>`;
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
          if (!card || card.classList.contains('wcard--compose')) return;
          if (card.classList.contains('is-open')) {
            slot = (slot + 1) % SLOTS; // someone is reading this one
            return;
          }
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
