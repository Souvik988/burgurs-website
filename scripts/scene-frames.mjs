import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
// Screenshots a pinned/scrubbed section at several progress points.
// usage: node scripts/scene-frames.mjs <route|home> <selector> <name> [WxH ...]
const route = (r => (r === 'home' ? '/' : '/' + r))(process.argv[2] || 'home');
const sel = process.argv[3], name = process.argv[4] || 'scene';
const sizes = (process.argv.slice(5).length ? process.argv.slice(5) : ['390x844', '441x690']).map(s => s.split('x').map(Number));
const base = process.env.SITE_URL || 'http://localhost:5177';
const steps = (process.env.STEPS || '-0.3,0,0.25,0.5,0.75,1,1.15').split(',').map(Number);
await mkdir('output/scene', { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of sizes) {
  const touch = !process.env.MOUSE && w < 800;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
  await p.goto(base + route, { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(1500);
  const g = await p.evaluate(s => { const el = document.querySelector(s); const host = el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el; const top = host.getBoundingClientRect().top + scrollY; const len = Math.max(host.offsetHeight - (host === el ? innerHeight : el.offsetHeight), innerHeight * .5); return { top, len }; }, sel);
  let i = 0;
  for (const f of steps) {
    await p.evaluate(y => scrollTo(0, y), Math.max(0, g.top + g.len * f)); await p.waitForTimeout(1100);
    await p.screenshot({ path: `output/scene/${name}-${w}x${h}-${String(i++).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 66 });
  }
  console.log(name, `${w}x${h}`, JSON.stringify(g), errs[0] || '');
  await ctx.close();
}
await b.close();
