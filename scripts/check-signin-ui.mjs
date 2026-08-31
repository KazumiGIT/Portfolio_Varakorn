// The sign in dialog's two switches: reveal the password, and mean it when
// "keep me signed in" is unchecked. Needs a live dev server.
import { chromium } from 'playwright';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EMAIL = 'e2e-tester@example.com';
const PASS = 'vk-e2e-Pass123';
const env = {};
for (const l of readFileSync('.env', 'utf8').split(/\r?\n/)) {
  const i = l.indexOf('=');
  if (i > 0 && !l.trim().startsWith('#')) env[l.slice(0, i).trim()] = l.slice(i + 1).trim();
}
await fetch(env.SUPABASE_URL + '/auth/v1/admin/users', {
  method: 'POST',
  headers: { apikey: env.SUPABASE_SECRET_KEY, authorization: 'Bearer ' + env.SUPABASE_SECRET_KEY, 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASS, email_confirm: true, user_metadata: { full_name: 'Test Tanuki' } }),
});

const fails = [];
const check = (ok, label) => { console.log(`${ok ? '✓' : '✗'} ${label}`); if (!ok) fails.push(label); };
const b = await chromium.launch({ channel: 'msedge' });

/* ---------- the eye ---------- */
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://localhost:5173/journey', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.click('.acct-signin');
await p.waitForTimeout(400);
await p.fill('#ad-pass', 'hunter2secret');
check((await p.getAttribute('#ad-pass', 'type')) === 'password', 'password starts hidden');
await p.click('[data-eye]');
await p.waitForTimeout(200);
check((await p.getAttribute('#ad-pass', 'type')) === 'text', 'the eye reveals it');
check((await p.getAttribute('[data-eye]', 'aria-pressed')) === 'true', 'aria-pressed tracks the state');
check((await p.inputValue('#ad-pass')) === 'hunter2secret', 'the typed value survives the toggle');
await p.click('[data-eye]');
await p.waitForTimeout(200);
check((await p.getAttribute('#ad-pass', 'type')) === 'password', 'clicking again hides it');
// reopening must not leak a revealed password
await p.click('[data-eye]');
await p.click(".ad-close");
await p.waitForTimeout(300);
await p.click('.acct-signin');
await p.waitForTimeout(300);
check((await p.getAttribute('#ad-pass', 'type')) === 'password' && (await p.inputValue('#ad-pass')) === '', 'reopening starts clean and hidden');
check((await p.isChecked('[name="remember"]')), 'keep me signed in is on by default');
await p.screenshot({ path: '.shots/account/dialog-switches.png' });
await ctx.close();

/* ---------- remember me, for real: persistent profiles ---------- */
async function run(remember) {
  const dir = mkdtempSync(join(tmpdir(), 'vk-rem-'));
  let c = await chromium.launchPersistentContext(dir, { channel: 'msedge', viewport: { width: 1280, height: 900 } });
  let pg = c.pages()[0] || (await c.newPage());
  await pg.goto('http://localhost:5173/journey', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(2500);
  await pg.click('.acct-signin');
  await pg.waitForTimeout(400);
  if (!remember) await pg.uncheck('[name="remember"]');
  await pg.fill('#ad-email', EMAIL);
  await pg.fill('#ad-pass', PASS);
  await pg.click('.ad-submit');
  await pg.waitForTimeout(2600);
  const inNow = (await pg.locator('.acct-ava').count()) === 1;
  const where = await pg.evaluate(() => {
    const has = (s) => { try { return Object.keys(s).some((k) => k.includes('auth-token')); } catch { return false; } };
    return { local: has(localStorage), session: has(sessionStorage) };
  });
  // close the whole browser, reopen the same profile: a new browsing session
  await c.close();
  c = await chromium.launchPersistentContext(dir, { channel: 'msedge', viewport: { width: 1280, height: 900 } });
  pg = c.pages()[0] || (await c.newPage());
  await pg.goto('http://localhost:5173/journey', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(3000);
  const inAfter = (await pg.locator('.acct-ava').count()) === 1;
  await c.close();
  return { inNow, where, inAfter };
}

const kept = await run(true);
check(kept.inNow, 'checked: signs in');
check(kept.where.local && !kept.where.session, 'checked: session stored in localStorage');
check(kept.inAfter, 'checked: STILL signed in after the browser restarts');

const forgot = await run(false);
check(forgot.inNow, 'unchecked: signs in');
check(forgot.where.session && !forgot.where.local, 'unchecked: session stored in sessionStorage');
check(!forgot.inAfter, 'unchecked: FORGOTTEN after the browser restarts');

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall good');
process.exitCode = fails.length ? 1 : 0;
