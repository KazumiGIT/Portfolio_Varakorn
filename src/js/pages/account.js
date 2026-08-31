// ---------------------------------------------------------------------------
// /account: the visitor's desk drawer. Editable name and photo, the sign in
// methods on the account, hanko passport, their comments and
// vouches, password change, sign out, delete account.
// The profile itself lives on the Supabase auth user; /api/me mirrors it onto
// profiles so existing comments pick up the new name and face.
// ---------------------------------------------------------------------------
import '../../styles/main.css';
import '../../styles/expnav.css';
import '../../styles/account.css';
import { initSite } from '../ui.js';
import { renderSocials } from '../render.js';
import { supa, userOf, onAuth, authedFetch, signOut } from '../supa.js';
import { openAuthDialog, avatarHtml } from '../authui.js';
import { askConfirm } from '../confirm.js';
import { experience, posts } from '../data.js';

renderSocials();
initSite();

const root = document.querySelector('[data-acct]');
const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

const PROVIDERS = {
  google: { label: 'Google', note: 'Sign in with your Google account' },
  email: { label: 'Email and password', note: 'Sign in with your email address' },
};
const providerLabel = (id) => PROVIDERS[id]?.label || id;

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

function skeletonHtml() {
  const stamp = `
    <span class="pp-stamp">
      <span class="pp-seal sk"></span>
      <span class="pp-name sk sk-line" style="width:70%">&nbsp;</span>
    </span>`;
  return `
    <p class="kicker">Your desk drawer</p>
    <h1 class="display" style="font-size: clamp(2.2rem, 6vw, 3.2rem)">Account</h1>
    <div class="acct-head">
      <span class="sk sk-ava"></span>
      <div style="flex:1; max-width:14rem; display:flex; flex-direction:column; gap:.5rem">
        <span class="sk sk-line" style="width:60%">&nbsp;</span>
        <span class="sk sk-line" style="width:90%; height:.8em">&nbsp;</span>
      </div>
    </div>
    <h3 class="acct-h">Hanko passport</h3>
    <p class="acct-sub sk sk-line" style="max-width:16rem">&nbsp;</p>
    <div class="passport">${stamp.repeat(6)}</div>`;
}

