import { chromium } from '@playwright/test';
// Reduced-motion / motion-off fallback: every route must be readable, with no sideways overflow and
// no content stuck invisible, on phone and desktop.
const base = process.env.SITE_URL || 'http://localhost:5177';
const b = await chromium.launch({ channel: 'chrome', headless: true });
let bad = 0;
for (const [w, h] of (process.env.SIZES || '390x844,360x640,1440x900').split(',').map(s => s.split('x').map(Number))) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800, reducedMotion: process.env.NOREDUCE ? 'no-preference' : 'reduce' });
  for (const route of ['/', '/menu', '/story', '/kolkata', '/stories', '/visit']) {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + route, { waitUntil: 'networkidle' }); await p.waitForTimeout(900);
    const r = await p.evaluate(async () => {
      const total = document.documentElement.scrollHeight;
      for (let y = 0; y < total; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
      scrollTo(0, 0);
      const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      // headings that exist but are invisible (opacity 0 / hidden) would mean an animation never ran its end state
      const hidden = [...document.querySelectorAll('h1,h2,h3')].filter(e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return r.width > 0 && (c.visibility === 'hidden' || +c.opacity < .1); }).map(e => e.textContent.trim().slice(0, 24));
      const pinned = document.querySelectorAll('.pin-spacer').length;
      const clippedWide = [...document.querySelectorAll('.route-step,.day-card,.hof-card,.ch-card,.film-frame,.pile-card,.m-text')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 2 && !e.closest('.v7-track,.pile,.m-right'); }).length;
      return { over, hidden, pinned, clippedWide };
    });
    const flag = r.over > 0 || r.hidden.length || r.pinned || r.clippedWide || errs.length;
    if (flag) bad++;
    console.log(`${flag ? 'FAIL' : 'ok  '} ${w}x${h} ${route} ${JSON.stringify(r)} ${errs[0] || ''}`);
    await p.close();
  }
  await ctx.close();
}
console.log(bad ? `static fallback problems: ${bad}` : 'static fallback: all clean');
await b.close();
