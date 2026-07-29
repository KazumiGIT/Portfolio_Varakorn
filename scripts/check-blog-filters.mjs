// Dev-only: exercise the blog shelves (My Blog / My Journey / My Learning),
// the year + topic dropdowns, the search box, the empty state and deep links.
// Needs `npm run dev` on :5173. Uses the system Edge install.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = '.shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 980 } });
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
});

const fails = [];
const check = (label, ok, extra = '') => {
  console.log(`${ok ? '✓' : '✗'} ${label}${extra ? ` — ${extra}` : ''}`);
  if (!ok) fails.push(label + (extra ? ` — ${extra}` : ''));
};

const cards = () => page.locator('.post-card');
const titles = () => cards().locator('h3').allTextContents();

await page.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2600);

/* ---- tab order + labels ---- */
const tabLabels = await page.locator('.cat-tab .ct-l').allTextContents();
check(
  'tab order is My Blog / My Journey / My Learning',
  JSON.stringify(tabLabels) === JSON.stringify(['My Blog', 'My Journey', 'My Learning']),
  tabLabels.join(' | ')
);

const firstTabOn = await page.locator('.cat-tab').first().getAttribute('aria-selected');
check('My Blog is the default shelf', firstTabOn === 'true');

const blogCount = await cards().count();
check('My Blog has posts', blogCount > 0, `${blogCount} cards`);

/* first-paint integrity: ui.js owns the bare [data-year] and [data-count]
   hooks, so a facet using them gets its text stomped on boot. Assert here,
   BEFORE any re-render repairs it. */
const firstYearOpts = await page.locator('[data-fsel="year"] option').allTextContents();
check(
  'year dropdown survives first paint (first option is All)',
  /^All \(\d+\)$/.test(firstYearOpts[0] || ''),
  firstYearOpts.join(' | ')
);
check(
  'year options are distinct at first paint',
  new Set(firstYearOpts).size === firstYearOpts.length,
  firstYearOpts.join(' | ')
);
const countLine = (await page.locator('[data-result-count]').textContent()).trim();
check('result count line renders a number', /^\d+ notes?$/.test(countLine), countLine);

/* the dropdown is the control at every width, chips are gone */
check(
  'desktop shows the dropdowns, no chips left behind',
  (await page.locator('[data-fsel="year"]').isVisible()) &&
    (await page.locator('.chip').count()) === 0
);
const facetRows = await page.locator('.facet').evaluateAll((rs) =>
  rs.map((r) => Math.round(r.getBoundingClientRect().top))
);
check(
  'both facets sit on one row on desktop',
  facetRows.length === 2 && facetRows[0] === facetRows[1],
  facetRows.join(' / ')
);
await page.screenshot({ path: `${OUT}/blog-filters-blog.png`, fullPage: false });

/* ---- type stack ---- */
const type = await page.evaluate(() => {
  const f = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).fontFamily : 'MISSING';
  };
  return { body: f('body'), head: f('.post-card h3'), script: f('.footer .jp-line') };
});
check('body + headings lead with Volta', /^Volta,/.test(type.body) && /^Volta,/.test(type.head), type.body);
check(
  'the accent line asks for Rocket Script first',
  /^"?Rocket Script"?,/.test(type.script),
  type.script
);

/* ---- featured images ---- */
const coverCount = await page.locator('.post-card .pc-cover').count();
check('every card carries a cover', coverCount === blogCount, `${coverCount}/${blogCount}`);
const plateBits = await page.locator('.post-card .pc-plate .pcp-seal').count();
check('cards with no photo fall back to a plate', plateBits > 0, `${plateBits} plates`);
const patterns = await page
  .locator('.post-card .pc-plate')
  .evaluateAll((ps) => ps.map((p) => p.dataset.pat));
