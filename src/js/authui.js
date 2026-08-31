// ---------------------------------------------------------------------------
// Sign in, everywhere. Puts an account button in the nav and the mobile menu
// on every page, and owns the sign in dialog: continue with Google, or email
// and password (sign in, create account, reset). Styling in authui.css.
// ---------------------------------------------------------------------------
import '../styles/authui.css';
import { supa, authConfigured, userOf, onAuth, setRemember, remembering } from './supa.js';

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENT[c]);

export const avatarHtml = (u, cls = 'acct-ava-img') =>
  u?.picture
    ? `<img class="${cls}" src="${esc(u.picture)}" alt="" referrerpolicy="no-referrer" />`
    : `<span class="${cls} is-letter">${esc((u?.name || '?')[0].toUpperCase())}</span>`;

/* ---------- the dialog ---------- */

let dlg = null;
let mode = 'signin'; // signin | signup | reset

function say(msg, tone = '') {
  const s = dlg?.querySelector('.ad-status');
  if (s) {
    s.textContent = msg;
    s.dataset.tone = tone;
  }
}

function renderMode() {
  if (!dlg) return;
  const title = dlg.querySelector('.ad-title');
  const pass = dlg.querySelector('.ad-pass-row');
  const main = dlg.querySelector('.ad-submit');
  title.textContent =
    mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Sign in';
  pass.hidden = mode === 'reset';
  const rem = dlg.querySelector('[data-remember-row]');
  if (rem) rem.hidden = mode === 'reset';
  const pw = dlg.querySelector('[name="password"]');
  if (pw) pw.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  main.textContent =
    mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in';
  dlg.querySelectorAll('[data-mode]').forEach((b) => {
    b.classList.toggle('is-on', b.dataset.mode === mode);
  });
  say('');
}

function buildDialog() {
  if (dlg) return dlg;
  dlg = document.createElement('div');
  dlg.className = 'authdlg';
  dlg.innerHTML = `
    <div class="ad-scrim" data-close></div>
    <div class="ad-card" role="dialog" aria-modal="true" aria-label="Sign in">
      <button class="ad-close" type="button" data-close aria-label="Close">&#10005;</button>
      <span class="ad-hanko" aria-hidden="true">V</span>
      <h3 class="ad-title">Sign in</h3>
      <p class="ad-sub">Comment, vouch, collect stamps, and the desk terminal remembers you.</p>
      <button class="ad-google" type="button">
        <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z"/><path fill="#34A853" d="M9 18a8.6 8.6 0 0 0 5.96-2.18l-2.92-2.26a5.4 5.4 0 0 1-8.09-2.85H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 .96 4.96l2.99 2.33A5.36 5.36 0 0 1 9 3.58z"/></svg>
        Continue with Google
      </button>
      <div class="ad-or"><span>or with email</span></div>
      <form class="ad-form" novalidate>
        <label class="ad-label" for="ad-email">Email</label>
        <input class="ad-input" id="ad-email" name="email" type="email" autocomplete="email" required />
        <div class="ad-pass-row">
          <label class="ad-label" for="ad-pass">Password</label>
          <div class="ad-pass-wrap">
            <input class="ad-input" id="ad-pass" name="password" type="password"
                   autocomplete="current-password" minlength="8" required />
            <button class="ad-eye" type="button" data-eye aria-pressed="false"
                    aria-label="Show password" title="Show password">
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor"
                   stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
                <circle cx="12" cy="12" r="2.6" />
                <path class="ad-eye-slash" d="M4 20 20 4" />
              </svg>
            </button>
          </div>
        </div>
        <label class="ad-remember" data-remember-row>
          <input type="checkbox" name="remember" checked />
          <span>Keep me signed in on this device</span>
        </label>
        <button class="btn ad-submit" type="submit">Sign in</button>
        <p class="ad-status" role="status" aria-live="polite"></p>
      </form>
      <div class="ad-switch">
        <button type="button" data-mode="signin">Sign in</button>
        <button type="button" data-mode="signup">New here? Create account</button>
        <button type="button" data-mode="reset">Forgot password</button>
      </div>
    </div>`;
  document.body.appendChild(dlg);

  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeAuthDialog();
    const sw = e.target.closest('[data-mode]');
    if (sw) {
      mode = sw.dataset.mode;
      renderMode();
    }
  });

  const eye = dlg.querySelector('[data-eye]');
  eye.addEventListener('click', () => {
    const input = dlg.querySelector('[name="password"]');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    eye.title = show ? 'Hide password' : 'Show password';
    eye.classList.toggle('is-shown', show);
    input.focus({ preventScroll: true });
  });

  const rememberBox = dlg.querySelector('[name="remember"]');
  rememberBox.checked = remembering();
  rememberBox.addEventListener('change', () => setRemember(rememberBox.checked));

  dlg.querySelector('.ad-google').addEventListener('click', async () => {
    setRemember(rememberBox.checked); // applies to the Google round trip too
    say('Heading to Google…');
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.href },
    });
    if (error) say('Google sign in is not ready yet. Use email for now.', 'err');
  });

  dlg.querySelector('.ad-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = dlg.querySelector('[name="email"]').value.trim();
    const password = dlg.querySelector('[name="password"]').value;
    if (!email) return say('Your email first.', 'err');

    const btn = dlg.querySelector('.ad-submit');
    btn.disabled = true;
    setRemember(rememberBox.checked);
    try {
      if (mode === 'reset') {
        say('Sending…');
        const { error } = await supa.auth.resetPasswordForEmail(email, {
          redirectTo: location.origin + '/account',
        });
        if (error) throw error;
        say('Sent. Check your inbox for the reset link.', 'ok');
      } else if (mode === 'signup') {
        if (password.length < 8) return say('Password needs at least 8 characters.', 'err');
        say('Creating…');
        const { data, error } = await supa.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          say('Welcome in.', 'ok');
          setTimeout(closeAuthDialog, 500);
        } else {
          say('Almost there. Confirm the email we just sent you, then sign in.', 'ok');
        }
      } else {
        say('Signing in…');
        const { error } = await supa.auth.signInWithPassword({ email, password });
        if (error) throw error;
        say('Welcome back.', 'ok');
        setTimeout(closeAuthDialog, 400);
      }
    } catch (err) {
      const m = String(err?.message || '');
      say(
        /confirm/i.test(m)
          ? 'That email is not confirmed yet. Check your inbox.'
          : /invalid login/i.test(m)
            ? 'Wrong email or password.'
            : /already registered/i.test(m)
              ? 'That email already has an account. Sign in instead.'
              : 'That did not work. ' + m,
        'err'
      );
    } finally {
      btn.disabled = false;
    }
  });

  return dlg;
}

