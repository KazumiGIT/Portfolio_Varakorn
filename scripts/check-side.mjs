// Check the close-up state: side text centered between monitor and globe,
// pins still visible while zoomed; plus the realigned wide view.
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173/home', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1600);
// still in the intro close-up — pins not popped yet, wait for them
await page.waitForTimeout(1200);
const pinsVisible = await page.evaluate(() => {
  const pins = document.querySelector('.pins');
  return pins?.classList.contains('is-on') && !pins.classList.contains('is-gone');
});
console.log('pins visible during close-up:', pinsVisible);
// freeze the close-up before the intro releases? intro is 1.7s — already past.
// re-zoom in to capture the steady close-up state
await page.waitForTimeout(3000);
await page.mouse.move(720, 420);
for (let i = 0; i < 9; i++) {
  await page.mouse.wheel(0, -240);
  await page.waitForTimeout(70);
}
await page.waitForTimeout(1400);
const pinsZoomed = await page.evaluate(() => {
  const pins = document.querySelector('.pins');
  return pins?.classList.contains('is-on') && !pins.classList.contains('is-gone');
});
console.log('pins visible while zoomed:', pinsZoomed);
await page.screenshot({ path: '.shots/side-centered.png' });

// wide view alignment
for (let i = 0; i < 12; i++) {
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(70);
}
await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForTimeout(1500);
await page.screenshot({ path: '.shots/wide-realigned.png' });
console.log('shots saved');
await browser.close();
