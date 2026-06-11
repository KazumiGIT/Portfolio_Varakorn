// Quick check: intro close-up shows the side name, wide view shows the globe,
// Journey pin (now on the globe) navigates, torii is a tooltip prop.
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
});

await page.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await page.screenshot({ path: '.shots/closeup-with-name.png' });
// the close-up persists by design — release it via a page scroll, then return
await page.evaluate(() => scrollTo({ top: 200, behavior: 'instant' }));
await page.waitForTimeout(900);
await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForTimeout(1600);
await page.screenshot({ path: '.shots/wide-with-globe.png' });

// torii should now show a tooltip, not navigate: hover around its position
// (right side, lower half) and confirm the tip appears
let toriiTip = '';
outer: for (let fx = 0.78; fx <= 0.96; fx += 0.02) {
  for (let fy = 0.42; fy <= 0.72; fy += 0.04) {
    await page.mouse.move(1440 * fx, 900 * fy);
    await page.waitForTimeout(90);
    const tip = await page.evaluate(() => {
      const el = document.querySelector('.scene-tip');
      return el?.classList.contains('is-on') ? el.querySelector('.t .txt').textContent : '';
    });
    if (tip === 'The gate') {
      toriiTip = tip;
      break outer;
    }
  }
}
console.log(toriiTip === 'The gate' ? 'torii tooltip OK' : 'WARN: torii tooltip not found in sweep');

// globe pin click navigates to /journey
await page.click('.pin:has-text("Journey")');
await page.waitForURL('**/journey', { timeout: 6000 });
console.log('globe pin -> /journey OK');

await browser.close();
if (errors.length) {
  console.log('--- errors ---');
  errors.forEach((e) => console.log(e));
  process.exitCode = 1;
} else {
  console.log('no console errors');
}
