// ---------------------------------------------------------------------------
// Guestbook comments: one level of replies, likes, moderated before showing.
// Identity is the site wide Supabase session (Google or email, via authui).
// Talks to /api/comments and /api/like with a Bearer token. One mount per
// page; experience pages pass their pathname, the blog reader /blog#<slug>.
// Styling lives in src/styles/comments.css.
// ---------------------------------------------------------------------------
import { authConfigured, userOf, onAuth, authedFetch, signOut } from './supa.js';
import { openAuthDialog } from './authui.js';

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

const fmtDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d)
    ? ''
    : d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

const api = async (url, opts) => {
  const r = await authedFetch(url, opts);
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(out.error || 'error'), { status: r.status });
  return out;
};

const post = (url, body) =>
  api(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

/* ---------- rendering ---------- */

const avatar = (c) =>
  c.picture
    ? `<img class="gb-ava" src="${esc(c.picture)}" alt="" referrerpolicy="no-referrer" />`
    : `<span class="gb-ava gb-ava--letter">${esc((c.name || '?')[0].toUpperCase())}</span>`;

function likeBtn(c, signedIn) {
  const n = c.likes > 0 ? ` <span class="gb-like-n">${c.likes}</span>` : '';
  const title = signedIn ? (c.liked ? 'Unlike' : 'Like') : 'Sign in to like';
  return `<button class="gb-like${c.liked ? ' is-on' : ''}" type="button" data-like="${c.id}"
            ${signedIn ? '' : 'disabled'} title="${title}" aria-label="${title}">
            <span class="gb-like-mark">${c.liked ? '♥' : '♡'}</span>${n}</button>`;
}

function noteHtml(c, signedIn, isReply = false) {
  const replies = (c.replies || [])
    .map((r) => noteHtml(r, signedIn, true))
    .join('');
  return `
    <li class="gb-note${isReply ? ' gb-note--reply' : ''}" data-note="${c.id}">
      <div class="gb-note-head">
        <span class="gb-name">${avatar(c)}${esc(c.name)}</span>
        <span class="gb-date">${esc(fmtDate(c.created_at))}</span>
      </div>
      <p class="gb-body">${esc(c.body)}</p>
      <div class="gb-note-foot">
        ${likeBtn(c, signedIn)}
        ${!isReply && signedIn ? `<button class="gb-reply-btn" type="button" data-reply="${c.id}">Reply</button>` : ''}
      </div>
      ${!isReply ? `<div class="gb-reply-slot"></div>` : ''}
      ${replies ? `<ul class="gb-replies">${replies}</ul>` : ''}
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

  let user; // undefined = loading, null = signed out, {} = signed in
  let comments = [];

  host.innerHTML = `
    ${title ? `<h3 class="gb-title">${esc(title)}</h3>` : ''}
    <p class="gb-intro">Sign in to comment, reply, and like. Comments show up after Varakorn reads them.</p>
    <div class="gb-list-wrap">
      <p class="gb-count" hidden></p>
      <ul class="gb-list"></ul>
      <p class="gb-empty" hidden>No comments yet. Be the first.</p>
    </div>
    <div class="gb-auth"></div>`;

  const el = {
    list: host.querySelector('.gb-list'),
    count: host.querySelector('.gb-count'),
    empty: host.querySelector('.gb-empty'),
    auth: host.querySelector('.gb-auth'),
    intro: host.querySelector('.gb-intro'),
  };

  const countAll = (list) => list.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0);

  function renderList() {
    const n = countAll(comments);
    el.count.hidden = n === 0;
    el.empty.hidden = n > 0;
    el.count.textContent = `${n} ${n === 1 ? 'comment' : 'comments'}`;
    el.list.innerHTML = comments.map((c) => noteHtml(c, Boolean(user))).join('');
  }

  function replyFormHtml() {
    return `
      <form class="gb-form gb-form--reply" novalidate>
        <textarea class="gb-input gb-area" name="body" maxlength="2000" rows="3" required
                  placeholder="Write a reply"></textarea>
        <div class="gb-actions">
          <button class="btn gb-submit" type="submit">Reply</button>
          <button class="gb-cancel" type="button">Cancel</button>
          <p class="gb-status" role="status" aria-live="polite"></p>
        </div>
      </form>`;
  }

  function renderAuth() {
    if (user === undefined) {
      el.auth.innerHTML = '';
      return;
    }
    if (user === null) {
      if (!authConfigured) {
        el.auth.innerHTML = `<p class="gb-offline">Sign in is being set up. Check back soon.</p>`;
        return;
      }
      el.auth.innerHTML = `<button class="btn gb-signin" type="button">Sign in to comment</button>`;
      el.auth.querySelector('.gb-signin').addEventListener('click', () => openAuthDialog());
      return;
    }
    el.auth.innerHTML = `
      <div class="gb-me">
        <span class="gb-name">${avatar(user)}${esc(user.name)}</span>
        <button class="gb-signout" type="button">Sign out</button>
      </div>
      <form class="gb-form" novalidate>
        <textarea class="gb-input gb-area" name="body" maxlength="2000" rows="4" required
                  placeholder="Leave a thought, a question, or just say hi"></textarea>
        <div class="gb-actions">
          <button class="btn gb-submit" type="submit">Leave a comment</button>
          <p class="gb-status" role="status" aria-live="polite"></p>
        </div>
      </form>`;
  }

  const say = (form, msg, tone = '') => {
    const s = form.querySelector('.gb-status');
    if (s) {
      s.textContent = msg;
      s.dataset.tone = tone;
    }
  };

  async function submit(form, parent) {
    const area = form.querySelector('[name="body"]');
    const body = area.value.trim();
    if (!body) return say(form, 'Write something first.', 'err');
    const btn = form.querySelector('.gb-submit');
    btn.disabled = true;
    say(form, 'Sending…');
    try {
      await post('/api/comments', { page, body, parent });
      area.value = '';
      say(form, 'Thank you. It shows up here once Varakorn approves it.', 'ok');
    } catch (e) {
      if (e.status === 401) {
        say(form, 'Your session expired. Sign in again.', 'err');
        openAuthDialog();
      } else {
        say(
          form,
          e.status === 429
            ? 'Slow down a little. Try again in a few minutes.'
            : 'That did not go through. Try again in a moment.',
          'err'
        );
      }
    } finally {
      btn.disabled = false;
    }
  }

  async function refresh() {
    try {
      const out = await api(`/api/comments?page=${encodeURIComponent(page)}`);
      if (out.offline) {
        host.innerHTML = `<p class="gb-intro">Comments are not open yet. Check back soon.</p>`;
        return false;
      }
      comments = out.comments || [];
      renderList();
    } catch {
      el.empty.hidden = false;
    }
    return true;
  }

  /* ---------- events (delegated so rerenders stay cheap) ---------- */

  host.addEventListener('click', async (e) => {
    const like = e.target.closest('[data-like]');
    if (like && user) {
      like.disabled = true;
      try {
        const out = await post('/api/like', { comment: Number(like.dataset.like) });
        const patch = (c) =>
          String(c.id) === like.dataset.like ? { ...c, liked: out.liked, likes: out.likes } : c;
        comments = comments.map((c) => ({ ...patch(c), replies: (c.replies || []).map(patch) }));
        renderList();
      } catch {
        like.disabled = false;
      }
      return;
    }

    const replyBtn = e.target.closest('[data-reply]');
    if (replyBtn && user) {
      const note = replyBtn.closest('.gb-note');
      const slot = note.querySelector('.gb-reply-slot');
      if (slot.innerHTML) {
        slot.innerHTML = '';
      } else {
        host.querySelectorAll('.gb-reply-slot').forEach((s) => (s.innerHTML = ''));
        slot.innerHTML = replyFormHtml();
        slot.querySelector('textarea').focus();
      }
      return;
    }

    if (e.target.closest('.gb-cancel')) {
      e.target.closest('.gb-reply-slot').innerHTML = '';
      return;
    }

    if (e.target.closest('.gb-signout')) {
      await signOut(); // the auth subscription below repaints everything
    }
  });

  host.addEventListener('submit', (e) => {
    const form = e.target.closest('.gb-form');
    if (!form) return;
    e.preventDefault();
    const parentNote = form.closest('.gb-note');
    submit(form, parentNote ? Number(parentNote.dataset.note) : undefined);
  });

  /* ---------- boot: the shared session drives everything ---------- */

  refresh().then((open) => {
    if (!open) return;
    onAuth((session) => {
      const next = userOf(session);
      const was = user;
      user = next;
      renderAuth();
      // like states are per viewer, so a sign in or out reloads the list
      if (was !== undefined || next) refresh();
      else renderList();
    });
  });
}