export function openAuthDialog(startMode = 'signin') {
  if (!authConfigured) return;
  mode = startMode;
  buildDialog();
  // never reopen with a previously revealed password still on screen
  const pw = dlg.querySelector('[name="password"]');
  const eyeBtn = dlg.querySelector('[data-eye]');
  pw.type = 'password';
  pw.value = '';
  eyeBtn.setAttribute('aria-pressed', 'false');
  eyeBtn.setAttribute('aria-label', 'Show password');
  eyeBtn.classList.remove('is-shown');
  dlg.querySelector('[name="remember"]').checked = remembering();
  renderMode();
  dlg.classList.add('is-open');
  document.body.classList.add('menu-locked');
  setTimeout(() => dlg.querySelector('[name="email"]')?.focus(), 60);
}

export function closeAuthDialog() {
  dlg?.classList.remove('is-open');
  document.body.classList.remove('menu-locked');
}

/* ---------- nav + mobile menu chrome ---------- */

function renderChrome(session) {
  const user = userOf(session);

  let slot = document.querySelector('.acct-slot');
  if (!slot) {
    const cta = document.querySelector('.nav-cta');
    if (!cta) return;
    slot = document.createElement('span');
    slot.className = 'acct-slot';
    cta.parentNode.insertBefore(slot, cta);
  }
  slot.innerHTML = user
    ? `<a class="acct-ava" href="/account" title="Your account" aria-label="Your account">${avatarHtml(user)}</a>`
    : `<button class="acct-signin" type="button">Sign in</button>`;
  slot.querySelector('.acct-signin')?.addEventListener('click', () => openAuthDialog());

  let mslot = document.querySelector('.acct-mslot');
  if (!mslot) {
    const foot = document.querySelector('.menu-foot');
    if (!foot) return;
    mslot = document.createElement('div');
    mslot.className = 'acct-mslot';
    foot.prepend(mslot);
  }
  mslot.innerHTML = user
    ? `<a class="btn btn--ghost acct-mbtn" href="/account">${avatarHtml(user, 'acct-mava')} My account</a>`
    : `<button class="btn btn--ghost acct-mbtn" type="button">Sign in / Create account</button>`;
  mslot.querySelector('button.acct-mbtn')?.addEventListener('click', () => {
    // fold the drawer away first so the dialog is not underneath it
    document.querySelector('.menu')?.classList.remove('is-open');
    document.querySelector('.burger')?.classList.remove('is-open');
    document.body.classList.remove('menu-locked');
    openAuthDialog();
  });
}

/** Mount the account chrome. Called once per page from ui.js. */
export function initAuthUI() {
  if (!authConfigured) return;
  onAuth((session) => renderChrome(session));
}