check(
  'plates vary their pattern across the shelf',
  new Set(patterns).size > 1,
  patterns.join(',')
);
await page.locator('.post-grid').scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/blog-cards.png`, fullPage: false });

/* ---- shelf switching ---- */
for (const [label, file] of [
  ['My Journey', 'journey'],
  ['My Learning', 'learning'],
]) {
  await page.click(`.cat-tab:has-text("${label}")`);
  await page.waitForTimeout(700);
  const n = await cards().count();
  const sel = await page
    .locator(`.cat-tab:has-text("${label}")`)
    .getAttribute('aria-selected');
  check(`${label} shelf shows posts`, n > 0 && sel === 'true', `${n} cards`);
  const url = new URL(page.url());
  check(`${label} writes ?c= to the url`, url.searchParams.get('c') === file, page.url());
  await page.screenshot({ path: `${OUT}/blog-filters-${file}.png`, fullPage: false });
}

/* ---- year filter (My Journey spans several years) ---- */
await page.click('.cat-tab:has-text("My Journey")');
await page.waitForTimeout(600);
const yearOpts = await page.locator('[data-fsel="year"] option').allTextContents();
check('year dropdown lists several years for My Journey', yearOpts.length > 2, yearOpts.join(' | '));

const before = await cards().count();
await page.selectOption('[data-fsel="year"]', '2026');
await page.waitForTimeout(600);
const after = await cards().count();
const dates = await cards().locator('.pm span:nth-child(2)').allTextContents();
check(
  'year 2026 narrows to 2026 posts only',
  after > 0 && after < before && dates.every((d) => d.includes('2026')),
  `${before} → ${after}: ${dates.join(', ')}`
);
check(
  'year dropdown writes ?y= to the url',
  new URL(page.url()).searchParams.get('y') === '2026',
  page.url()
);
check(
  'the picked year is still selected after the re-render',
  (await page.locator('[data-fsel="year"]').inputValue()) === '2026'
);
check(
  'an active dropdown is marked as on',
  await page.locator('.facet-select.is-on [data-fsel="year"]').isVisible()
);
await page.screenshot({ path: `${OUT}/blog-filters-year.png`, fullPage: false });

/* a real photo must actually decode, not 404 into an empty box */
const photo = page.locator('.post-card .pc-cover img').first();
if (await photo.count()) {
  const ok = await photo.evaluate((im) => im.complete && im.naturalWidth > 0);
  check('a post photo cover loads', ok, await photo.getAttribute('src'));
  const boxed = await photo.evaluate(
    (im) => getComputedStyle(im).objectFit === 'cover' && im.clientHeight > 0
  );
  check('photo cover fills its frame without stretching', boxed);
}

/* ---- topic filter stacks on top of the year ---- */
const topic = (
  await page
    .locator('[data-fsel="topic"] option')
    .evaluateAll((os) => os.map((o) => o.value).filter((v) => v !== 'all'))
)[0];
await page.selectOption('[data-fsel="topic"]', topic);
await page.waitForTimeout(600);
const tagRows = await cards().locator('.pf span:first-child').allTextContents();
check(
  `topic #${topic} stacks with the year filter`,
  tagRows.length > 0 && tagRows.every((r) => r.includes(`#${topic}`)),
  `${tagRows.length} cards: ${tagRows.join(' | ')}`
);

/* ---- clear ---- */
await page.click('[data-clear]');
await page.waitForTimeout(600);
const cleared = await cards().count();
check('clear filters restores the shelf', cleared === before, `${cleared} of ${before}`);
check(
  'clear strips the filter params',
  !new URL(page.url()).searchParams.get('y') && !new URL(page.url()).searchParams.get('t'),
  page.url()
);

/* ---- switching shelves resets year + topic ---- */
await page.selectOption('[data-fsel="year"]', '2022');
await page.waitForTimeout(500);
await page.click('.cat-tab:has-text("My Learning")');
await page.waitForTimeout(600);
check(
  'switching shelf resets the year dropdown',
  !new URL(page.url()).searchParams.get('y') &&
    (await page.locator('[data-fsel="year"]').inputValue()) === 'all',
  page.url()
);

/* ---- search inside the active shelf ---- */
await page.click('.cat-tab:has-text("My Learning")');
await page.waitForTimeout(400);
await page.fill('[data-search]', 'chunk');
await page.waitForTimeout(700);
const hits = await titles();
check('search finds the RAG note', hits.some((t) => /RAG/i.test(t)), hits.join(' | '));
const marks = await page.locator('.post-card mark').count();
check('search highlights the matched term', marks > 0, `${marks} marks`);
check('search writes ?q= to the url', new URL(page.url()).searchParams.get('q') === 'chunk');
await page.screenshot({ path: `${OUT}/blog-filters-search.png`, fullPage: false });

