// One-off verification: hero text behind 3D, inward lamp, wheel zoom dolly,
// double-click zoom toggle, night + zoom together, new fonts.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
mkdirSync('.shots', { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
});

await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
await page.waitForTimeout(4500);
await page.screenshot({ path: '.shots/hero-v3-day.png' });
console.log('shot: hero v3 day (text behind desk, new fonts)');

// wheel-zoom into the desk
await page.mouse.move(720, 400);
for (let i = 0; i < 10; i++) {
  await page.mouse.wheel(0, -240);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(1400);
await page.screenshot({ path: '.shots/hero-v3-zoomed.png' });
console.log('shot: zoomed into desk');

// page did not scroll while zooming?
const scrolled = await page.evaluate(() => window.scrollY);
console.log(`scrollY after zoom-in wheels: ${scrolled}`);

// wheel back out, then confirm page scroll takes over
for (let i = 0; i < 12; i++) {
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(900);
const scrolledAfter = await page.evaluate(() => window.scrollY);
console.log(`scrollY after zooming back out + extra wheel: ${scrolledAfter} (should be > 0)`);
await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForTimeout(600);

// double-click an empty corner toggles zoom
await page.mouse.dblclick(200, 700);
await page.waitForTimeout(1500);
await page.screenshot({ path: '.shots/hero-v3-dblclick-zoom.png' });
console.log('shot: double-click zoom');
await page.mouse.dblclick(200, 700);
await page.waitForTimeout(1200);

// night + zoom together
await page.evaluate(() => localStorage.setItem('theme', 'night'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(4500);
await page.mouse.move(720, 400);
for (let i = 0; i < 10; i++) {
  await page.mouse.wheel(0, -240);
  await page.waitForTimeout(80);
}
await page.waitForTimeout(1400);
await page.screenshot({ path: '.shots/hero-v3-night-zoomed.png' });
console.log('shot: night + zoomed');
await page.evaluate(() => localStorage.setItem('theme', 'day'));

await browser.close();
if (errors.length) {
  console.log('--- errors ---');
  errors.forEach((e) => console.log(e));
  process.exitCode = 1;
} else {
  console.log('no console errors');
}
