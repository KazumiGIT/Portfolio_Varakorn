// One-off verification: straight desk view, floating experience cards,
// lamp click toggles night mode (and persists), night render on other pages.
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
await page.screenshot({ path: '.shots/hero-straight-day.png' });
console.log('shot: hero straight, day');

// hunt for the lamp by sweeping the left side of the canvas until the
// tooltip says "The lamp"; keep moving down a step so we click well inside
// its hit zone rather than on the first grazed edge
async function findLamp() {
  for (let fx = 0.16; fx <= 0.46; fx += 0.02) {
    for (let fy = 0.3; fy <= 0.7; fy += 0.03) {
      const x = 1440 * fx;
      const y = 900 * fy;
      await page.mouse.move(x, y);
      await page.waitForTimeout(90);
      const tip = await page.evaluate(() => {
        const el = document.querySelector('.scene-tip');
        return el?.classList.contains('is-on') ? el.querySelector('.t .txt').textContent : '';
      });
      if (tip === 'The lamp') return { x, y: y + 14 };
    }
  }
  return null;
}
const lampPoint = await findLamp();
if (!lampPoint) {
  console.log('FAIL: lamp not found by hover sweep');
  process.exitCode = 1;
} else {
  console.log(`lamp found at ${Math.round(lampPoint.x)},${Math.round(lampPoint.y)}`);
  await page.mouse.click(lampPoint.x, lampPoint.y);
  await page.waitForTimeout(800);
  const night = await page.evaluate(() => document.documentElement.classList.contains('night'));
  const stored = await page.evaluate(() => localStorage.getItem('theme'));
  console.log(`night class: ${night}, localStorage.theme: ${stored}`);
  if (!night || stored !== 'night') process.exitCode = 1;
  await page.screenshot({ path: '.shots/hero-straight-night.png' });
  console.log('shot: hero, night');

  // persists across pages?
  await page.goto(`${BASE}/experience`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const still = await page.evaluate(() => document.documentElement.classList.contains('night'));
  console.log(`night persists on /experience: ${still}`);
  if (!still) process.exitCode = 1;
  await page.screenshot({ path: '.shots/experience-night.png' });

  // toggle back off — re-find the lamp on the fresh page (the diorama bobs,
  // so a stale point can graze the wrong hit zone)
  await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);
  const lampPoint2 = await findLamp();
  if (!lampPoint2) {
    console.log('FAIL: lamp not found on revisit');
    process.exitCode = 1;
  }
  await page.mouse.click(lampPoint2.x, lampPoint2.y);
  await page.waitForTimeout(800);
  const dayAgain = await page.evaluate(() => !document.documentElement.classList.contains('night'));
  console.log(`toggles back to day: ${dayAgain}`);
  if (!dayAgain) process.exitCode = 1;
}

await browser.close();
if (errors.length) {
  console.log('--- errors ---');
  errors.forEach((e) => console.log(e));
  process.exitCode = 1;
} else {
  console.log('no console errors');
}
