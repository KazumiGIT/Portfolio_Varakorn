import '../../styles/main.css';
import '../../styles/expnav.css';
import { initSite, revealIn, prefersReducedMotion } from '../ui.js';
import { renderSocials } from '../render.js';
import { posts, postCategories } from '../data.js';

renderSocials();

/* ---------- helpers -------------------------------------------------------- */
const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ENT[c]);
const plain = (html) => String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const tokenize = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);

/* ---------- index ----------------------------------------------------------- */
const catIds = postCategories.map((c) => c.id);
const catById = Object.fromEntries(postCategories.map((c) => [c.id, c]));

const items = posts.map((p) => ({
  ...p,
  cat: catIds.includes(p.category) ? p.category : catIds[0],
  year: String(p.date).slice(0, 4),
  hay: [p.title, p.excerpt, p.tags.join(' '), plain(p.body)].join(' ').toLowerCase(),
}));

/* issue numbers run chronologically inside a shelf, so a card keeps its
   number no matter which filter surfaced it */
catIds.forEach((id) => {
  items
    .filter((p) => p.cat === id)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((p, i) => {
      p.no = String(i + 1).padStart(2, '0');
    });
});

// display order: newest first
items.sort((a, b) => (a.date < b.date ? 1 : -1));

const inCat = (id) => items.filter((p) => p.cat === id);

/* ---------- state ------------------------------------------------------------ */
const q0 = new URLSearchParams(location.search);
const state = {
  cat: catIds.includes(q0.get('c')) ? q0.get('c') : catIds[0],
  year: q0.get('y') || 'all',
  topic: q0.get('t') || 'all',
  q: q0.get('q') || '',
};

function match(p, s) {
  if (p.cat !== s.cat) return false;
  if (s.year !== 'all' && p.year !== s.year) return false;
  if (s.topic !== 'all' && !p.tags.includes(s.topic)) return false;
  const toks = tokenize(s.q);
  if (toks.length && !toks.every((t) => p.hay.includes(t))) return false;
  return true;
}

const isFiltered = () => state.year !== 'all' || state.topic !== 'all' || state.q.trim() !== '';

function urlFor(hash) {
  const p = new URLSearchParams();
  if (state.cat !== catIds[0]) p.set('c', state.cat);
  if (state.year !== 'all') p.set('y', state.year);
  if (state.topic !== 'all') p.set('t', state.topic);
  if (state.q.trim()) p.set('q', state.q.trim());
  const qs = p.toString();
  return location.pathname + (qs ? `?${qs}` : '') + (hash ? `#${hash}` : '');
}

const syncUrl = () => history.replaceState(null, '', urlFor());

/* ---------- dom ---------------------------------------------------------------- */
const el = {
  cats: document.querySelector('[data-cats]'),
  blurb: document.querySelector('[data-blurb]'),
  search: document.querySelector('[data-search]'),
  facets: document.querySelector('[data-facets]'),
  count: document.querySelector('[data-result-count]'),
  clear: document.querySelector('[data-clear]'),
  grid: document.querySelector('[data-posts]'),
  empty: document.querySelector('[data-empty]'),
  emptyNote: document.querySelector('[data-empty-note]'),
};

/* ---------- render: shelf tabs ---------------------------------------------------- */
function renderTabs() {
  if (!el.cats) return;
  el.cats.innerHTML = postCategories
    .map((c) => {
      const on = c.id === state.cat;
      return `
      <button class="cat-tab${on ? ' is-on' : ''}" type="button" role="tab"
              aria-selected="${on}" tabindex="${on ? 0 : -1}" data-cat="${esc(c.id)}">
        <span class="ct-k">${esc(c.kicker)}</span>
        <span class="ct-l">${esc(c.label)}</span>
        <span class="ct-n">${inCat(c.id).length}</span>
      </button>`;
    })
    .join('');
}

