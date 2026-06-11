// Dev-only: screenshot all pages for visual verification.
// Uses the system Edge install via Playwright channels (no browser download).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '.shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });

const errors = [];

async function scrollThrough(page) {
  // walk the page so IntersectionObserver reveals fire, then return to top
  await page.evaluate(async () => {
    // the site uses scroll-behavior:smooth — bypass it or the walk lags
    const step = innerHeight * 0.7;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 150));
    }
    scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
}

async function shoot(page, name, path, { fullPage = true, settle = 3800 } = {}) {
  await page.goto(`${BASE}/${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(settle); // let curtain, reveals, 3D pop-in settle
  if (fullPage) await scrollThrough(page);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  console.log(`✓ ${name}`);
}

function watch(page, label) {
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${label}] console.error: ${m.text()}`);
  });
}

// desktop
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await desktop.newPage();
watch(dp, 'desktop');
await shoot(dp, 'home-hero', 'home', { fullPage: false });
await scrollThrough(dp);
await dp.screenshot({ path: `${OUT}/home-full.png`, fullPage: true });
console.log('✓ home-full');
await shoot(dp, 'journey', 'journey');
await shoot(dp, 'experience', 'experience');
await shoot(dp, 'blog', 'blog');

// blog reader open
await dp.click('.post-card');
await dp.waitForTimeout(900);
await dp.screenshot({ path: `${OUT}/blog-reader.png`, fullPage: false });
console.log('✓ blog-reader');

// trading cards: front + flip
await dp.goto(`${BASE}/experience`, { waitUntil: 'networkidle' });
await dp.waitForTimeout(3500);
const firstCard = dp.locator('.tcard').first();
await firstCard.scrollIntoViewIfNeeded();
await dp.waitForTimeout(1600);
await dp.screenshot({ path: `${OUT}/cards.png`, fullPage: false });
console.log('✓ cards');
await firstCard.click();
await dp.waitForTimeout(950);
await dp.screenshot({ path: `${OUT}/cards-flipped.png`, fullPage: false });
console.log('✓ cards-flipped');

// ultra-wide hero (title/floor overlap check)
await dp.setViewportSize({ width: 2400, height: 1180 });
await dp.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
await dp.waitForTimeout(4200);
await dp.screenshot({ path: `${OUT}/home-wide.png`, fullPage: false });
console.log('✓ home-wide');
await dp.setViewportSize({ width: 1440, height: 900 });

// secret gate at the end of the journey rail → manga contact page
await dp.goto(`${BASE}/journey`, { waitUntil: 'networkidle' });
await dp.waitForTimeout(3000);
await dp.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
await dp.waitForTimeout(900);
await dp.click('.secret-gate');
await dp.waitForURL('**/contact', { timeout: 6000 });
await dp.waitForTimeout(1200);
console.log('✓ secret gate → contact');

// diegetic 3D nav: pin click → journey
await dp.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
await dp.waitForTimeout(4200);
await dp.screenshot({ path: `${OUT}/home-pins.png`, fullPage: false });
console.log('✓ home-pins');
await dp.click('.pin:has-text("Journey")');
await dp.waitForURL('**/journey', { timeout: 6000 });
console.log('✓ 3D nav: Journey pin → journey');

// diegetic 3D nav: clicking the monitor object itself → experience
await dp.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
await dp.waitForTimeout(4200);
const pinBox = await dp.locator('.pin', { hasText: 'Experience' }).boundingBox();
await dp.mouse.click(pinBox.x + pinBox.width / 2, pinBox.y + pinBox.height + 70);
await dp.waitForURL('**/experience', { timeout: 6000 });
console.log('✓ 3D nav: monitor object click → experience');

// mobile
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const mp = await mobile.newPage();
watch(mp, 'mobile');
await shoot(mp, 'home-mobile-hero', 'home', { fullPage: false });
await scrollThrough(mp);
await mp.screenshot({ path: `${OUT}/home-mobile-full.png`, fullPage: true });
console.log('✓ home-mobile-full');

// mobile menu open
await mp.click('.burger');
await mp.waitForTimeout(800);
await mp.screenshot({ path: `${OUT}/home-mobile-menu.png`, fullPage: false });
console.log('✓ home-mobile-menu');

// manga contact page (mobile-first) — full page + top fold
await shoot(mp, 'contact-manga', 'contact');
await mp.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
await mp.waitForTimeout(500);
await mp.screenshot({ path: `${OUT}/contact-fold.png`, fullPage: false });
console.log('✓ contact-fold');

await browser.close();

if (errors.length) {
  console.log('\n--- console/page errors ---');
  errors.forEach((e) => console.log(e));
  process.exitCode = 1;
} else {
  console.log('\nno console errors');
}
