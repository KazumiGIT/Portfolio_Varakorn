// Screenshot the guestbook comments on an experience page and inside the
// blog reader, with the API mocked (signed in, threads, likes) so the check
// needs no database or Google account. Desktop, mobile, night mode.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '.shots';
mkdirSync(OUT, { recursive: true });

const COMMENTS = {
  comments: [
    {
      id: 3,
      parent_id: null,
      name: 'Aina',
      picture: null,
      body: 'Found this through the bootcamp article. The HYGR chapter is my favourite, good luck with Orion!',
      created_at: '2026-08-09T04:10:00Z',
      likes: 4,
      liked: true,
      replies: [
        {
          id: 4,
          parent_id: 3,
          name: 'Varakorn',
          picture: null,
          body: 'Thank you Aina, that chapter was the hardest one to write.',
          created_at: '2026-08-09T09:00:00Z',
          likes: 1,
          liked: false,
        },
      ],
    },
    {
      id: 2,
      parent_id: null,
      name: 'Daniel Wong',
      picture: null,
      body: 'We met at the ZUS booth in Penang. Glad to see where you ended up.',
      created_at: '2026-07-30T10:00:00Z',
      likes: 2,
      liked: false,
      replies: [],
    },
  ],
};

const browser = await chromium.launch({ channel: 'msedge' });

async function mock(page, signedIn = true) {
  await page.route('**/api/auth*', (route) =>
    route.fulfill({ json: { user: signedIn ? { name: 'Aina', picture: null } : null } })
  );
  await page.route('**/api/comments*', (route) =>
    route.fulfill(route.request().method() === 'GET' ? { json: COMMENTS } : { json: { ok: true } })
  );
  await page.route('**/api/like', (route) => route.fulfill({ json: { liked: true, likes: 5 } }));
}

async function shot(page, name, sel) {
  await page.evaluate(
    (s) => document.querySelector(s)?.scrollIntoView({ behavior: 'instant', block: 'start' }),
    sel
  );
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

// desktop: experience page section, signed in
const d = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
await mock(d);
await d.goto(`${BASE}/experience/hygr-content-creator`, { waitUntil: 'domcontentloaded' });
await d.waitForTimeout(2500);
await shot(d, 'gb-exp', '#guestbook');

// desktop: blog reader
await d.goto(`${BASE}/blog#the-hygr-years`, { waitUntil: 'domcontentloaded' });
await d.waitForTimeout(2500);
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

// mobile, signed out (shows the sign in state)
const m = await browser.newPage({ viewport: { width: 390, height: 900 } });
await mock(m, false);
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
