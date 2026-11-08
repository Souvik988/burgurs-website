import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base = process.env.SITE_URL || 'http://localhost:5177';
await mkdir('output/map-check', { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h, tag] of [[390, 844, 'ph'], [1440, 900, 'desk']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5, isMobile: w < 800, hasTouch: w < 800 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
  await p.goto(base + '/kolkata', { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(800);
  const y0 = await p.locator('.corner-map').evaluate(el => el.getBoundingClientRect().top + scrollY);
  const rows = [];
  // sweep the map through the screen: start (map entering), middle (taxi riding), end (arrival)
  for (const [name, off] of [['a', .85], ['b', .6], ['c', .35], ['d', .2]]) {
    await p.evaluate(y => scrollTo(0, y), y0 - h * off); await p.waitForTimeout(1300);
    const m = await p.evaluate(() => {
      const map = document.querySelector('.corner-map').getBoundingClientRect(), t = document.querySelector('.corner-rider').getBoundingClientRect();
      return { riderInside: t.left >= map.left - 2 && t.right <= map.right + 2 && t.top >= map.top - 2 && t.bottom <= map.bottom + 2, label2: getComputedStyle(document.querySelector('.corner-label-2')).transform };
    });
    rows.push(`${name}:${m.riderInside ? 'rider-in-map' : 'RIDER-OUT'}`);
    await p.locator('.corner-map').screenshot({ path: `output/map-check/${tag}-${name}.jpg`, type: 'jpeg', quality: 78 });
  }
  console.log(tag, rows.join(' '), JSON.stringify(errs));
  await ctx.close();
}
await b.close();
