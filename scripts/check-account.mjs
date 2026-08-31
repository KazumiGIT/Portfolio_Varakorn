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
check((await p.locator('.vouch-open').count()) === 1, 'vouch panel offers its one button');
await p.click('.vouch-open');
await p.waitForTimeout(400);
check((await p.locator('.vouches .gb-form').count()) === 1, 'the vouch form unfolds on request');
check((await p.locator('[data-guestbook] .gb-form').count()) === 1, 'comment form renders too');
const nonce = 'e2e ' + Date.now();
await p.fill('.vouches [name="relation"]', 'JAAVIS teammate');
await p.fill('.vouches [name="body"]', 'Great team lead. ' + nonce);
await p.click('.vouches .gb-submit');
await p.waitForTimeout(500);
check(await p.locator('.vkconfirm.is-open').isVisible(), 'a confirmation asks before the vouch is left');
check(/Gamuda AI Academy/.test(await p.locator('.vkc-title').textContent()), 'the confirmation names the chapter');
await p.click('.vkc-yes');
await p.waitForTimeout(2200);
check((await p.locator('.vouch--pending').count()) >= 1, 'vouch lands as a visible pending card');
check((await p.locator('[data-v-edit]').count()) === 1 && (await p.locator('[data-v-del]').count()) === 1, 'own vouch card carries Edit and Delete');
await p.fill('[data-guestbook] [name="body"]', 'Guestbook check. ' + nonce);
await p.click('[data-guestbook] .gb-submit');
await p.waitForTimeout(500);
check(await p.locator('.vkconfirm.is-open').isVisible(), 'a confirmation asks before the comment is left');
await p.click('.vkc-yes');
await p.waitForTimeout(2200);
check((await p.locator('.gb-note--pending').count()) >= 1, 'own comment shows immediately with a waiting badge');

/* edit the comment in place, then delete it */
await p.click('[data-guestbook] [data-edit]');
await p.waitForTimeout(400);
await p.fill('.gb-edit-slot [name="body"]', 'Edited guestbook check. ' + nonce);
await p.click('.gb-edit-slot .gb-submit');
await p.waitForTimeout(2000);
check((await p.locator('.gb-note--pending .gb-body').first().innerText()).includes('Edited'), 'editing your own comment works in place');
const beforeDel = await p.locator('.gb-note').count();
await p.click('[data-guestbook] [data-del]');
await p.waitForTimeout(500);
check(await p.locator('.vkconfirm.is-open').isVisible(), 'deleting asks first');
await p.click('.vkc-yes');
await p.waitForTimeout(2000);
check((await p.locator('.gb-note').count()) === beforeDel - 1, 'own comment deletes from the page it lives on');
/* leave a fresh one so the account page checks below still see a comment */
await p.fill('[data-guestbook] [name="body"]', 'Guestbook check. ' + nonce);
await p.click('[data-guestbook] .gb-submit');
await p.waitForTimeout(500);
await p.click('.vkc-yes');
await p.waitForTimeout(1800);

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
check((await p.locator('.readring, .rr-svg').count()) === 0, 'no reading ring on the account page');
check((await p.locator('.mine-item').count()) >= 2, 'own comment and vouch are listed');
check((await p.locator('.mine-state:not(.is-live)').count()) >= 2, 'both marked waiting for approval');
check((await p.locator('[data-mine-edit]').count()) >= 2, 'both carry an Edit button on the profile page');
await p.locator('[data-mine-edit]').first().click();
await p.waitForTimeout(400);
await p.fill('.mine-edit [name="body"]', 'Edited from my profile page.');
await p.click('.mine-edit button[type="submit"]');
await p.waitForTimeout(2000);
check((await p.locator('.mine-item').first().locator('[data-mine-text]').innerText()).includes('Edited from my profile page'), 'editing from the profile page saves in place');
await p.screenshot({ path: '.shots/account/account-page.png', fullPage: true });

/* 7. the terminal is account only: an anonymous request gates immediately */
const gate = await p.evaluate(async () => {
  const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', text: 'hello' }] }) });
  return await r.json();
});
check(gate.gate === true && !gate.error, 'anonymous chat gates on the very first question');
check(/sign in/i.test(gate.reply || ''), 'the gate message points at the Sign in button');

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