/* ---- search body text, not just titles ---- */
await page.fill('[data-search]', 'booth');
await page.waitForTimeout(700);
const emptyShown = await page.locator('.blog-empty').isVisible();
check('search with no hits on this shelf shows the empty state', emptyShown);
const jump = page.locator('.link-jump').first();
const jumpCount = await page.locator('.link-jump').count();
check('empty state points at shelves that do match', jumpCount > 0, `${jumpCount} jumps`);
await page.screenshot({ path: `${OUT}/blog-filters-empty.png`, fullPage: false });

if (jumpCount) {
  await jump.click();
  await page.waitForTimeout(700);
  const after2 = await cards().count();
  check('jumping to the suggested shelf shows the hits', after2 > 0, `${after2} cards`);
}

/* ---- deep link opens the reader on the right shelf ---- */
await page.goto(`${BASE}/blog#learning-rag-the-hard-way`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
const readerOpen = await page.locator('.reader.is-open').isVisible();
const readerCat = await page.locator('.article .a-meta span').first().textContent();
check('deep link opens the reader', readerOpen);
check('deep link selects that post shelf', readerCat.trim() === 'My Learning', readerCat);
const tabOn = await page.locator('.cat-tab.is-on .ct-l').textContent();
check('shelf tab follows the deep link', tabOn.trim() === 'My Learning', tabOn);
await page.screenshot({ path: `${OUT}/blog-filters-reader.png`, fullPage: false });

/* ---- filter state survives a reload ---- */
await page.goto(`${BASE}/blog?c=journey&y=2026`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
const restoredTab = (await page.locator('.cat-tab.is-on .ct-l').textContent()).trim();
const restoredYear = await page.locator('[data-fsel="year"]').inputValue();
check(
  'a shared url restores shelf + year',
  restoredTab === 'My Journey' && restoredYear === '2026',
  `${restoredTab} / ${restoredYear}`
);

/* ---- night mode ---- */
await page.evaluate(() => document.documentElement.classList.add('night'));
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/blog-filters-night.png`, fullPage: false });
console.log('✓ night shot');
await page.evaluate(() => document.documentElement.classList.remove('night'));

/* ---- mobile ---- */
const mctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
const mp = await mctx.newPage();
mp.on('pageerror', (e) => errors.push(`[mobile] pageerror: ${e.message}`));
mp.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[mobile] console.error: ${m.text()}`);
});
await mp.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
await mp.waitForTimeout(2600);
const overflow = await mp.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
);
check('mobile has no horizontal overflow', !overflow);
await mp.locator('.blog-controls').scrollIntoViewIfNeeded();
await mp.waitForTimeout(900);
await mp.screenshot({ path: `${OUT}/blog-filters-mobile.png`, fullPage: false });
await mp.locator('.post-card').first().scrollIntoViewIfNeeded();
await mp.waitForTimeout(700);
await mp.screenshot({ path: `${OUT}/blog-cards-mobile.png`, fullPage: false });
await mp.click('.cat-tab:has-text("My Learning")');
await mp.waitForTimeout(700);
await mp.locator('.blog-controls').scrollIntoViewIfNeeded();
await mp.waitForTimeout(600);
await mp.screenshot({ path: `${OUT}/blog-filters-mobile-learning.png`, fullPage: false });

// the reader must not overflow on a narrow screen either (inline <code> is long)
await mp.goto(`${BASE}/blog#my-first-script-that-mattered`, { waitUntil: 'networkidle' });
await mp.waitForTimeout(2200);
const readerOverflow = await mp.evaluate(() => {
  const a = document.querySelector('.article');
  return a.scrollWidth > a.clientWidth + 1;
});
check('mobile reader has no horizontal overflow', !readerOverflow);
await mp.screenshot({ path: `${OUT}/blog-filters-mobile-reader.png`, fullPage: false });
await mp.goto(`${BASE}/blog`, { waitUntil: 'networkidle' });
await mp.waitForTimeout(2000);

