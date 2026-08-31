// Dev-only: the two phone-sized regressions worth guarding.
//   1. the mobile drawer must NOT spill the six Experience links until tapped
//   2. a flipped trading card must scroll, so the "Full story" link is reachable
// Run against a live dev server: npm run dev, then node scripts/check-mobile-nav.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '.shots/mobile-nav';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const p = await ctx.newPage();
const fails = [];
const check = (ok, label) => {
  console.log(`${ok ? '✓' : '✗'} ${label}`);
  if (!ok) fails.push(label);
};

/* ---------- 1. mobile menu ---------- */
await p.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
await p.waitForTimeout(2800);
await p.click('.burger');
await p.waitForTimeout(800);

const subH = () => p.evaluate(() => Math.round(document.querySelector('.menu-sub').getBoundingClientRect().height));
check((await subH()) === 0, 'drawer opens with the Experience list folded away');
await p.screenshot({ path: `${OUT}/menu-collapsed.png` });

await p.click('.menu-sub-toggle');
await p.waitForTimeout(650);
check((await subH()) > 150, 'tapping the caret expands the six chapter links');
check(
  (await p.getAttribute('.menu-sub-toggle', 'aria-expanded')) === 'true',
  'aria-expanded flips to true'
);
await p.screenshot({ path: `${OUT}/menu-expanded.png` });

await p.click('.menu-sub-toggle');
await p.waitForTimeout(650);
check((await subH()) === 0, 'tapping again folds it back');

// the word Experience still navigates
await p.click('.menu-drop .menu-link');
await p.waitForURL('**/experience', { timeout: 8000 });
check(true, 'tapping the word Experience still goes to /experience');

// on a chapter page the drawer opens already expanded, showing where you are
await p.goto(`${BASE}/experience/gamuda-ai-academy`, { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
await p.click('.burger');
await p.waitForTimeout(800);
check((await subH()) > 150, 'a chapter page opens the drawer already expanded');

/* ---------- 2. trading card backs ---------- */
await p.goto(`${BASE}/experience`, { waitUntil: 'networkidle' });
await p.waitForTimeout(3500);

for (const [i, org] of [[1, 'Gamuda AI Academy'], [4, 'HYGR']]) {
  const card = p.locator('.tcard').nth(i);
  await card.scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  await card.click();
  await p.waitForTimeout(1000);

  const info = await card.evaluate((c) => {
    const sc = c.querySelector('.tb-scroll');
    const link = c.querySelector('.tb-link a');
    sc.scrollTop = sc.scrollHeight;
    const scr = sc.getBoundingClientRect();
    const lr = link.getBoundingClientRect();
    return {
      scrollable: sc.scrollHeight > sc.clientHeight,
      hasMoreHint: c.classList.contains('has-more'),
      linkInside: lr.top >= scr.top - 1 && lr.bottom <= scr.bottom + 1,
      href: link.getAttribute('href'),
    };
  });
  check(info.linkInside, `${org}: "Full story" link is reachable after scrolling`);
  if (i === 1) await p.screenshot({ path: `${OUT}/card-scrolled.png` });

  // and it actually navigates
  await p.locator('.tcard').nth(i).locator('.tb-link a').click();
  await p.waitForURL(`**${info.href}`, { timeout: 8000 });
  check(true, `${org}: the link navigates to ${info.href}`);
  await p.goBack({ waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);
}

await browser.close();
if (fails.length) {
  console.log(`\n${fails.length} failed`);
  process.exitCode = 1;
} else {
  console.log('\nall good');
}
