import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.SITE_URL || 'http://localhost:5177';
const out = 'output/verification';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const failures = [];
const results = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) failures.push({ url: r.url(), status: r.status() }); });
async function check(label, condition) { results.push({ label, passed: Boolean(condition) });if (!condition) throw new Error(label); }
async function settle() { await page.evaluate(() => document.fonts.ready);await page.waitForTimeout(2200); }
async function screenshot(name, full = false) { const height = await page.evaluate(() => document.documentElement.scrollHeight);const cap = full && height > 14000;await page.screenshot({ path: `${out}/${name}${cap ? '-first-14000px' : ''}.jpg`, type: 'jpeg', quality: 75, fullPage: full && !cap, ...(cap ? { clip: { x: 0, y: 0, width: page.viewportSize().width, height: 14000 } } : {}), timeout: 30000 }); }
async function revealAll() {
  await page.evaluate(async () => { for (const img of document.images) img.loading = 'eager';await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
  for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 650) { await page.evaluate(y => scrollTo(0, y), y);await page.waitForTimeout(100); }
  await page.evaluate(() => scrollTo(0, 0));await page.waitForTimeout(900);
}
try {
  await page.goto(base, { waitUntil: 'networkidle' });await settle();
  await check('Brand is Dre’s Burgers', (await page.title()).includes('Dre’s Burgers'));
  await check('Home headline visible', await page.locator('h1').isVisible());
  await screenshot('dres-home-desktop');
  await revealAll();await screenshot('dres-home-desktop-full', true);
  await check('No broken home images', await page.locator('img').evaluateAll(imgs => imgs.every(i => i.naturalWidth > 0)));
  await check('Seven Kolkata campaign portraits present', await page.locator('.bite-slide').count() === 7);
  await check('Generated campaign disclosure visible', await page.locator('.campaign-disclosure').count() === 1);
  await check('Floating 3D scene removed', await page.locator('canvas').count() === 0);
  const story = await page.locator('.bite-journey').evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, travel: el.offsetHeight - innerHeight }));
  const transforms = [];
  for (const progress of [0, .5, 1]) {
    await page.evaluate(y => scrollTo(0, y), story.top + story.travel * progress);
    await page.waitForTimeout(1100);
    transforms.push(await page.locator('.bite-journey-track').evaluate(el => getComputedStyle(el).transform));
    await screenshot(`dres-scroll-story-${progress}`);
  }
  await check('Photographic story moves with scroll', new Set(transforms).size === 3);
  await check('Last story photo remains fully accessible', await page.locator('.bite-slide-6').evaluate(el => { const r = el.getBoundingClientRect();return r.left > 0 && r.right < innerWidth; }));
  await page.getByRole('button', { name: 'THE FIRST BITE.', exact: true }).click();await page.waitForTimeout(1100);
  await check('Story navigation responds', await page.locator('.journey-dots .active').getAttribute('aria-label') === 'THE FIRST BITE.');
  await page.locator('.bite-journey').getByRole('button', { name: 'Enlarge THE FIRST BITE.', exact: true }).click();await check('Campaign photo expands with honest provenance', (await page.getByRole('dialog').innerText()).includes('AI-created Kolkata campaign scene'));await page.keyboard.press('Escape');await page.locator('dialog[open]').waitFor({ state: 'detached' });
  await page.goto(`${base}/menu`, { waitUntil: 'networkidle' });await settle();
  await check('All 16 menu items present', await page.locator('.menu-card').count() === 16);
  await page.getByRole('button', { name: 'VEGGIE', exact: true }).click();await check('Veggie filter returns actual menu item', await page.locator('.menu-card').count() === 1 && (await page.locator('.menu-card h3').innerText()).toLowerCase().includes('herbed potato'));
  await page.getByRole('button', { name: 'Save Herbed Potato to craving list' }).click();
  await page.getByRole('button', { name: 'MY CRAVINGS (1)', exact: true }).click();await check('Saved menu filter works', await page.locator('.menu-card').count() === 1);
  await page.getByRole('button', { name: 'View Herbed Potato', exact: true }).click();await check('Menu item dialog opens', await page.getByRole('dialog', { name: 'Herbed Potato' }).isVisible());
  await check('Real Zomato ordering destination', await page.getByRole('dialog').getByRole('link', { name: 'ALSO ON ZOMATO' }).getAttribute('href') === 'https://www.zomato.com/kolkata/dres-burgers-park-circus-area/order');
  await page.keyboard.press('Escape');await page.locator('dialog[open]').waitFor({ state: 'detached' });await check('Escape closes menu dialog', await page.locator('dialog[open]').count() === 0);
  await page.getByRole('button', { name: 'ALL', exact: true }).click();await page.getByRole('searchbox').fill('wings');await check('Menu search finds both wing items', await page.locator('.menu-card').count() === 2);
  await page.getByRole('searchbox').fill('no-such-burger');await check('Search has useful empty state', await page.locator('.menu-empty').isVisible());
  await page.getByRole('button', { name: 'SHOW ME EVERYTHING' }).click();await check('Reset search restores catalog', await page.locator('.menu-card').count() === 16);
  await revealAll();await screenshot('dres-menu-desktop-full', true);
  await page.reload({ waitUntil: 'networkidle' });await check('Saved cravings persist', (await page.getByRole('button', { name: /Open craving list/ }).getAttribute('aria-label')).includes('1 saved'));
  await page.getByRole('button', { name: /Open craving list/ }).click();await check('Craving list opens', await page.getByRole('dialog', { name: 'Your craving list' }).isVisible());
  await page.getByRole('dialog').getByRole('button', { name: /Herbed Potato/ }).first().click();await check('Craving list switches to detail without closing', await page.getByRole('dialog', { name: 'Herbed Potato' }).isVisible());await page.keyboard.press('Escape');
  for (const route of ['story', 'kolkata', 'stories', 'visit']) { await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });await settle();await check(`${route} direct route works`, await page.locator('h1').isVisible());await revealAll();await screenshot(`dres-${route}-desktop-full`, true); }
  await page.getByRole('button', { name: 'COPY ADDRESS' }).click();
  await page.goto(`${base}/stories`, { waitUntil: 'networkidle' });await settle();await page.locator('.film-strip-section').scrollIntoViewIfNeeded();await page.getByRole('button', { name: /Play The chicken fillet taste test/ }).click();
  await check('Real video player is inserted', (await page.locator('.video-player iframe').getAttribute('src')).includes('youtube-nocookie.com/embed/7_I9hhHw4fY'));
  await page.keyboard.press('Escape');await page.locator('.video-player iframe').waitFor({ state: 'detached' });await check('Closing video unmounts player', await page.locator('.video-player iframe').count() === 0);
  await page.getByRole('button', { name: 'Ⅱ PAUSE MOTION' }).click();await page.waitForFunction(() => document.documentElement.dataset.motion === 'off');await check('Motion pause works', await page.locator('html').getAttribute('data-motion') === 'off');
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['', 'menu', 'story', 'kolkata', 'stories', 'visit']) {
      await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });await settle();
      await check(`${width}px /${route} has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await screenshot(`dres-${route || 'home'}-${width}`);
      if (width === 390) { await revealAll();await screenshot(`dres-${route || 'home'}-mobile-full`, true); }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });await page.goto(base, { waitUntil: 'networkidle' });await page.waitForSelector('.preloader', { state: 'detached', timeout: 15000 }).catch(() => {});
  await page.getByRole('button', { name: 'Open navigation' }).click();await check('Mobile navigation opens', await page.locator('#mobile-nav').isVisible());await page.locator('#mobile-nav').getByRole('link', { name: 'THE MENU' }).click();await page.waitForURL('**/menu');await page.locator('#mobile-nav').waitFor({ state: 'detached' });await check('Mobile navigation routes and closes', page.url().endsWith('/menu') && await page.locator('#mobile-nav').count() === 0);
  await page.goto(`${base}/missing-page`, { waitUntil: 'networkidle' });await check('Unknown route has recovery', await page.getByRole('link', { name: 'BACK TO THE GOOD STUFF' }).isVisible());
  await check('No application runtime errors', errors.length === 0);await check('No failed local requests', failures.length === 0);
} catch (error) { results.push({ error: error.message, passed: false });await screenshot('failure');process.exitCode = 1; }
await writeFile(`${out}/results.json`, JSON.stringify({ results, errors, failures }, null, 2));
console.log(JSON.stringify({ results, errors, failures }, null, 2));
await browser.close();
