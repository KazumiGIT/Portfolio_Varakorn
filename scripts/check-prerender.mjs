// Dev-only: the pages that paint themselves from data.js must still carry their
// words in the raw HTML, and hydration must replace that seed cleanly.
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const fails = [];
const check = (ok, label) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) fails.push(label);
};

// 1. raw HTML, no JS at all
const strip = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

for (const [path, min, needle] of [
  ['/home', 750, 'Tendervise AI'],
  ['/journey', 500, 'Pasir Salak'],
  ['/experience', 700, 'JAAVIS'],
  ['/blog', 5000, 'Pydantic'],
]) {
  const raw = await (await fetch(BASE + path)).text();
  const words = strip(raw).split(' ').length;
  check(words >= min, `${path}: ${words} words in the source (want ${min}+)`);
  check(strip(raw).includes(needle), `${path}: source mentions "${needle}"`);
  const blocks = [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let parsed = 0;
  for (const b of blocks) {
    try {
      JSON.parse(b[1]);
      parsed++;
    } catch {}
  }
  check(blocks.length > 0 && parsed === blocks.length, `${path}: ${parsed}/${blocks.length} JSON-LD blocks parse`);
}

// 2. with JS, the seed is gone and the real UI is there
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
check((await page.locator('.post-card').count()) > 0, '/blog hydrates into post cards');
check((await page.locator('.post-grid .seed').count()) === 0, '/blog seed markup is replaced');

await page.goto(`${BASE}/experience`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
check((await page.locator('.tcard').count()) === 6, '/experience hydrates into 6 trading cards');
check((await page.locator('[data-cards] .seed').count()) === 0, '/experience seed markup is replaced');

await page.goto(`${BASE}/journey`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
check((await page.locator('.t-entry').count()) === 6, '/journey hydrates into 6 chapters');

await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
check((await page.locator('.proj-row').count()) > 0, '/home hydrates into project rows');
check((await page.locator('[data-services] .svc').count()) > 0, '/home hydrates into services');

// a deep link still opens the reader on the right post
await page.goto(`${BASE}/blog#learning-rag-the-hard-way`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const title = await page.locator('.reader .article h1').first().textContent().catch(() => null);
check(!!title && /RAG/i.test(title), `/blog#slug still opens the reader (${title})`);

await browser.close();
if (errors.length) {
  console.log('\nconsole/page errors:');
  errors.forEach((e) => console.log('  ' + e));
  fails.push('console errors');
}
console.log(fails.length ? `\n${fails.length} failed` : '\nall good');
process.exitCode = fails.length ? 1 : 0;
