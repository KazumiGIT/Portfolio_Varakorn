import '../../styles/main.css';
import { initSite, prefersReducedMotion } from '../ui.js';
import { renderSocials } from '../render.js';
import { posts } from '../data.js';

renderSocials();

/* ---------- post grid ---------- */
const grid = document.querySelector('[data-posts]');
if (grid) {
  grid.innerHTML = posts
    .map(
      (p) => `
      <button class="post-card" data-reveal data-slug="${p.slug}" aria-haspopup="dialog">
        <div class="pm">
          <span class="no">No. ${String(posts.indexOf(p) + 1).padStart(2, '0')}</span>
          <span>${p.dateLabel}</span>
        </div>
        <h3>${p.title}</h3>
        <p class="ex">${p.excerpt}</p>
        <div class="pf">
          <span>${p.tags.map((t) => `#${t}`).join('  ')}</span>
          <span class="read">${p.minutes} min read</span>
        </div>
      </button>`
    )
    .join('');
}

/* ---------- reader overlay ---------- */
const reader = document.querySelector('.reader');
const article = reader?.querySelector('.article');
const rbTitle = reader?.querySelector('.rb-title');

function openPost(slug, push = true) {
  const post = posts.find((p) => p.slug === slug);
  if (!post || !reader) return;
  rbTitle.textContent = post.title;
  article.innerHTML = `
    <div class="a-meta">
      <span>${post.dateLabel}</span>
      <span>${post.minutes} min read</span>
      <span>${post.tags.map((t) => `#${t}`).join(' ')}</span>
    </div>
    <h1>${post.title}</h1>
    <div class="a-rule"></div>
    <div class="article-body">${post.body}</div>
    <div class="a-end">thanks for reading</div>
  `;
  reader.classList.add('is-open');
  document.body.classList.add('reader-locked');
  reader.scrollTop = 0;
  if (push) history.replaceState(null, '', `#${slug}`);
  reader.querySelector('.reader-close')?.focus();
}

function closeReader() {
  reader?.classList.remove('is-open');
  document.body.classList.remove('reader-locked');
  history.replaceState(null, '', location.pathname);
}

grid?.addEventListener('click', (e) => {
  const card = e.target.closest('.post-card');
  if (card) openPost(card.dataset.slug);
});

reader?.querySelector('.reader-close')?.addEventListener('click', closeReader);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && reader?.classList.contains('is-open')) closeReader();
});

// deep link: blog.html#slug
if (location.hash) {
  const slug = location.hash.slice(1);
  if (posts.some((p) => p.slug === slug)) openPost(slug, false);
}

/* after dynamic render, so observers see the new nodes */
initSite();

/* ---------- 3D accent ---------- */
const canvas = document.getElementById('accent-canvas');
if (canvas && !prefersReducedMotion) {
  import('../three/accentScenes.js').then(({ mountBookScene }) => mountBookScene(canvas));
} else if (canvas) {
  canvas.style.display = 'none';
}
