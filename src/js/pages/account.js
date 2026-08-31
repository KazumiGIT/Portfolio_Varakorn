// ---------------------------------------------------------------------------
// /account: the visitor's desk drawer. Hanko passport, reading ring, their
// comments and vouches, password change, sign out, delete account.
// Everything renders from /api/me; the page is noindex and personal.
// ---------------------------------------------------------------------------
import '../../styles/main.css';
import '../../styles/expnav.css';
import '../../styles/account.css';
import { initSite } from '../ui.js';
import { renderSocials } from '../render.js';
import { supa, userOf, onAuth, authedFetch, signOut } from '../supa.js';
import { openAuthDialog, avatarHtml } from '../authui.js';
import { experience, posts } from '../data.js';

renderSocials();
initSite();

const root = document.querySelector('[data-acct]');
const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

const chapterByPage = Object.fromEntries(
  experience.filter((x) => x.page).map((x) => [x.page, x.org])
);
const postBySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));

const pageLabel = (page) => {
  if (chapterByPage[page]) return chapterByPage[page];
  const slug = (page.split('#')[1] || '').trim();
  return postBySlug[slug]?.title || page;
};
const pageHref = (page) => (page.startsWith('/blog#') ? page : page);

/* the supabase recovery link lands here with type=recovery in the hash */
const cameFromRecovery = /type=recovery/.test(location.hash);

function gateHtml() {
  return `
    <p class="kicker">Your desk drawer</p>
    <h1 class="display" style="font-size: clamp(2.2rem, 6vw, 3.2rem)">Account</h1>
    <div class="acct-gate" data-reveal>
      <p>Sign in to collect passport stamps, keep your reading progress, and let the desk terminal remember you. New here? Creating an account takes a minute.</p>
      <button class="btn btn--solid" type="button" data-open-auth>Sign in / Create account</button>
    </div>
    <p class="note-dim" style="margin-top:2rem">
      Rather look around first? Start with the <a class="link-u" href="/journey">journey</a> or the <a class="link-u" href="/blog">blog</a>.
    </p>`;
}

function stampHtml(page, got) {
  const name = chapterByPage[page] || page;
  return `
    <a class="pp-stamp${got ? ' is-got' : ''}" href="${esc(page)}"
       title="${got ? esc(name) + ' stamped' : 'Read this chapter to earn the stamp'}">
      <span class="pp-seal" aria-hidden="true">${got ? 'V' : '?'}</span>
      <span class="pp-name">${esc(name)}</span>
    </a>`;
}

function ringHtml(read, total) {
  const R = 44;
  const C = 2 * Math.PI * R;
  const off = C * (1 - (total ? read / total : 0));
  return `
    <svg class="rr-svg" viewBox="0 0 108 108" role="img"
         aria-label="${read} of ${total} notes read">
      <circle class="rr-track" cx="54" cy="54" r="${R}" fill="none" stroke-width="8" />
      <circle class="rr-bar" cx="54" cy="54" r="${R}" fill="none" stroke-width="8"
              stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}"
              stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 54 54)" />
      <text class="rr-num" x="54" y="59" text-anchor="middle">${read} / ${total}</text>
    </svg>`;
}

function mineHtml(kind, item) {
  return `
    <li class="mine-item">
      <div class="mine-body">
        <a class="mine-page link-u" href="${esc(pageHref(item.page))}">${esc(pageLabel(item.page))}</a>
        <p>${esc(item.relation ? item.relation + ' · ' + item.body : item.body)}</p>
      </div>
      <span class="mine-state${item.approved ? ' is-live' : ''}">${item.approved ? 'live' : 'waiting'}</span>
      <button class="mine-del" type="button" data-del-kind="${kind}" data-del-id="${item.id}"
              aria-label="Delete">✕</button>
    </li>`;
}

