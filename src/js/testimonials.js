// ---------------------------------------------------------------------------
// Vouches on experience detail pages: people who actually worked with
// Varakorn sign in and leave one, moderated before it shows. Approved ones
// also feed a Review JSON-LD block so answer engines can quote them.
// Mounted by expDetail.js above the guestbook; styling in comments.css.
// ---------------------------------------------------------------------------
import { authConfigured, userOf, onAuth, authedFetch } from './supa.js';
import { openAuthDialog } from './authui.js';

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

function cardHtml(t) {
  return `
    <li class="vouch${t.approved ? '' : ' vouch--pending'}">
      <p class="vouch-body">${esc(t.body)}</p>
      <div class="vouch-foot">
        <span class="gb-name">${avatar(t)}${esc(t.name)}</span>
        <span class="vouch-rel">${esc(t.relation)} · ${esc(fmtDate(t.created_at))}</span>
      </div>
      ${t.approved ? '' : '<span class="vouch-wait">Waiting for Varakorn to approve</span>'}
    </li>`;
}

/** Approved vouches become quotable Review schema, injected at runtime. */
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

  host.innerHTML = `
    <div class="section-head" data-reveal>
      <div>
        <p class="kicker">Vouches</p>
        <h2 class="display title">Worked with him here?</h2>
      </div>
    </div>
    <p class="gb-intro">A short word from people who shared this chapter. Vouches show after Varakorn approves them.</p>
    <ul class="vouch-list"></ul>
    <p class="gb-empty" data-v-empty hidden>No vouches on this chapter yet.</p>
    <div class="vouch-cta"></div>`;

  const list = host.querySelector('.vouch-list');
  const empty = host.querySelector('[data-v-empty]');
  const cta = host.querySelector('.vouch-cta');

  function formHtml() {
    return `
      <form class="gb-form" novalidate>
        <label class="ad-label" for="v-rel">How you know Varakorn</label>
        <input class="gb-input" id="v-rel" name="relation" maxlength="80" required
               placeholder="Teammate at JAAVIS, client, classmate…" value="${esc(mine?.relation || '')}" />
        <label class="ad-label" for="v-body" style="margin-top:.5rem">Your vouch</label>
        <textarea class="gb-input gb-area" id="v-body" name="body" maxlength="2000" rows="4" required
                  placeholder="What was he like to work with?">${esc(mine && !mine.approved ? mine.body : '')}</textarea>
        <div class="gb-actions">
          <button class="btn gb-submit" type="submit">${mine ? 'Update my vouch' : 'Leave a vouch'}</button>
          <p class="gb-status" role="status" aria-live="polite"></p>
        </div>
      </form>`;
  }

  function renderCta() {
    if (!authConfigured) {
      cta.innerHTML = '';
      return;
    }
    if (!user) {
      cta.innerHTML = `<button class="btn gb-signin" type="button">Sign in to leave a vouch</button>`;
      cta.querySelector('button').addEventListener('click', () => openAuthDialog());
      return;
    }
    cta.innerHTML = formHtml();
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
      list.innerHTML = items.map(cardHtml).join('');
      empty.hidden = items.length > 0;
      injectReviewLd(items.filter((t) => t.approved));
      // right after a submit the form stays put, or the thank you note
      // would be wiped by its own success
      if (!keepForm) renderCta();
    } catch {
      host.hidden = true;
    }
  }

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
      await refresh({ keepForm: true });
      status.textContent = 'Thank you. It shows here once Varakorn approves it.';
      status.dataset.tone = 'ok';
      form.querySelector('.gb-submit').textContent = 'Update my vouch';
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
