// The account page's profile editor and sign in methods list.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

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
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));

await p.goto('http://localhost:5173/journey', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.click('.acct-signin');
await p.fill('#ad-email', EMAIL);
await p.fill('#ad-pass', PASS);
await p.click('.ad-submit');
await p.waitForTimeout(2600);
await p.goto('http://localhost:5173/account', { waitUntil: 'networkidle' });
await p.waitForTimeout(3200);

/* sign in methods */
await p.waitForSelector('.linked', { timeout: 8000 });
check((await p.locator('.linked:not(.linked--off)').count()) >= 1, 'a connected method is listed');
check((await p.locator('.linked').first().innerText()).includes('Email'), 'the email method shows for an email account');
check((await p.locator('[data-link="google"]').count()) === 1, 'Google offers a Connect button when not linked');
check((await p.locator('[data-unlink]').count()) === 0, 'no Remove button when it is the only way in');

/* edit the display name */
await p.click('[data-edit-profile]');
await p.waitForTimeout(300);
check(await p.locator('[data-profile-form]').isVisible(), 'Edit profile opens the form');
await p.fill('[name="name"]', 'Renamed Tanuki');
await p.click('[data-profile-form] button[type="submit"]');
await p.waitForTimeout(2500);
check((await p.locator('[data-name-view]').innerText()).includes('Renamed Tanuki'), 'the name updates on screen');

// it must survive a reload, i.e. actually be saved
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(3200);
check((await p.locator('.acct-head h2').innerText()).includes('Renamed Tanuki'), 'the new name survives a reload');
// and the nav avatar + profiles row agree
const dbName = await p.evaluate(async () => {
  const { authedFetch } = await import('/src/js/supa.js');
  const me = await (await authedFetch('/api/me')).json();
  return me.user.name;
});
check(dbName === 'Renamed Tanuki', 'the profiles row that comments join against is updated (' + dbName + ')');

/* upload a photo */
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
writeFileSync('.shots/tiny.png', png);
await p.setInputFiles('[data-photo-input]', '.shots/tiny.png');
await p.waitForTimeout(4000);
const photoStatus = await p.locator('[data-profile-status]').innerText();
check(/updated/i.test(photoStatus), 'photo upload succeeds (' + photoStatus + ')');
const src = await p.getAttribute('.acct-head-ava', 'src');
check(!!src && src.includes('/storage/v1/object/public/avatars/'), 'the avatar now points at the storage bucket');
const headOk = src ? (await p.request.get(src)).status() : 0;
check(headOk === 200, 'the uploaded avatar is publicly readable (' + headOk + ')');

await p.screenshot({ path: '.shots/account/profile-edit.png', fullPage: false });
await b.close();

/* put the test user back as we found it, so the suites can run in any order */
const users = await fetch(env.SUPABASE_URL + '/auth/v1/admin/users?per_page=50', {
  headers: { apikey: env.SUPABASE_SECRET_KEY, authorization: 'Bearer ' + env.SUPABASE_SECRET_KEY },
}).then((r) => r.json());
const me = (users.users || []).find((u) => u.email === EMAIL);
if (me) {
  await fetch(env.SUPABASE_URL + '/auth/v1/admin/users/' + me.id, {
    method: 'PUT',
    headers: { apikey: env.SUPABASE_SECRET_KEY, authorization: 'Bearer ' + env.SUPABASE_SECRET_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ user_metadata: { full_name: 'Test Tanuki', avatar_url: null } }),
  });
  console.log('test user name restored');
}
const real = errors.filter((e) => !/401/.test(e));
if (real.length) { console.log('page errors:', real.join(' | ')); fails.push('page errors'); }
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall good');
process.exitCode = fails.length ? 1 : 0;
