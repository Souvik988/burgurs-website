import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base = process.env.SITE_URL || 'http://localhost:4173';
const out = 'output/v8-check/transition'; await mkdir(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errors = []; p.on('pageerror', e => errors.push(e.message));
await p.goto(base + '/', { waitUntil: 'networkidle' });
await p.waitForSelector('.preloader', { state: 'detached', timeout: 10000 });
await p.waitForTimeout(500);
const t0 = Date.now();
await p.locator('.desktop-nav a', { hasText: 'OUR STORY' }).click();
const log = [];
for (let i = 0; i < 14; i++) {
  const s = await p.evaluate(() => ({ vis: getComputedStyle(document.querySelector('.page-transition')).visibility, band: document.querySelector('.pt-band-1').style.transform, path: location.pathname }));
  log.push(`${Date.now() - t0}ms ${s.path} ${s.vis} ${s.band}`);
  await p.screenshot({ path: `${out}/t-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 50 });
  await p.waitForTimeout(150);
}
console.log(log.join('\n'), '\nerrors', JSON.stringify(errors));
await b.close();
