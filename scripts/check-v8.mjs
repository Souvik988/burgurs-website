import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const out = 'output/v8-check'; await mkdir(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const shot = (p, n) => p.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 70 });
async function open(p, path) { await p.goto('' + (process.env.SITE_URL || 'http://localhost:5177') + path, { waitUntil: 'networkidle' }); await p.waitForSelector('.preloader', { state: 'detached', timeout: 10000 }).catch(() => {}); await p.waitForTimeout(600); }
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errors.push(`${tag} ${e.message}`));
  await open(p, '/');
  await shot(p, `${tag}-hero`);
  await p.locator('.first-bite-photo').scrollIntoViewIfNeeded(); await p.waitForTimeout(900); await shot(p, `${tag}-first-bite`);
  const badge = await p.locator('.order-badge').evaluate(el => el.classList.contains('is-on'));
  // footer physics
  await p.locator('.footer-wordmark').scrollIntoViewIfNeeded(); await p.waitForTimeout(2600); await shot(p, `${tag}-footer-1`);
  const pos1 = await p.locator('.fw-item').evaluateAll(els => els.map(e => e.style.transform));
  await p.locator('.fw-field').click({ position: { x: 100, y: 100 } }); await p.waitForTimeout(250); await shot(p, `${tag}-footer-jump`);
  await p.waitForTimeout(2000); await shot(p, `${tag}-footer-2`);
  const pos2 = await p.locator('.fw-item').evaluateAll(els => els.map(e => e.style.transform));
  const inside = await p.locator('.fw-item').evaluateAll(els => els.every(e => { const r = e.getBoundingClientRect(), f = document.querySelector('.footer-wordmark-wrap').getBoundingClientRect(); return r.right > f.left && r.left < f.right && r.top < f.bottom + 5; }));
  // page transition
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  if (w > 1000) await p.locator('.desktop-nav a', { hasText: 'THE MENU' }).click();
  else { await p.locator('.mobile-toggle').click(); await p.waitForTimeout(500); await p.locator('#mobile-nav a', { hasText: 'THE MENU' }).click(); }
  await p.waitForTimeout(380); await shot(p, `${tag}-transition-mid`);
  const label = await p.locator('.pt-name').innerText();
  await p.waitForTimeout(1600); await shot(p, `${tag}-transition-after`);
  const url = p.url(), overlayHidden = await p.locator('.page-transition').evaluate(el => getComputedStyle(el).visibility === 'hidden');
  // fly to bag
  await p.locator('.hof-card .add-to-bag, .menu-card .add-to-bag').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  await p.locator('.menu-card .add-to-bag').first().click(); await p.waitForTimeout(450); await shot(p, `${tag}-fly`);
  const flying = await p.locator('.fly-to-bag').count();
  await p.waitForTimeout(1200);
  const bag = await p.locator('.cart-header-link span').innerText();
  // kolkata map
  await open(p, '/kolkata'); await p.locator('.corner-map').scrollIntoViewIfNeeded(); await p.waitForTimeout(1500); await shot(p, `${tag}-map`);
  // back button transition
  await p.goBack(); await p.waitForTimeout(1800);
  console.log(JSON.stringify({ tag, badgeOnAfterScroll: badge, physicsMoved: JSON.stringify(pos1) !== JSON.stringify(pos2), itemsInside: inside, label, url, overlayHidden, flying, bag, backUrl: p.url() }));
  await p.close();
}
console.log('errors', JSON.stringify(errors));
await b.close();
