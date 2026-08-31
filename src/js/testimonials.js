// ---------------------------------------------------------------------------
// Vouches on experience detail pages: people who actually worked with
// Varakorn sign in and leave one, and it goes up as they write it. They also
// feed a Review JSON-LD block so answer engines can quote them.
// Mounted by expDetail.js above the guestbook; styling in comments.css.
// ---------------------------------------------------------------------------
import { authConfigured, userOf, onAuth, authedFetch } from './supa.js';
import { openAuthDialog } from './authui.js';
import { bindProfileClicks } from './profilecard.js';
import { askConfirm } from './confirm.js';
import { pageLabel } from './pagelabel.js';
import { authedFetch as apost } from './supa.js';

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

const fmtDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d)
    ? ''
    : d.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
};

const avatar = (t) =>
  t.picture
    ? `<img class="gb-ava" src="${esc(t.picture)}" alt="" referrerpolicy="no-referrer" />`
    : `<span class="gb-ava gb-ava--letter">${esc((t.name || '?')[0].toUpperCase())}</span>`;

function cardHtml(t, people) {
  const pid = 't' + t.id;
  people.set(pid, { name: t.name, picture: t.picture, title: t.title, bio: t.bio, links: t.links });
  return `
    <li class="vouch${t.approved ? '' : ' vouch--pending'}">
      <p class="vouch-body">${esc(t.body)}</p>
      <div class="vouch-foot">
        <button class="gb-name gb-name--btn" type="button" data-pc="${pid}"
                title="View profile">${avatar(t)}${esc(t.name)}</button>
        <span class="vouch-rel">${esc(t.relation)} · ${esc(fmtDate(t.created_at))}</span>
        ${t.mine ? `<span class="vouch-own-actions">
          <button class="gb-mini" type="button" data-v-edit="${t.id}">Edit</button>
          <button class="gb-mini gb-mini--danger" type="button" data-v-del="${t.id}">Delete</button>
        </span>` : ''}
      </div>
      ${t.approved ? '' : '<span class="vouch-wait">Only you can see this</span>'}
    </li>`;
}

/** Vouches that are showing become quotable Review schema, at runtime. */
function injectReviewLd(approved) {
  if (!approved.length) return;
  document.getElementById('vouch-ld')?.remove();
  const ld = {
    '@context': 'https://schema.org',
    '@graph': approved.slice(0, 20).map((t) => ({
      '@type': 'Review',
      itemReviewed: { '@id': 'https://www.varakorn.me/#varakorn' },
      reviewBody: t.body,
      datePublished: String(t.created_at).slice(0, 10),
      author: { '@type': 'Person', name: t.name },
    })),
  };
  const tag = document.createElement('script');
  tag.type = 'application/ld+json';
  tag.id = 'vouch-ld';
  tag.textContent = JSON.stringify(ld);
  document.head.appendChild(tag);
}

