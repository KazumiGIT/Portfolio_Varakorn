// Check the journey page: march renders + horizontal scroll works,
// chapter reader opens from a stage and from a map pin, map tooltip shows,
// secret gate still reaches /contact.
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
});

await page.goto('http://localhost:5173/journey', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const stages = await page.locator('.m-stage').count();
console.log('stages rendered:', stages);

const before = await page.evaluate(
  () => document.querySelector('[data-march]').style.transform || 'none'
);
await page.evaluate(() => {
  const wrap = document.querySelector('.march-wrap');
  scrollTo({ top: wrap.offsetTop + (wrap.offsetHeight - innerHeight) * 0.55, behavior: 'instant' });
});
await page.waitForTimeout(600);
const after = await page.evaluate(
  () => document.querySelector('[data-march]').style.transform || 'none'
);
console.log('track transform before/after:', before, '->', after);

await page.evaluate(() => {
  const wrap = document.querySelector('.march-wrap');
  scrollTo({ top: wrap.offsetTop + (wrap.offsetHeight - innerHeight), behavior: 'instant' });
});
await page.waitForTimeout(500);
await page.click('.m-stage[data-id="orion"]');
await page.waitForTimeout(700);
const readerOpen = await page.evaluate(() =>
  document.querySelector('.reader').classList.contains('is-open')
);
console.log('reader opens from stage:', readerOpen);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

await page.evaluate(() => document.querySelector('#map').scrollIntoView({ behavior: 'instant' }));
await page.waitForTimeout(800);
await page.locator('[data-state="sabah"]').hover();
await page.waitForTimeout(300);
const tipText = await page.locator('.map-tip').textContent();
console.log('sabah tooltip:', tipText.trim());

await page.locator('.map-pin[data-id="gamuda"]').click();
await page.waitForTimeout(700);
const readerTitle = await page.locator('.rb-title').textContent();
console.log('reader from map pin:', readerTitle);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
await page.waitForTimeout(600);
await page.click('.secret-gate');
await page.waitForURL('**/contact', { timeout: 6000 });
console.log('secret gate -> /contact OK');

await browser.close();
if (errors.length) {
  console.log('--- errors ---');
  errors.forEach((e) => console.log(e));
  process.exitCode = 1;
} else {
  console.log('no console errors');
}
