// The accounts build, end to end against a live dev server + real Supabase.
//   node scripts/check-account.mjs
// Uses the confirmed e2e test user (e2e-tester@example.com).
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const B = 'http://localhost:5173';
const EMAIL = 'e2e-tester@example.com';
const PASS = 'vk-e2e-Pass123';
mkdirSync('.shots/account', { recursive: true });

/* the test user provisions itself (confirmed, via the admin API) so this
   check survives account deletion tests and fresh databases */
const env = {};
for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=');
  if (i > 0 && !line.trim().startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
const probe = await fetch(env.SUPABASE_URL + '/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
});
if (!probe.ok) {
  const made = await fetch(env.SUPABASE_URL + '/auth/v1/admin/users', {
    method: 'POST',
    headers: { apikey: env.SUPABASE_SECRET_KEY, authorization: 'Bearer ' + env.SUPABASE_SECRET_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS, email_confirm: true, user_metadata: { full_name: 'Test Tanuki' } }),
  });
  console.log(made.ok ? 'provisioned the e2e test user' : 'could not provision the test user: HTTP ' + made.status);
}

const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
p.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));

const fails = [];
const check = (ok, label) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) fails.push(label);
};

/* 1. nav shows Sign in on a plain page */
await p.goto(`${B}/journey`, { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
check((await p.locator('.acct-signin').count()) === 1, 'nav shows a Sign in button when signed out');

/* 2. dialog opens, bad password fails politely */
await p.click('.acct-signin');
await p.waitForTimeout(400);
check(await p.locator('.authdlg.is-open').isVisible(), 'sign in dialog opens');
check((await p.locator('.ad-google').count()) === 1, 'dialog offers Continue with Google');
await p.fill('#ad-email', EMAIL);
await p.fill('#ad-pass', 'wrong-password');
await p.click('.ad-submit');
await p.waitForTimeout(1800);
check(/wrong email or password/i.test(await p.locator('.ad-status').textContent()), 'wrong password says so plainly');

/* 3. real sign in */
await p.fill('#ad-pass', PASS);
await p.click('.ad-submit');
await p.waitForTimeout(2500);
check(!(await p.locator('.authdlg.is-open').count()) || !(await p.locator('.authdlg.is-open').isVisible()), 'dialog closes after sign in');
check((await p.locator('.acct-ava').count()) === 1, 'nav shows the avatar when signed in');
await p.screenshot({ path: '.shots/account/signed-in-nav.png' });

/* 4. guestbook + vouch on an experience page */
await p.goto(`${B}/experience/gamuda-ai-academy`, { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
check((await p.locator('.vouches .gb-form').count()) === 1, 'vouch form renders for a signed in user');
check((await p.locator('[data-guestbook] .gb-form').count()) === 1, 'comment form renders too');
const nonce = 'e2e ' + Date.now();
await p.fill('.vouches [name="relation"]', 'JAAVIS teammate');
await p.fill('.vouches [name="body"]', 'Great team lead. ' + nonce);
await p.click('.vouches .gb-submit');
await p.waitForTimeout(1800);
check(/approves/i.test(await p.locator('.vouches .gb-status').textContent()), 'vouch lands as pending');
await p.fill('[data-guestbook] [name="body"]', 'Guestbook check. ' + nonce);
await p.click('[data-guestbook] .gb-submit');
await p.waitForTimeout(1800);
check(/approves/i.test(await p.locator('[data-guestbook] .gb-status').textContent()), 'comment lands as pending');

/* 5. earn a stamp + a reading mark directly (the UI waits 20s by design) */
const marks = await p.evaluate(async () => {
  const { authedFetch } = await import('/src/js/supa.js');
  const post = (body) => authedFetch('/api/me', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.status);
  return {
    stamp: await post({ stamp: '/experience/gamuda-ai-academy' }),
    read: await post({ read: 'learning-rag-the-hard-way' }),
    badStamp: await post({ stamp: '/experience/not-a-page' }),
  };
});
check(marks.stamp === 200, 'stamp accepted for a real chapter');
check(marks.read === 200, 'reading mark accepted for a real note');
check(marks.badStamp === 400, 'fake stamp rejected');

/* 6. the account page shows all of it */
await p.goto(`${B}/account`, { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);
check((await p.locator('.acct-head h2').textContent())?.includes('Test Tanuki'), 'account page greets by name');
check((await p.locator('.pp-stamp.is-got').count()) >= 1, 'passport shows the earned stamp');
check(/1 \/ 18|1 of 18/.test(await p.locator('.rr-svg').getAttribute('aria-label') + (await p.locator('.rr-num').textContent())), 'reading ring says 1 of 18');
check((await p.locator('.mine-item').count()) >= 2, 'own comment and vouch are listed');
check((await p.locator('.mine-state:not(.is-live)').count()) >= 2, 'both marked waiting for approval');
await p.screenshot({ path: '.shots/account/account-page.png', fullPage: true });

/* 7. terminal gate for anonymous visitors (fresh context, API level) */
const gate = await p.evaluate(async () => {
  const msgs = [];
  let gated = null;
  for (let i = 1; i <= 4; i++) {
    msgs.push({ role: 'user', text: 'hello ' + i });
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: msgs }) });
    const j = await r.json();
    msgs.push({ role: 'model', text: j.reply || '' });
    gated = Boolean(j.gate);
  }
  return gated;
});
check(gate === true, 'anonymous chat gates after 3 free questions');

/* 8. signed in chat stores history */
const hist = await p.evaluate(async () => {
  const { authedFetch } = await import('/src/js/supa.js');
  await authedFetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', text: 'remember me test' }] }) }).then((r) => r.json());
  const h = await authedFetch('/api/chat').then((r) => r.json());
  return h.history?.map((m) => m.text).join(' | ') || '';
});
check(hist.includes('remember me test'), 'signed in chat history persists server side');

/* 9. sign out from the account page */
await p.click('.acct-signout');
await p.waitForTimeout(2000);
check((await p.locator('.acct-gate').count()) === 1, 'sign out returns the account page to its gate');

await browser.close();
const realErrors = errors.filter((e) => !/401|Failed to load resource|tiktok|fburl|ErrorUtils|Permissions policy/i.test(e));
if (realErrors.length) {
  console.log('\nconsole/page errors:');
  realErrors.forEach((e) => console.log('  ' + e));
  fails.push('console errors');
}
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall good');
process.exitCode = fails.length ? 1 : 0;
