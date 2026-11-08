import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
// usage: node scripts/audit-mobile.mjs <route> <outdir> [w] [h] [stepFraction]
const route = (r => (r === 'home' ? '/' : '/' + r))(process.argv[2] || 'home'), out = process.argv[3] || 'output/m-audit/home';
const w = +(process.argv[4] || 390), h = +(process.argv[5] || 844), stepF = +(process.argv[6] || .7);
const base = process.env.SITE_URL || 'http://localhost:5177';
await rm(out, { recursive: true, force: true }); await mkdir(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' });
const p = await ctx.newPage();
const errors = []; p.on('pageerror', e => errors.push(e.message));
await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
await p.goto(base + route, { waitUntil: 'networkidle' });
await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
await p.waitForTimeout(1200);
let i = 0, y = 0, last = -1;
while (true) {
  const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(+(process.env.WAIT || 650));
  await p.screenshot({ path: `${out}/s-${String(i++).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 62 });
  if (y >= max || i > 90) break;
  y = Math.min(max, y + Math.round(h * stepF));
}
const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log(JSON.stringify({ route, w, h, shots: i, overflowX: over, errors }));
await b.close();