/* ---------- render: year + topic dropdowns ------------------------------------------ */
function renderFacets() {
  if (!el.facets) return;
  const list = inCat(state.cat);
  const years = [...new Set(list.map((p) => p.year))].sort((a, b) => b.localeCompare(a));
  const topics = [...new Set(list.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));

  // a stale deep link should not leave a dead filter selected
  if (state.year !== 'all' && !years.includes(state.year)) state.year = 'all';
  if (state.topic !== 'all' && !topics.includes(state.topic)) state.topic = 'all';

  /* the hook is data-fsel on purpose: ui.js owns the bare [data-year] and
     [data-count] hooks (footer year, stat counters) and would overwrite a
     facet using those names on boot */
  const option = (kind, value, label) => {
    const n = items.filter((p) => match(p, { ...state, [kind]: value })).length;
    const on = state[kind] === value;
    return `<option value="${esc(value)}"${on ? ' selected' : ''}>${esc(label)} (${n})</option>`;
  };

  const row = (label, kind, values, fmt = (v) => v) => `
    <div class="facet">
      <span class="facet-label">${label}</span>
      <div class="facet-select${state[kind] === 'all' ? '' : ' is-on'}">
        <select data-fsel="${kind}" aria-label="Filter by ${label.toLowerCase()}">
          ${option(kind, 'all', 'All')}${values.map((v) => option(kind, v, fmt(v))).join('')}
        </select>
      </div>
    </div>`;

  el.facets.innerHTML =
    (years.length > 1 ? row('Year', 'year', years) : '') +
    (topics.length > 1 ? row('Topic', 'topic', topics, (t) => `#${t}`) : '');
}

/* ---------- render: covers -------------------------------------------------------- */
/* a post can carry a real photo (cover: '/photos/…'). Anything without one gets a
   printed plate instead, so a shelf never shows half its cards dressed. */
const PLATE_GLYPH = { blog: '記', journey: '道', learning: '学' };

const hash = (s) => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return h;
};

function coverFor(p) {
  if (p.cover) {
    const pos = p.coverPos ? ` style="object-position:${esc(p.coverPos)}"` : '';
    return `
      <div class="pc-cover">
        <img src="${esc(p.cover)}" alt="${esc(p.coverAlt || '')}" loading="lazy"
             decoding="async"${pos} />
      </div>`;
  }
  return `
    <div class="pc-cover pc-plate" data-cat="${esc(p.cat)}" data-pat="${hash(p.slug) % 6}"
         aria-hidden="true">
      <span class="pcp-kicker">${esc(catById[p.cat].kicker)}</span>
      <span class="pcp-seal">${PLATE_GLYPH[p.cat] || '記'}</span>
      <span class="pcp-no">No. ${p.no}</span>
    </div>`;
}

/* ---------- render: grid --------------------------------------------------------- */
function highlight(text, toks) {
  const safe = esc(text);
  const useful = toks.filter((t) => t.length > 1 && /^[\p{L}\p{N}]+$/u.test(t));
  if (!useful.length) return safe;
  const re = new RegExp(`(${useful.map(escRe).join('|')})`, 'gi');
  return safe.replace(re, '<mark>$1</mark>');
}