function gateHtml() {
  return `
    <p class="kicker">Your desk drawer</p>
    <h1 class="display" style="font-size: clamp(2.2rem, 6vw, 3.2rem)">Account</h1>
    <div class="acct-gate" data-reveal>
      <p>Sign in to collect passport stamps, leave comments and vouches, and let the desk terminal remember you. New here? Creating an account takes a minute.</p>
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

const mineReg = new Map();

function mineHtml(kind, item) {
  mineReg.set(kind + ':' + item.id, item);
  return `
    <li class="mine-item" data-mine="${kind}:${item.id}">
      <div class="mine-body">
        <a class="mine-page link-u" href="${esc(pageHref(item.page))}">${esc(pageLabel(item.page))}</a>
        <p data-mine-text>${esc(item.relation ? item.relation + ' · ' + item.body : item.body)}</p>
        <div class="mine-edit-slot"></div>
      </div>
      <span class="mine-state${item.approved ? ' is-live' : ''}">${item.approved ? 'live' : 'hidden'}</span>
      <button class="gb-mini" type="button" data-mine-edit="${kind}:${item.id}">Edit</button>
      <button class="mine-del" type="button" data-del-kind="${kind}" data-del-id="${item.id}"
              aria-label="Delete">✕</button>
    </li>`;
}

function render(me, user) {
  root.innerHTML = `
    <p class="kicker">Your desk drawer</p>
    <h1 class="display" style="font-size: clamp(2.2rem, 6vw, 3.2rem)">Account</h1>

    <div class="acct-head">
      <span class="acct-ava-edit">
        ${avatarHtml(user, 'acct-head-ava')}
        <button class="acct-ava-btn" type="button" data-photo title="Change photo"
                aria-label="Change your photo">Change</button>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden data-photo-input />
      </span>
      <div class="acct-who">
        <h2 data-name-view>${esc(user.name)}</h2>
        <span class="acct-title-view" data-title-view ${user.title ? '' : 'hidden'}>${esc(user.title || '')}</span>
        <span class="mail">${esc(user.email || '')}</span>
      </div>
      <span class="gap"></span>
      <button class="acct-edit" type="button" data-edit-profile>Edit profile</button>
      <button class="acct-signout" type="button">Sign out</button>
      <form class="acct-edit-form" data-profile-form hidden novalidate>
        <label class="ad-label" for="acct-name">Display name</label>
        <input class="acct-input" id="acct-name" name="name" maxlength="60" required
               value="${esc(user.name)}" placeholder="What should people call you?" />

        <label class="ad-label" for="acct-title">Title</label>
        <input class="acct-input" id="acct-title" name="title" maxlength="80"
               value="${esc(user.title || '')}"
               placeholder="How do you know Varakorn? Or what you do these days" />

        <label class="ad-label" for="acct-bio">About you</label>
        <textarea class="acct-input acct-area" id="acct-bio" name="bio" maxlength="280" rows="3"
                  placeholder="A couple of lines, if you feel like it">${esc(user.bio || '')}</textarea>

        <label class="ad-label">Links <span class="ad-label-soft">Instagram, LinkedIn, TikTok, your site, up to 5</span></label>
        <div class="acct-links" data-links>
          ${[...(user.links || []), '']
            .slice(0, 5)
            .map(
              (l) => `<input class="acct-input" name="link" maxlength="200" inputmode="url"
                             value="${esc(l)}" placeholder="instagram.com/you" />`
            )
            .join('')}
        </div>

        <div class="acct-edit-actions">
          <button class="btn" type="submit">Save</button>
          <button class="acct-cancel" type="button" data-cancel-profile>Cancel</button>
        </div>
        <p class="acct-hint">Your name, title, bio and links show on the little profile card when someone taps your name in the guestbook.</p>
        <p class="acct-status" role="status" aria-live="polite" data-profile-status></p>
      </form>
    </div>

    <h3 class="acct-h">Sign in methods</h3>
    <p class="acct-sub">Ways you can get back into this account. Adding one means you can use either.</p>
    <ul class="linked-list" data-identities><li class="linked-loading">Checking…</li></ul>

    <h3 class="acct-h">Hanko passport</h3>
    <p class="acct-sub">One stamp per chapter read. ${me.stamps.length} of ${me.allStamps.length} collected${me.stamps.length === me.allStamps.length ? '. Full set, you actually read the whole desk.' : '.'}</p>
    <div class="passport">
      ${me.allStamps.map((s) => stampHtml(s, me.stamps.includes(s))).join('')}
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
        <span class="acct-pass-wrap">
          <input class="acct-input" name="password" type="password" minlength="8"
                 autocomplete="new-password" placeholder="New password, 8 characters or more" required />
          <button class="ad-eye" type="button" data-eye aria-pressed="false" aria-label="Show password">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor"
                 stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
              <circle cx="12" cy="12" r="2.6" />
              <path class="ad-eye-slash" d="M4 20 20 4" />
            </svg>
          </button>
        </span>
        <button class="btn" type="submit">Update</button>
        <p class="acct-status" role="status" aria-live="polite"></p>
      </form>
    </div>

    <div class="acct-danger">
      <h3 class="acct-h" style="margin-top:0">Leave for good</h3>
      <p class="acct-sub" style="margin-bottom:0">Deleting your account removes your comments, vouches, stamps and chat history. There is no undo.</p>
      <button class="acct-delete" type="button" data-del-account>Delete my account</button>
      <p class="acct-status" role="status" aria-live="polite" data-danger-status></p>
    </div>`;
}

/* Which sign in methods hang off this account, and the buttons to add or
   drop one. Supabase calls them identities; manual linking has to be enabled
   in the dashboard before a second one can be attached. */
async function renderIdentities() {
  const host = root.querySelector('[data-identities]');
  if (!host) return;
  const { data, error } = await supa.auth.getUserIdentities();
  const list = data?.identities || [];
  if (error || !list.length) {
    host.innerHTML = `<li class="linked-loading">Could not read your sign in methods.</li>`;
    return;
  }
  const have = new Set(list.map((i) => i.provider));
  const canUnlink = list.length > 1;

  host.innerHTML =
    list
      .map((i) => {
        const when = i.created_at
          ? new Date(i.created_at).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })
          : '';
        return `
        <li class="linked">
          <span class="linked-mark linked-mark--${esc(i.provider)}" aria-hidden="true">${
            i.provider === 'google' ? 'G' : '@'
          }</span>
          <span class="linked-body">
            <strong>${esc(providerLabel(i.provider))}</strong>
            <span>${esc(i.identity_data?.email || '')}${when ? ' · added ' + esc(when) : ''}</span>
          </span>
          <span class="linked-state">connected</span>
          ${
            canUnlink
              ? `<button class="linked-btn" type="button" data-unlink="${esc(i.identity_id || i.id)}"
                         data-unlink-provider="${esc(i.provider)}">Remove</button>`
              : ''
          }
        </li>`;
      })
      .join('') +
    Object.keys(PROVIDERS)
      .filter((id) => !have.has(id))
      .map(
        (id) => `
        <li class="linked linked--off">
          <span class="linked-mark" aria-hidden="true">${id === 'google' ? 'G' : '@'}</span>
          <span class="linked-body">
            <strong>${esc(providerLabel(id))}</strong>
            <span>${esc(PROVIDERS[id].note)}</span>
          </span>
          ${
            id === 'google'
              ? `<button class="linked-btn linked-btn--add" type="button" data-link="google">Connect</button>`
              : `<span class="linked-state">use Forgot password to set one</span>`
          }
        </li>`
      )
      .join('') +
    `<li class="linked-note" data-link-status role="status" aria-live="polite"></li>`;
}

async function load(user) {
  const status = () => root.querySelector('[data-acct-status]');
  root.innerHTML = skeletonHtml();
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
    renderIdentities();
  } catch {
    root.innerHTML = `<p class="kicker">Your desk drawer</p>
      <h1 class="display" style="font-size: clamp(2.2rem, 6vw, 3.2rem)">Account</h1>
      <p class="note-dim" data-acct-status>Could not load your account. Refresh to try again.</p>`;
    void status;
  }
}

/* ---------- events ---------- */

/* the auth user is the source of truth for name and photo; /api/me copies it
   onto profiles so old comments show the new one */
async function saveProfile(patch) {
  const { error } = await supa.auth.updateUser({ data: patch });
  if (error) throw new Error(error.message);
  await authedFetch('/api/me', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sync: true }),
  });
}

root.addEventListener('click', async (e) => {
  const eye = e.target.closest('[data-eye]');
  if (eye) {
    const input = eye.closest('.acct-pass-wrap').querySelector('[name="password"]');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    eye.classList.toggle('is-shown', show);
    return;
  }
  if (e.target.closest('[data-open-auth]')) return openAuthDialog();
  if (e.target.closest('.acct-signout')) {
    await signOut();
    return;
  }

  // profile editing
  if (e.target.closest('[data-edit-profile]')) {
    root.querySelector('[data-profile-form]').hidden = false;
    root.querySelector('[data-edit-profile]').hidden = true;
    root.querySelector('[name="name"]').focus();
    return;
  }
  if (e.target.closest('[data-cancel-profile]')) {
    root.querySelector('[data-profile-form]').hidden = true;
    root.querySelector('[data-edit-profile]').hidden = false;
    return;
  }
  if (e.target.closest('[data-photo]')) {
    root.querySelector('[data-photo-input]').click();
    return;
  }

  // sign in methods
  const link = e.target.closest('[data-link]');
  if (link) {
    const note = root.querySelector('[data-link-status]');
    note.textContent = 'Opening ' + providerLabel(link.dataset.link) + '…';
    const { error } = await supa.auth.linkIdentity({
      provider: link.dataset.link,
      options: { redirectTo: location.origin + '/account' },
    });
    if (error) {
      note.textContent = /manual linking|not enabled/i.test(error.message)
        ? 'Connecting a second method is switched off for this site right now.'
        : 'Could not connect that: ' + error.message;
      note.dataset.tone = 'err';
    }
    return;
  }
  const unlink = e.target.closest('[data-unlink]');
  if (unlink) {
    const name = providerLabel(unlink.dataset.unlinkProvider);
    if (!confirm('Remove ' + name + ' from this account? You will need another way to sign in.')) return;
    const note = root.querySelector('[data-link-status]');
    note.textContent = 'Removing…';
    note.dataset.tone = '';
    const { data } = await supa.auth.getUserIdentities();
    const target = (data?.identities || []).find(
      (i) => String(i.identity_id || i.id) === unlink.dataset.unlink
    );
    const { error } = target
      ? await supa.auth.unlinkIdentity(target)
      : { error: new Error('not found') };
    if (error) {
      note.textContent = /manual linking|not enabled/i.test(error.message)
        ? 'Removing a method is switched off for this site right now.'
        : 'Could not remove that: ' + error.message;
      note.dataset.tone = 'err';
    } else {
      note.textContent = name + ' removed.';
      note.dataset.tone = 'ok';
      renderIdentities();
    }
    return;
  }
  const editBtn = e.target.closest('[data-mine-edit]');
  if (editBtn) {
    const key = editBtn.dataset.mineEdit;
    const item = mineReg.get(key);
    const li = editBtn.closest('.mine-item');
    const slot = li.querySelector('.mine-edit-slot');
    if (!item || slot.innerHTML) {
      slot.innerHTML = '';
      li.querySelector('[data-mine-text]').hidden = false;
      return;
    }
    const isVouch = key.startsWith('testimonial');
    slot.innerHTML = `
      <form class="mine-edit" data-mine-form="${esc(key)}" novalidate>
        ${isVouch ? `<input class="acct-input" name="relation" maxlength="80" required
                 value="${esc(item.relation || '')}" placeholder="How you know Varakorn" />` : ''}
        <textarea class="acct-input acct-area" name="body" maxlength="2000" rows="3" required>${esc(item.body)}</textarea>
        <div class="acct-edit-actions">
          <button class="btn" type="submit">Save</button>
          <button class="acct-cancel" type="button" data-mine-cancel>Cancel</button>
        </div>
        <p class="acct-status" role="status" aria-live="polite"></p>
      </form>`;
    li.querySelector('[data-mine-text]').hidden = true;
    slot.querySelector('textarea').focus();
    return;
  }
  if (e.target.closest('[data-mine-cancel]')) {
    const li = e.target.closest('.mine-item');
    li.querySelector('.mine-edit-slot').innerHTML = '';
    li.querySelector('[data-mine-text]').hidden = false;
    return;
  }

  const del = e.target.closest('[data-del-kind]');
  if (del) {
    const kind = del.dataset.delKind;
    const sure = await askConfirm({
      title: `Delete this ${kind === 'testimonial' ? 'vouch' : 'comment'}?`,
      message: 'It goes for good. You can always write a new one on that page.',
      yes: 'Delete it',
      no: 'Keep it',
      danger: true,
    });
    if (!sure) return;
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
    const sure = await askConfirm({
      title: 'Delete your whole account?',
      message: 'Comments, vouches, stamps and chat history all go with it, permanently. There is no undo.',
      yes: 'Delete everything',
      no: 'Keep my account',
      danger: true,
    });
    if (!sure) return;
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

root.addEventListener('input', (e) => {
  if (!e.target.matches('[data-links] [name="link"]')) return;
  const wrap = root.querySelector('[data-links]');
  const rows = [...wrap.querySelectorAll('[name="link"]')];
  if (rows.length < 5 && rows[rows.length - 1].value.trim()) {
    const fresh = rows[rows.length - 1].cloneNode();
    fresh.value = '';
    wrap.appendChild(fresh);
  }
});

root.addEventListener('change', async (e) => {
  const input = e.target.closest('[data-photo-input]');
  if (!input || !input.files?.length) return;
  const file = input.files[0];
  const status = root.querySelector('[data-profile-status]');
  const say = (msg, tone = '') => {
    if (status) {
      status.textContent = msg;
      status.dataset.tone = tone;
    }
  };
  if (file.size > 2 * 1024 * 1024) return say('That photo is over 2MB. Try a smaller one.', 'err');
  root.querySelector('[data-profile-form]').hidden = false;
  root.querySelector('[data-edit-profile]').hidden = true;
  say('Uploading…');
  try {
    const session = await supa.auth.getUser();
    const uid = session.data?.user?.id;
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().slice(0, 5);
    const path = `${uid}/avatar-${Date.now()}.${ext}`;
    const up = await supa.storage.from('avatars').upload(path, file, { upsert: true });
    if (up.error) throw new Error(up.error.message);
    const { data } = supa.storage.from('avatars').getPublicUrl(path);
    await saveProfile({ avatar_url: data.publicUrl });
    say('Photo updated.', 'ok');
    const img = root.querySelector('.acct-head-ava');
    if (img) {
      const fresh = document.createElement('img');
      fresh.className = 'acct-head-ava';
      fresh.src = data.publicUrl;
      fresh.alt = '';
      img.replaceWith(fresh);
    }
  } catch (err) {
    say('Could not upload that: ' + err.message, 'err');
  } finally {
    input.value = '';
  }
});

root.addEventListener('submit', async (e) => {
  const mineForm = e.target.closest('[data-mine-form]');
  if (mineForm) {
    e.preventDefault();
    const key = mineForm.dataset.mineForm;
    const item = mineReg.get(key);
    const status = mineForm.querySelector('.acct-status');
    const body = mineForm.querySelector('[name="body"]').value.trim();
    const relation = mineForm.querySelector('[name="relation"]')?.value.trim();
    if (!body || (key.startsWith('testimonial') && !relation)) {
      status.textContent = 'Nothing empty, please.';
      status.dataset.tone = 'err';
      return;
    }
    status.textContent = 'Saving…';
    status.dataset.tone = '';
    try {
      const r = key.startsWith('testimonial')
        ? await authedFetch('/api/testimonials', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ page: item.page, relation, body }),
          })
        : await authedFetch('/api/comments', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ id: Number(item.id), body }),
          });
      if (!r.ok) throw new Error((await r.json()).error || 'error');
      item.body = body;
      if (relation) item.relation = relation;
      const li = mineForm.closest('.mine-item');
      const text = li.querySelector('[data-mine-text]');
      text.textContent = relation ? relation + ' · ' + body : body;
      text.hidden = false;
      li.querySelector('.mine-edit-slot').innerHTML = '';
    } catch (err) {
      status.textContent = 'Could not save: ' + err.message;
      status.dataset.tone = 'err';
    }
    return;
  }

  const profileForm = e.target.closest('[data-profile-form]');
  if (profileForm) {
    e.preventDefault();
    const status = profileForm.querySelector('[data-profile-status]');
    const name = profileForm.querySelector('[name="name"]').value.trim();
    if (!name) {
      status.textContent = 'A name, please.';
      status.dataset.tone = 'err';
      return;
    }
    const title = profileForm.querySelector('[name="title"]').value.trim().slice(0, 80);
    const bio = profileForm.querySelector('[name="bio"]').value.trim().slice(0, 280);
    const links = [...profileForm.querySelectorAll('[name="link"]')]
      .map((i) => i.value.trim())
      .filter(Boolean)
      .map((l) => (/^https?:[/][/]/i.test(l) ? l.replace(/^http:/i, 'https:') : 'https://' + l))
      .filter((l) => /^https:[/][/][^\s]+[.][^\s]+/.test(l))
      .slice(0, 5);
    status.textContent = 'Saving…';
    status.dataset.tone = '';
    try {
      await saveProfile({ full_name: name, title, bio, links });
      root.querySelector('[data-name-view]').textContent = name;
      const tv = root.querySelector('[data-title-view]');
      tv.textContent = title;
      tv.hidden = !title;
      status.textContent = 'Saved.';
      status.dataset.tone = 'ok';
      setTimeout(() => {
        profileForm.hidden = true;
        root.querySelector('[data-edit-profile]').hidden = false;
      }, 700);
    } catch (err) {
      status.textContent = 'Could not save: ' + err.message;
      status.dataset.tone = 'err';
    }
    return;
  }

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

/* Supabase fires an auth event for a metadata change too, and rebuilding the
   whole page on one would wipe the very form that made the change. So a full
   load happens when the person changes, not when their name does; the edit
   handlers update the page in place. */
let shownId = null;
onAuth((session) => {
  const user = userOf(session);
  const id = session?.user?.id || null;
  if (!user) {
    shownId = null;
    root.innerHTML = gateHtml();
    if (cameFromRecovery) openAuthDialog();
    return;
  }
  if (id !== shownId) {
    shownId = id;
    load(user);
  }
});