function render(me, user) {
  const nextUnread = posts.find((p) => !me.read.includes(p.slug));
  root.innerHTML = `
    <p class="kicker">Your desk drawer</p>
    <h1 class="display" style="font-size: clamp(2.2rem, 6vw, 3.2rem)">Account</h1>

    <div class="acct-head">
      ${avatarHtml(user, 'acct-head-ava')}
      <div>
        <h2>${esc(user.name)}</h2>
        <span class="mail">${esc(user.email || '')}</span>
      </div>
      <span class="gap"></span>
      <button class="acct-signout" type="button">Sign out</button>
    </div>

    <h3 class="acct-h">Hanko passport</h3>
    <p class="acct-sub">One stamp per chapter read. ${me.stamps.length} of ${me.allStamps.length} collected${me.stamps.length === me.allStamps.length ? '. Full set, you actually read the whole desk.' : '.'}</p>
    <div class="passport">
      ${me.allStamps.map((s) => stampHtml(s, me.stamps.includes(s))).join('')}
    </div>

    <h3 class="acct-h">Reading progress</h3>
    <div class="readring">
      ${ringHtml(me.read.length, me.totalNotes)}
      <div class="rr-copy">
        <p>${me.read.length ? `${me.read.length} of ${me.totalNotes} field notes finished.` : 'No field notes finished yet.'}</p>
        ${nextUnread ? `<p>Next up: <a class="link-u" href="/blog#${esc(nextUnread.slug)}">${esc(nextUnread.title)}</a></p>` : '<p>That is all of them. New notes land on the <a class="link-u" href="/blog">blog</a>.</p>'}
      </div>
    </div>

    <h3 class="acct-h">Your comments</h3>
    ${
      me.comments.length
        ? `<ul class="mine-list">${me.comments.map((c) => mineHtml('comment', c)).join('')}</ul>`
        : `<p class="acct-sub">Nothing yet. Leave one on any <a class="link-u" href="/experience">experience page</a> or <a class="link-u" href="/blog">blog note</a>.</p>`
    }

    <h3 class="acct-h">Your vouches</h3>
    ${
      me.testimonials.length
        ? `<ul class="mine-list">${me.testimonials.map((t) => mineHtml('testimonial', t)).join('')}</ul>`
        : `<p class="acct-sub">Worked with Varakorn? Leave a vouch on the <a class="link-u" href="/experience">experience page</a> you shared.</p>`
    }

    <div class="acct-pass">
      <h3 class="acct-h" style="margin-top:0">Password</h3>
      <p class="acct-sub" style="margin-bottom:0">${cameFromRecovery ? 'Set your new password below.' : 'Signed up with email? You can change your password here.'}</p>
      <form data-pass novalidate>
        <input class="acct-input" name="password" type="password" minlength="8"
               autocomplete="new-password" placeholder="New password, 8 characters or more" required />
        <button class="btn" type="submit">Update</button>
        <p class="acct-status" role="status" aria-live="polite"></p>
      </form>
    </div>

    <div class="acct-danger">
      <h3 class="acct-h" style="margin-top:0">Leave for good</h3>
      <p class="acct-sub" style="margin-bottom:0">Deleting your account removes your comments, vouches, stamps, reading marks and chat history. There is no undo.</p>
      <button class="acct-delete" type="button" data-del-account>Delete my account</button>
      <p class="acct-status" role="status" aria-live="polite" data-danger-status></p>
    </div>`;
}

async function load(user) {
  const status = () => root.querySelector('[data-acct-status]');
  try {
    const r = await authedFetch('/api/me');
    const me = await r.json();
    if (!r.ok) throw new Error(me.error || 'error');
    if (me.offline) {
      root.innerHTML = `<p class="kicker">Your desk drawer</p>
        <h1 class="display">Account</h1>
        <p class="note-dim">Accounts are not open yet. Check back soon.</p>`;
      return;
    }
    render(me, { ...user, email: me.user.email || user.email });
  } catch {
    if (status()) status().textContent = 'Could not load your account. Refresh to try again.';
  }
}

/* ---------- events ---------- */

root.addEventListener('click', async (e) => {
  if (e.target.closest('[data-open-auth]')) return openAuthDialog();
  if (e.target.closest('.acct-signout')) {
    await signOut();
    return;
  }
  const del = e.target.closest('[data-del-kind]');
  if (del) {
    const kind = del.dataset.delKind;
    if (!confirm(`Delete this ${kind === 'testimonial' ? 'vouch' : 'comment'}? There is no undo.`)) return;
    del.disabled = true;
    try {
      const r = await authedFetch('/api/me', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ remove: { kind, id: Number(del.dataset.delId) } }),
      });
      if (r.ok) del.closest('.mine-item').remove();
      else del.disabled = false;
    } catch {
      del.disabled = false;
    }
    return;
  }
  if (e.target.closest('[data-del-account]')) {
    const s = root.querySelector('[data-danger-status]');
    if (!confirm('Really delete your whole account? Everything goes with it, permanently.')) return;
    s.textContent = 'Deleting…';
    try {
      const r = await authedFetch('/api/me', { method: 'DELETE' });
      if (!r.ok) throw new Error();
      await signOut();
      s.textContent = '';
    } catch {
      s.textContent = 'That did not work. Try again, or email varakornm0403@gmail.com.';
      s.dataset.tone = 'err';
    }
  }
});

root.addEventListener('submit', async (e) => {
  const form = e.target.closest('[data-pass]');
  if (!form) return;
  e.preventDefault();
  const s = form.querySelector('.acct-status');
  const pw = form.querySelector('[name="password"]').value;
  if (pw.length < 8) {
    s.textContent = 'At least 8 characters.';
    s.dataset.tone = 'err';
    return;
  }
  s.textContent = 'Updating…';
  s.dataset.tone = '';
  const { error } = await supa.auth.updateUser({ password: pw });
  s.textContent = error ? 'Could not update: ' + error.message : 'Password updated.';
  s.dataset.tone = error ? 'err' : 'ok';
  if (!error) form.reset();
});

/* ---------- boot ---------- */

onAuth((session) => {
  const user = userOf(session);
  if (!user) {
    root.innerHTML = gateHtml();
    if (cameFromRecovery) openAuthDialog();
  } else {
    load(user);
  }
});