function renderGrid() {
  if (!el.grid) return;
  const toks = tokenize(state.q);
  const found = items.filter((p) => match(p, state));

  el.grid.innerHTML = found
    .map(
      (p, i) => `
      <button class="post-card" type="button" data-reveal style="--d:${Math.min(i, 5) * 0.05}s"
              data-slug="${esc(p.slug)}" aria-haspopup="dialog">
        ${coverFor(p)}
        <div class="pc-body">
          <div class="pm">
            <span class="no">No. ${p.no}</span>
            <span>${esc(p.dateLabel)}</span>
          </div>
          <h3>${highlight(p.title, toks)}</h3>
          <p class="ex">${highlight(p.excerpt, toks)}</p>
          <div class="pf">
            <span>${p.tags.map((t) => `#${esc(t)}`).join('  ')}</span>
            <span class="read">${p.minutes} min read</span>
          </div>
        </div>
      </button>`
    )
    .join('');

  el.grid.hidden = found.length === 0;
  if (el.empty) el.empty.hidden = found.length > 0;

  // count line
  if (el.count) {
    const total = inCat(state.cat).length;
    el.count.textContent = isFiltered()
      ? `${found.length} of ${total} ${total === 1 ? 'note' : 'notes'}`
      : `${total} ${total === 1 ? 'note' : 'notes'}`;
  }
  if (el.clear) el.clear.hidden = !isFiltered();

  // dead end rescue: point at matches sitting on another shelf
  if (!found.length && el.emptyNote) {
    const elsewhere = catIds
      .filter((id) => id !== state.cat)
      .map((id) => ({ id, n: items.filter((p) => match(p, { ...state, cat: id })).length }))
      .filter((c) => c.n > 0);
    el.emptyNote.innerHTML = elsewhere.length
      ? `Try ${elsewhere
          .map(
            (c) =>
              `<button class="link-jump" type="button" data-cat="${esc(c.id)}">${esc(
                catById[c.id].label
              )}</button> (${c.n})`
          )
          .join(' or ')}.`
      : 'Nothing on any shelf matches that. Try a shorter search.';
  }

  revealIn(el.grid);
}

function renderAll() {
  renderTabs();
  renderFacets();
  if (el.blurb) el.blurb.textContent = catById[state.cat].blurb;
  if (el.search && el.search.value !== state.q) el.search.value = state.q;
  renderGrid();
  syncUrl();
}

/* ---------- events ------------------------------------------------------------------ */
function setCat(id) {
  if (!catIds.includes(id) || id === state.cat) return;
  state.cat = id;
  state.year = 'all';
  state.topic = 'all';
  renderAll();
}

el.cats?.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-cat]');
  if (tab) setCat(tab.dataset.cat);
});

// left/right arrows walk the tablist
el.cats?.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  e.preventDefault();
  const i = catIds.indexOf(state.cat);
  const next = catIds[(i + (e.key === 'ArrowRight' ? 1 : catIds.length - 1)) % catIds.length];
  setCat(next);
  el.cats.querySelector('.cat-tab.is-on')?.focus();
});

el.facets?.addEventListener('change', (e) => {
  const sel = e.target.closest('[data-fsel]');
  if (!sel) return;
  const kind = sel.dataset.fsel;
  state[kind] = sel.value;
  renderFacets();
  renderGrid();
  syncUrl();
  // renderFacets swaps the innerHTML out from under the picker
  el.facets.querySelector(`[data-fsel="${kind}"]`)?.focus();
});

let searchTimer;
el.search?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.q = el.search.value;
    renderFacets();
    renderGrid();
    syncUrl();
  }, 120);
});

el.search?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && el.search.value) {
    el.search.value = '';
    el.search.dispatchEvent(new Event('input'));
  }
});

function clearFilters() {
  state.year = 'all';
  state.topic = 'all';
  state.q = '';
  if (el.search) el.search.value = '';
  renderAll();
}

el.clear?.addEventListener('click', clearFilters);
document.querySelector('[data-clear-2]')?.addEventListener('click', clearFilters);
el.empty?.addEventListener('click', (e) => {
  const jump = e.target.closest('.link-jump');
  if (jump) setCat(jump.dataset.cat);
});

/* ---------- reader overlay ------------------------------------------------------------ */
const reader = document.querySelector('.reader');
const article = reader?.querySelector('.article');
const rbTitle = reader?.querySelector('.rb-title');

function openPost(slug, push = true) {
  const post = items.find((p) => p.slug === slug);
  if (!post || !reader) return;
  rbTitle.textContent = post.title;
  article.innerHTML = `
    <div class="a-meta">
      <span>${esc(catById[post.cat].label)}</span>
      <span>${esc(post.dateLabel)}</span>
      <span>${post.minutes} min read</span>
      <span>${post.tags.map((t) => `#${esc(t)}`).join(' ')}</span>
    </div>
    <h1>${esc(post.title)}</h1>
    <div class="a-rule"></div>
    ${coverFor(post)}
    ${post.coverAlt ? `<p class="a-caption">${esc(post.coverAlt)}</p>` : ''}
    <div class="article-body">${post.body}</div>
    <div class="a-end">thanks for reading</div>
  `;
  reader.classList.add('is-open');
  document.body.classList.add('reader-locked');
  reader.scrollTop = 0;
  if (push) history.replaceState(null, '', urlFor(slug));
  reader.querySelector('.reader-close')?.focus();
}

function closeReader() {
  reader?.classList.remove('is-open');
  document.body.classList.remove('reader-locked');
  syncUrl();
}

el.grid?.addEventListener('click', (e) => {
  const card = e.target.closest('.post-card');
  if (card) openPost(card.dataset.slug);
});

reader?.querySelector('.reader-close')?.addEventListener('click', closeReader);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && reader?.classList.contains('is-open')) closeReader();
});

/* ---------- boot ------------------------------------------------------------------------ */
// a deep link wins over the saved shelf: /blog#slug opens on that post's shelf
const deepSlug = location.hash.slice(1);
const deepPost = deepSlug && items.find((p) => p.slug === deepSlug);
if (deepPost) state.cat = deepPost.cat;

renderAll();
if (deepPost) openPost(deepPost.slug);

/* after dynamic render, so observers see the new nodes */
initSite();

/* ---------- 3D accent ---------- */
const canvas = document.getElementById('accent-canvas');
if (canvas && !prefersReducedMotion) {
  import('../three/accentScenes.js').then(({ mountBookScene }) => mountBookScene(canvas));
} else if (canvas) {
  canvas.style.display = 'none';
}
