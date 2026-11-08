import { chromium } from '@playwright/test';
// Touch-device behaviour on an emulated phone: taps (not mouse clicks), drawer, transitions, bag, seal, back button.
const base = process.env.SITE_URL || 'http://localhost:5177';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const results = []; const ok = (name, pass, extra = '') => { results.push({ name, pass: !!pass, extra }); };
for (const [w, h, tag] of [[390, 844, 'iPhone-ish'], [360, 740, 'Android-ish']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 });
  await p.waitForTimeout(2500);
  const first = await p.evaluate(() => { const a = document.querySelector('.hero-order').getBoundingClientRect(); return a.bottom <= innerHeight && a.top >= 0; });
  ok(`${tag}: hero order button is in the first screen`, first);
  // drawer + transition via taps
  await p.locator('.mobile-toggle').tap(); await p.waitForTimeout(600);
  ok(`${tag}: menu drawer opens on tap`, await p.locator('#mobile-nav').isVisible());
  await p.locator('#mobile-nav a', { hasText: 'KOLKATA' }).tap();
  await p.waitForTimeout(450);
  ok(`${tag}: curtain covers the screen mid-navigation`, await p.locator('.page-transition').evaluate(el => getComputedStyle(el).visibility === 'visible'));
  await p.waitForFunction(() => location.pathname === '/kolkata', null, { timeout: 5000 });
  await p.waitForFunction(() => getComputedStyle(document.querySelector('.page-transition')).visibility === 'hidden', null, { timeout: 6000 });
  ok(`${tag}: curtain opens again and the Kolkata page is shown`, await p.locator('h1').first().isVisible());
  ok(`${tag}: no sideways scroll on Kolkata`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  // seal tucks away on scroll down, returns when idle
  await p.evaluate(() => scrollTo(0, innerHeight * 1.2)); await p.waitForTimeout(500);
  await p.evaluate(() => scrollTo(0, innerHeight * 1.2 + 90)); await p.waitForTimeout(250);
  const away = await p.locator('.order-badge').evaluate(el => el.classList.contains('is-away'));
  await p.waitForTimeout(1300);
  const back = await p.locator('.order-badge').evaluate(el => el.classList.contains('is-on') && !el.classList.contains('is-away'));
  ok(`${tag}: order seal tucks away while scrolling down`, away);
  ok(`${tag}: order seal returns when scrolling stops`, back);
  // browser back
  await p.goBack(); await p.waitForFunction(() => location.pathname === '/', null, { timeout: 5000 });
  await p.waitForFunction(() => getComputedStyle(document.querySelector('.page-transition')).visibility === 'hidden', null, { timeout: 6000 });
  ok(`${tag}: back button returns home and curtain clears`, true);
  // add to bag on the menu with a tap
  await p.goto(base + '/menu', { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(1200);
  await p.locator('.menu-card .add-to-bag').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  await p.locator('.menu-card .add-to-bag').first().tap(); await p.waitForTimeout(350);
  const flying = await p.locator('.fly-to-bag').count();
  await p.waitForTimeout(1400);
  ok(`${tag}: tapping Add to bag flies the photo and updates the bag`, flying >= 1 && (await p.locator('.cart-header-link span').innerText()) === '1');
  // tap the footer wordmark
  await p.locator('.footer-wordmark').scrollIntoViewIfNeeded(); await p.waitForTimeout(2200);
  const items = await p.locator('.fw-item').evaluateAll(els => els.filter(e => getComputedStyle(e).visibility !== 'hidden').length);
  ok(`${tag}: footer ingredients are flying`, items >= 1);
  ok(`${tag}: no runtime errors`, errs.length === 0, errs[0] || '');
  await ctx.close();
}
for (const r of results) console.log(`${r.pass ? 'ok  ' : 'FAIL'} ${r.name} ${r.extra}`);
console.log(results.every(r => r.pass) ? 'ALL TOUCH CHECKS PASS' : 'SOME TOUCH CHECKS FAILED');
await b.close();
