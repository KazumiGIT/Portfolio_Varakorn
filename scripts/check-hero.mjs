// Quick look at the reworked wide hero (name in the sky, tag+status row on
// the floor, no hero buttons, WhatsApp me in the nav) at three widths.
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });

for (const [name, vp] of [
  ['hero-sky-1440', { width: 1440, height: 900 }],
  ['hero-sky-wide', { width: 2000, height: 1040 }],
]) {
  const p = await browser.newPage({ viewport: vp });
  await p.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(6000);
  await p.screenshot({ path: `.shots/${name}.png` });
  console.log(`shot: ${name}, nav cta = ${await p.locator('.nav-cta').textContent()}`);
  await p.close();
}

const m = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
await m.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
await m.waitForTimeout(6000);
await m.screenshot({ path: '.shots/hero-sky-mobile.png' });
console.log('shot: hero-sky-mobile');

await browser.close();