export function mountTestimonials(host, page) {
  if (!host || host.dataset.vMounted) return;
  host.dataset.vMounted = '1';

  let user = null;
  let mine = null;
  const people = new Map();

  host.innerHTML = `
    <div class="vpanel">
      <div class="vpanel-head">
        <span class="vpanel-seal" aria-hidden="true">✦</span>
        <div class="vpanel-headings">
          <h3 class="vpanel-title">Vouches <span class="vpanel-count" data-v-count hidden></span></h3>
          <p class="vpanel-sub">Short words from people who worked with Varakorn in this chapter. Not comments, endorsements.</p>
        </div>
      </div>
      <ul class="vouch-list"></ul>
      <p class="vouch-empty" data-v-empty hidden>None here yet. Shared this chapter with him? Yours can be the first.</p>
      <div class="vouch-cta"></div>
    </div>`;

  const list = host.querySelector('.vouch-list');
  const empty = host.querySelector('[data-v-empty]');
  const cta = host.querySelector('.vouch-cta');
  const count = host.querySelector('[data-v-count]');
  let formOpen = false;

  function formHtml() {
    return `
      <form class="gb-form gb-sheet" novalidate>
        <p class="gb-sheet-head">
          <span class="gb-sheet-for">Your vouch on <strong>${esc(pageLabel(page))}</strong></span>
        </p>
        <div class="gb-field">
          <label class="ad-label" for="v-rel">How you know Varakorn</label>
          <input class="gb-input gb-input--short" id="v-rel" name="relation" maxlength="80" required
                 placeholder="Teammate at JAAVIS, client, classmate…" value="${esc(mine?.relation || '')}" />
        </div>
        <div class="gb-field">
          <label class="ad-label" for="v-body">Your vouch</label>
          <textarea class="gb-input gb-area" id="v-body" name="body" maxlength="2000" rows="4" required
                    placeholder="What was he like to work with?">${esc(mine?.body || '')}</textarea>
        </div>
        <div class="gb-actions">
          <button class="btn gb-submit" type="submit">${mine ? 'Update my vouch' : 'Leave a vouch'}</button>
          <button class="gb-cancel" type="button" data-v-cancel>Cancel</button>
          <p class="gb-status" role="status" aria-live="polite"></p>
        </div>
        <p class="vouch-note">It goes up straight away, and you can change or remove it later.</p>
      </form>`;
  }

  function renderCta() {
    if (!authConfigured) {
      cta.innerHTML = '';
      return;
    }
    if (user && formOpen) {
      cta.innerHTML = formHtml();
      cta.querySelector('[data-v-cancel]')?.addEventListener('click', () => {
        formOpen = false;
        renderCta();
      });
      cta.querySelector('[name="relation"]')?.focus();
      return;
    }
    // one quiet, contextual invitation; the form only unfolds on purpose
    const label = !user
      ? 'Worked with him? Sign in to vouch'
      : mine
        ? 'Edit my vouch'
        : 'Worked with him? Leave a vouch';
    cta.innerHTML = `<button class="vouch-open" type="button">
        <span aria-hidden="true">✎</span> ${label}
      </button>`;
    cta.querySelector('.vouch-open').addEventListener('click', () => {
      if (!user) return openAuthDialog();
      formOpen = true;
      renderCta();
    });
  }

  async function refresh({ keepForm = false } = {}) {
    try {
      const r = await authedFetch(`/api/testimonials?page=${encodeURIComponent(page)}`);
      const out = await r.json();
      if (!r.ok || out.offline) {
        host.hidden = true;
        return;
      }
      const items = out.testimonials || [];
      mine = items.find((t) => t.mine) || null;
      people.clear();
      list.innerHTML = items.map((t) => cardHtml(t, people)).join('');
      empty.hidden = items.length > 0;
      const approvedCount = items.filter((t) => t.approved).length;
      count.hidden = approvedCount === 0;
      count.textContent = String(approvedCount);
      injectReviewLd(items.filter((t) => t.approved));
      // right after a submit the form stays put, or the thank you note
      // would be wiped by its own success
      if (!keepForm) renderCta();
    } catch {
      host.hidden = true;
    }
  }

  bindProfileClicks(host, people);

  host.addEventListener('click', async (e) => {
    if (e.target.closest('[data-v-edit]')) {
      formOpen = true;
      renderCta();
      cta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const del = e.target.closest('[data-v-del]');
    if (del) {
      const sure = await askConfirm({
        title: 'Delete your vouch?',
        message: 'It goes for good. You can always write a new one later.',
        yes: 'Delete it',
        no: 'Keep it',
        danger: true,
      });
      if (!sure) return;
      del.disabled = true;
      try {
        await apost('/api/me', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ remove: { kind: 'testimonial', id: Number(del.dataset.vDel) } }),
        });
        mine = null;
        formOpen = false;
        refresh();
      } catch {
        del.disabled = false;
      }
    }
  });

  host.addEventListener('submit', async (e) => {
    const form = e.target.closest('.gb-form');
    if (!form) return;
    e.preventDefault();
    const relation = form.querySelector('[name="relation"]').value.trim();
    const body = form.querySelector('[name="body"]').value.trim();
    const status = form.querySelector('.gb-status');
    if (!relation || !body) {
      status.textContent = 'Both fields, please.';
      status.dataset.tone = 'err';
      return;
    }
    const sure = await askConfirm({
      title: (mine ? 'Update your vouch on ' : 'Leave your vouch on ') + pageLabel(page) + '?',
      message: mine
        ? 'The new version replaces the old one right away. You can edit or delete it any time.'
        : 'It goes up straight away, under your name. You can leave one on every chapter you shared with him, and edit or delete this one any time.',
      yes: mine ? 'Yes, update it' : 'Yes, leave it',
    });
    if (!sure) return;
    const btn = form.querySelector('.gb-submit');
    btn.disabled = true;
    status.textContent = 'Sending…';
    status.dataset.tone = '';
    try {
      const r = await authedFetch('/api/testimonials', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ page, relation, body }),
      });
      const out = await r.json();
      if (!r.ok) throw new Error(out.error || 'error');
      formOpen = false;
      await refresh();
      empty.hidden = true;
    } catch (err) {
      status.textContent = String(err.message || 'That did not go through.');
      status.dataset.tone = 'err';
    } finally {
      btn.disabled = false;
    }
  });

  onAuth((session) => {
    user = userOf(session);
    refresh();
  });
}
