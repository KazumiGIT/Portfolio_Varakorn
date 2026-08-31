// Screenshot the washi card treatment + edge decor across all pages,
// desktop and mobile, plus one night-mode sample.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '.shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });

async function walk(page) {
  await page.evaluate(async () => {
    const step = innerHeight * 0.7;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(600);
}

async function shot(page, name, sel) {
  if (sel) {
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ behavior: 'instant' }), sel);
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

// [route, [ [shotName, selector], ... ]]
const PLAN = [
  ['home', [['home-about', '#about'], ['home-services', '#services'], ['home-chapters', '#chapters'], ['home-footer', '.footer']]],
  ['experience', [['exp-skills', '.skill-grid'], ['exp-goals', '.goal-list'], ['exp-cards', '.card-grid']]],
  ['journey', [['journey-entry', '.t-entry'], ['journey-footer', '.footer']]],
  ['blog', [['blog-posts', '.post-grid']]],
  ['contact', [['contact-stats', '.stat-row'], ['contact-chans', '.chan-grid']]],
];

// desktop
const d = await browser.newPage({ viewport: { width: 1600, height: 950 } });
for (const [route, shots] of PLAN) {
  await d.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
  await d.waitForTimeout(3200);
  await walk(d);
  for (const [name, sel] of shots) await shot(d, name, sel);
}

// night sample (blog posts)
await d.evaluate(() => {
  document.documentElement.classList.add('night');
  localStorage.theme = 'night';
});
await d.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
await d.waitForTimeout(2500);
await walk(d);
await shot(d, 'night-blog-posts', '.post-grid');
await d.close();

// mobile — first shot of each page's plan
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const [route, shots] of PLAN) {
  await m.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
  await m.evaluate(() => {
    localStorage.removeItem('theme');
    document.documentElement.classList.remove('night');
  });
  await m.waitForTimeout(2600);
  await walk(m);
  const [name, sel] = shots[0];
  await shot(m, `m-${name}`, sel);
}
await m.close();

await browser.close();
console.log('done');