// tabs must not clip their labels on a narrow screen
const clipped = await mp.$$eval('.cat-tab .ct-l', (ls) =>
  ls.filter((l) => l.scrollWidth > l.clientWidth + 1).map((l) => l.textContent)
);
check('mobile shelf labels are not truncated', clipped.length === 0, clipped.join(', '));

/* ---- mobile filters ---- */
await mp.click('.cat-tab:has-text("My Journey")');
await mp.waitForTimeout(700);
await mp.locator('.blog-controls').scrollIntoViewIfNeeded();

const selBox = await mp.locator('[data-fsel="year"]').boundingBox();
const topicBox = await mp.locator('[data-fsel="topic"]').boundingBox();
check('dropdown is a thumb-sized target', selBox.height >= 44, `${Math.round(selBox.height)}px`);
check(
  'one facet per line on mobile, each dropdown fills the row',
  topicBox.y > selBox.y && selBox.width > 200,
  `year ${Math.round(selBox.width)}px wide`
);

const mYearOpts = await mp.locator('[data-fsel="year"] option').allTextContents();
check(
  'year dropdown lists All + counts',
  /^All \(\d+\)$/.test(mYearOpts[0] || '') && mYearOpts.length > 1,
  mYearOpts.join(' | ')
);

const mBefore = await mp.locator('.post-card').count();
await mp.selectOption('[data-fsel="year"]', '2026');
await mp.waitForTimeout(600);
const mAfter = await mp.locator('.post-card').count();
const mDates = await mp.locator('.post-card .pm span:nth-child(2)').allTextContents();
check(
  'picking a year in the dropdown filters the grid',
  mAfter > 0 && mAfter < mBefore && mDates.every((d) => d.includes('2026')),
  `${mBefore} → ${mAfter}`
);
check(
  'dropdown writes ?y= to the url',
  new URL(mp.url()).searchParams.get('y') === '2026',
  mp.url()
);
check(
  'the picked dropdown keeps its value after the re-render',
  (await mp.locator('[data-fsel="year"]').inputValue()) === '2026'
);
check(
  'an active dropdown is marked as on',
  await mp.locator('.facet-select.is-on [data-fsel="year"]').isVisible()
);

const topicVals = await mp.locator('[data-fsel="topic"] option').evaluateAll((os) =>
  os.map((o) => o.value).filter((v) => v !== 'all')
);
await mp.selectOption('[data-fsel="topic"]', topicVals[0]);
await mp.waitForTimeout(600);
const mTags = await mp.locator('.post-card .pf span:first-child').allTextContents();
check(
  `topic dropdown stacks on the year (#${topicVals[0]})`,
  new URL(mp.url()).searchParams.get('t') === topicVals[0] &&
    mTags.every((r) => r.includes(`#${topicVals[0]}`)),
  `${mTags.length} cards`
);

await mp.locator('.blog-controls').scrollIntoViewIfNeeded();
await mp.waitForTimeout(500);
await mp.screenshot({ path: `${OUT}/blog-filters-mobile-dropdown.png`, fullPage: false });

await mp.click('[data-clear]');
await mp.waitForTimeout(600);
check(
  'clear resets both dropdowns',
  (await mp.locator('[data-fsel="year"]').inputValue()) === 'all' &&
    (await mp.locator('[data-fsel="topic"]').inputValue()) === 'all' &&
    (await mp.locator('.facet-select.is-on').count()) === 0
);

const mOverflow2 = await mp.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
);
check('mobile filters cause no horizontal overflow', !mOverflow2);
console.log('✓ mobile shots');

await browser.close();

if (errors.length) {
  console.log('\n--- console/page errors ---');
  errors.forEach((e) => console.log(e));
}
if (fails.length) {
  console.log(`\n${fails.length} CHECK(S) FAILED`);
  fails.forEach((f) => console.log(`  ✗ ${f}`));
}
process.exitCode = fails.length || errors.length ? 1 : 0;
if (!fails.length && !errors.length) console.log('\nall blog filter checks passed');
