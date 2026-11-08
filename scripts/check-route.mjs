import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
// Measures how far the taxi is from the road at many scroll positions, and screenshots the scene.
const base = process.env.SITE_URL || 'http://localhost:5177';
const out = 'output/route-check'; await mkdir(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const sizes = [[1440, 900, 'desk'], [1024, 768, 'tab'], [390, 844, 'ph'], [360, 640, 'small'], [412, 915, 'big']];
for (const [w, h, tag] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
  await p.goto(base + '/visit', { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(800);
  const top = await p.locator('.visit-route').evaluate(el => el.getBoundingClientRect().top + scrollY);
  let worst = 0, cardsOverlapRoad = 0, offscreen = 0, rows = [];
  for (const f of [0, .1, .25, .4, .55, .7, .85, .97, 1]) {
    // Scroll: the pin lasts 1.5-1.8 viewport heights.
    const span = Math.round(h * (w < 800 ? 1.5 : 1.8));
    await p.evaluate(y => scrollTo(0, y), top + span * f); await p.waitForTimeout(450);
    const m = await p.evaluate(() => {
      const stage = document.querySelector('.route-stage'), sr = stage.getBoundingClientRect();
      const path = document.querySelector('.route-line'), len = path.getTotalLength();
      const t = document.querySelector('.route-taxi').getBoundingClientRect();
      const cx = t.left + t.width / 2 - sr.left, cy = t.top + t.height / 2 - sr.top;
      let best = 1e9; for (let i = 0; i <= 400; i++) { const q = path.getPointAtLength(len * i / 400); best = Math.min(best, Math.hypot(q.x - cx, q.y - cy)); }
      const road = Array.from({ length: 200 }, (_, i) => path.getPointAtLength(len * i / 199));
      const cards = [...document.querySelectorAll('.route-step')].filter(c => getComputedStyle(c).visibility !== 'hidden');
      let overlap = 0, off = 0;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        if (r.left < sr.left - 2 || r.right > sr.right + 2 || r.top < sr.top - 2 || r.bottom > sr.bottom + 2) off++;
        if (road.some(q => { const x = q.x + sr.left, y = q.y + sr.top; return x > r.left + 4 && x < r.right - 4 && y > r.top + 4 && y < r.bottom - 4; })) overlap++;
      }
      return { err: best, cards: cards.length, overlap, off, pin: getComputedStyle(document.querySelector('.route-dres')).visibility };
    });
    worst = Math.max(worst, m.err); cardsOverlapRoad = Math.max(cardsOverlapRoad, m.overlap); offscreen = Math.max(offscreen, m.off);
    rows.push(`${f}:${m.err.toFixed(1)}px/${m.cards}c/${m.pin[0]}`);
    if ([.4, 1].includes(f)) await p.screenshot({ path: `${out}/${tag}-${String(f).replace('.', '')}.jpg`, type: 'jpeg', quality: 70 });
  }
  console.log(`${tag} ${w}x${h} worstTaxiOffRoad=${worst.toFixed(1)}px cardsOverlappingRoad=${cardsOverlapRoad} cardsOutsideStage=${offscreen} errors=${JSON.stringify(errors)}\n   ${rows.join('  ')}`);
  await ctx.close();
}
await b.close();
