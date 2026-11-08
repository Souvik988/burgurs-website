import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
// usage: node scripts/shot-mobile.mjs <route> <name> <selector|y> [WxH ...]  -> output/m-shots/<name>-<WxH>.jpg
const route = (r => (r === 'home' ? '/' : '/' + r))(process.argv[2] || 'home');
const name = process.argv[3] || 'shot', target = process.argv[4] || '0';
const sizes = (process.argv.slice(5).length ? process.argv.slice(5) : ['390x844', '360x640']).map(s => s.split('x').map(Number));
const base = process.env.SITE_URL || 'http://localhost:5177';
await mkdir('output/m-shots', { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5, isMobile: w < 800, hasTouch: w < 800 });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
  await p.goto(base + route, { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(2600);
  if (/^\d+$/.test(target)) await p.evaluate(y => scrollTo(0, y), +target);
  else await p.evaluate(s => { const el = document.querySelector(s); scrollTo(0, el.getBoundingClientRect().top + scrollY - 0); }, target);
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `output/m-shots/${name}-${w}x${h}.jpg`, type: 'jpeg', quality: 78 });
  await ctx.close();
}
await b.close();
