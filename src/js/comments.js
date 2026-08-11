// ---------------------------------------------------------------------------
// Guestbook: fetches and posts notes through /api/comments. One mount per
// page; experience pages pass their pathname, the blog reader passes
// /blog#<slug>. Styling lives in src/styles/comments.css.
// ---------------------------------------------------------------------------

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ENT[c]);

const NAME_KEY = 'vk-guestbook-name';

const fmtDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d)
    ? ''
    : d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

function noteHtml(c) {
  return `
    <li class="gb-note">
      <div class="gb-note-head">
        <span class="gb-name">${esc(c.name)}</span>
        <span class="gb-date">${esc(fmtDate(c.created_at))}</span>
      </div>
      <p class="gb-body">${esc(c.body)}</p>
    </li>`;
}

/**
 * host: element to render into. page: server side page key.
 * opts.title: optional heading (the blog reader uses it; experience pages
 * already carry a static section head).
 */
export function mountComments(host, page, { title } = {}) {
  if (!host || host.dataset.gbMounted) return;
  host.dataset.gbMounted = '1';
  const openedAt = performance.now();

  host.innerHTML = `
    ${title ? `<h3 class="gb-title">${esc(title)}</h3>` : ''}
    <p class="gb-intro">Sign the guestbook. Notes show up after Varakorn reads them.</p>
    <div class="gb-list-wrap">
      <p class="gb-count" hidden></p>
      <ul class="gb-list"></ul>
      <p class="gb-empty" hidden>No notes yet. Be the first to sign.</p>
    </div>
    <form class="gb-form" novalidate>
      <div class="gb-row">
        <label class="gb-field gb-field--name">
          <span class="gb-label">Name</span>
          <input class="gb-input" name="name" type="text" maxlength="60" required
                 autocomplete="name" placeholder="Your name" />
        </label>
      </div>
      <label class="gb-field">
        <span class="gb-label">Your note</span>
        <textarea class="gb-input gb-area" name="body" maxlength="2000" rows="4" required
                  placeholder="Leave a thought, a question, or just say hi"></textarea>
      </label>
      <div class="gb-trap" aria-hidden="true">
        <label>Website<input name="website" type="text" tabindex="-1" autocomplete="off" /></label>
      </div>
      <div class="gb-actions">
        <button class="btn gb-submit" type="submit">Leave a comment</button>
        <p class="gb-status" role="status" aria-live="polite"></p>
      </div>
    </form>`;

  const el = {
    list: host.querySelector('.gb-list'),
    count: host.querySelector('.gb-count'),
    empty: host.querySelector('.gb-empty'),
    form: host.querySelector('.gb-form'),
    name: host.querySelector('[name="name"]'),
    body: host.querySelector('[name="body"]'),
    website: host.querySelector('[name="website"]'),
    submit: host.querySelector('.gb-submit'),
    status: host.querySelector('.gb-status'),
  };

  el.name.value = localStorage.getItem(NAME_KEY) || '';

  const say = (msg, tone = '') => {
    el.status.textContent = msg;
    el.status.dataset.tone = tone;
  };

  const goOffline = () => {
    host.classList.add('gb-offline');
    host.innerHTML = `<p class="gb-intro">The guestbook is not open yet. Check back soon.</p>`;
  };

  function renderList(comments) {
    const n = comments.length;
    el.count.hidden = n === 0;
    el.empty.hidden = n > 0;
    el.count.textContent = `${n} ${n === 1 ? 'note' : 'notes'}`;
    el.list.innerHTML = comments.map(noteHtml).join('');
  }

  fetch(`/api/comments?page=${encodeURIComponent(page)}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad response'))))
    .then((out) => {
      if (out.offline) return goOffline();
      renderList(out.comments || []);
    })
    .catch(() => {
      el.empty.hidden = false;
    });

  el.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = el.name.value.trim();
    const body = el.body.value.trim();
    if (!name || !body) {
      say('A name and a note are both needed.', 'err');
      return;
    }
    el.submit.disabled = true;
    say('Sending…');
    try {
      const r = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          page,
          name,
          body,
          website: el.website.value,
          elapsed: Math.round(performance.now() - openedAt),
        }),
      });
      const out = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(out.error || 'error');
      if (out.offline) return goOffline();
      localStorage.setItem(NAME_KEY, name);
      el.body.value = '';
      say('Thank you for the note. It shows up here once Varakorn approves it.', 'ok');
    } catch (err) {
      say(
        err.message === 'too many notes, try again in a few minutes'
          ? 'Slow down a little. Try again in a few minutes.'
          : 'That did not go through. Try again in a moment.',
        'err'
      );
    } finally {
      el.submit.disabled = false;
    }
  });
}
