// Check: close-up persists on load (no auto zoom-out), one-line tagline,
// BLOG pin on the books, scroll releases the zoom.
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000); // long past the old 1.7s auto-release
const zoomedStill = await page.evaluate(() =>
  document.querySelector('.hero').classList.contains('is-zoomed')
);
console.log('still zoomed after 7s:', zoomedStill);
const tagLines = await page.evaluate(() => {
  const el = document.querySelector('.hero-side .hero-tag');
  return Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
});
console.log('side tagline line count:', tagLines);
await page.screenshot({ path: '.shots/stay-closeup.png' });

// scrolling the page releases the close-up
await page.mouse.move(720, 860); // off-canvas-ish? still over hero; use keyboard instead
await page.evaluate(() => scrollTo({ top: 300, behavior: 'instant' }));
await page.waitForTimeout(1200);
const zoomedAfterScroll = await page.evaluate(() =>
  document.querySelector('.hero').classList.contains('is-zoomed')
);
console.log('zoomed after page scroll (want false):', zoomedAfterScroll);
await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForTimeout(1500);
await page.screenshot({ path: '.shots/stay-wide.png' });

await browser.close();
