// Screenshot the guestbook on an experience page and inside the blog reader,
// with /api/comments mocked so the check needs no database. Desktop, mobile,
// and one night-mode sample.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '.shots';
mkdirSync(OUT, { recursive: true });

const MOCK = {
  comments: [
    {
      id: 3,
      name: 'Aina',
      body: 'Found this through the bootcamp article. The HYGR chapter is my favourite, good luck with Orion!',
      created_at: '2026-08-09T04:10:00Z',
    },
    {
      id: 2,
      name: 'Daniel Wong',
      body: 'We met at the ZUS booth in Penang. Glad to see where you ended up.',
      created_at: '2026-07-30T10:00:00Z',
    },
    { id: 1, name: 'Mira', body: 'Inspiring journey. Keep going!', created_at: '2026-07-21T13:30:00Z' },
  ],
};

const browser = await chromium.launch({ channel: 'msedge' });

async function mock(page) {
  await page.route('**/api/comments*', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ json: MOCK });
    } else {
      route.fulfill({ json: { ok: true } });
    }
  });
}

async function shot(page, name, sel) {
  await page.evaluate(
    (s) => document.querySelector(s)?.scrollIntoView({ behavior: 'instant', block: 'start' }),
    sel
  );
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

// desktop: experience page section
const d = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
await mock(d);
await d.goto(`${BASE}/experience/hygr-content-creator`, { waitUntil: 'networkidle' });
await d.waitForTimeout(1500);
await shot(d, 'gb-exp', '#guestbook');

// desktop: blog reader
await d.goto(`${BASE}/blog#the-hygr-years`, { waitUntil: 'networkidle' });
await d.waitForTimeout(1500);
await d.evaluate(() => {
  document.querySelector('.reader .guestbook')?.scrollIntoView({ behavior: 'instant' });
});
await d.waitForTimeout(900);
await d.screenshot({ path: `${OUT}/gb-reader.png` });

// night mode sample
await d.evaluate(() => {
  document.documentElement.classList.add('night');
  localStorage.theme = 'night';
});
await d.goto(`${BASE}/experience/hygr-content-creator`, { waitUntil: 'domcontentloaded' });
await d.waitForTimeout(2500);
await shot(d, 'gb-exp-night', '#guestbook');
await d.close();

// mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mock(m);
await m.goto(`${BASE}/experience/hygr-content-creator`, { waitUntil: 'domcontentloaded' });
await m.evaluate(() => {
  localStorage.removeItem('theme');
  document.documentElement.classList.remove('night');
});
await m.waitForTimeout(2500);
await shot(m, 'm-gb-exp', '#guestbook');
await m.close();

await browser.close();
console.log('done');
