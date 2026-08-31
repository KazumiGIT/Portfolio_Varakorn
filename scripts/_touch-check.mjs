import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge' });
const fails = [];
const check = (ok, label) => { console.log(`${ok ? '✓' : '✗'} ${label}`); if (!ok) fails.push(label); };

const m = await b.newContext({ viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const mp = await m.newPage();
await mp.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
await mp.waitForTimeout(5000);

const isTerm = () => mp.evaluate(() => document.querySelector('.hero')?.classList.contains('is-term'));
// the keyboard sits in one of two places depending on close-up or wide view
const spots = [ [140, 487], [160, 297], [150, 470], [175, 300] ];
let opened = false;
for (const [x, y] of spots) {
  await mp.mouse.click(x, y);
  await mp.waitForTimeout(1400);
  if (await isTerm()) { opened = true; break; }
  if ((await mp.evaluate(() => location.pathname)) !== '/home') { // a pin stole the tap
    await mp.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
    await mp.waitForTimeout(4500);
  }
}
check(opened, 'tap on the keyboard opens the terminal');
const termInfo = await mp.evaluate(() => {
  const f = document.querySelector('input[aria-label="Ask the terminal about Varakorn"]');
  const r = f.getBoundingClientRect();
  return { sheet: r.width > 300 && r.height > 200 && getComputedStyle(f).pointerEvents === 'auto', fontSize: getComputedStyle(f).fontSize };
});
check(termInfo.sheet, 'tap sheet covers the lower screen on touch');
check(termInfo.fontSize === '16px', 'field is 16px so iOS will not zoom onto it');

await mp.tap('input[aria-label="Ask the terminal about Varakorn"]');
await mp.keyboard.type('hello there');
await mp.waitForTimeout(600);
check((await mp.evaluate(() => document.querySelector('input[aria-label="Ask the terminal about Varakorn"]').value)) === 'hello there', 'typing lands in the field');

// pan check on a fresh view
await mp.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
await mp.waitForTimeout(4500);
const before = await mp.screenshot();
await mp.mouse.move(300, 500); await mp.mouse.down();
for (let x = 300; x > 100; x -= 20) { await mp.mouse.move(x, 500); await mp.waitForTimeout(16); }
await mp.mouse.up();
await mp.waitForTimeout(900);
check(!before.equals(await mp.screenshot()), 'horizontal drag pans the desk');
await m.close();

const d = await b.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await d.newPage();
await dp.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
await dp.waitForTimeout(4500);
let dOpened = false;
for (let t = 0; t < 3 && !dOpened; t++) {
  await dp.click('canvas.hero-canvas', { position: { x: 500, y: 640 } });
  await dp.waitForTimeout(1400);
  dOpened = await dp.evaluate(() => document.querySelector('.hero')?.classList.contains('is-term'));
}
check(dOpened, 'desktop click still opens the terminal');
check(await dp.evaluate(() => document.querySelector('input[aria-label="Ask the terminal about Varakorn"]').getBoundingClientRect().width < 10), 'desktop keeps the tiny hidden field, wheel path clear');
await d.close();

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall good');
process.exitCode = fails.length ? 1 : 0;
