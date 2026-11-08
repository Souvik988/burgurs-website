import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const base = process.env.SITE_URL || 'http://localhost:5177';
await mkdir('output/day-check', { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h, tag] of [[390, 844, 'ph'], [1440, 900, 'desk']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
  await p.goto(base + '/kolkata', { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(900);
  const { top, len } = await p.locator('.day-at-dres').evaluate(el => ({ top: el.parentElement.getBoundingClientRect().top + scrollY, len: el.parentElement.offsetHeight - el.offsetHeight }));
  const rows = [];
  for (const f of [.02, .35, .68, .98]) {
    await p.evaluate(y => scrollTo(0, y), top + len * f); await p.waitForTimeout(1100);
    const m = await p.evaluate(() => { const r = s => { const q = document.querySelector(s).getBoundingClientRect(); return [Math.round(q.left + q.width / 2), Math.round(q.top + q.height / 2)]; }; return { sun: r('.day-sun'), moon: r('.day-moon'), vw: innerWidth, vh: innerHeight, time: document.querySelector('.day-clock-time').textContent }; });
    rows.push(`${f}: ${m.time}pm sun@${m.sun} moon@${m.moon}`);
    if (f === .35 || f === .98) await p.screenshot({ path: `output/day-check/${tag}-${f}.jpg`, type: 'jpeg', quality: 70 });
  }
  console.log(tag, JSON.stringify(errs), '\n  ' + rows.join('\n  '));
  await ctx.close();
}
await b.close();
