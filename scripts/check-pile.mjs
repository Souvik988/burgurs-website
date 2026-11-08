import { chromium } from '@playwright/test';
// Behind the Shot: the photo on TOP must be the first to leave; the next one must then be revealed.
const base = process.env.SITE_URL || 'http://localhost:5177';
const b = await chromium.launch({ channel: 'chrome', headless: true });
let bad = 0;
for (const [w, h] of [[1440, 900], [390, 844], [360, 640]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
  await p.goto(base + '/stories', { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
  await p.waitForTimeout(900);
  const top = await p.locator('.behind-shot').evaluate(el => (el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el).getBoundingClientRect().top + scrollY);
  const pinLen = await p.locator('.behind-shot').evaluate(el => el.parentElement.offsetHeight - el.offsetHeight);
  const log = [];
  for (const f of [0.02, .12, .3, .45, .62, .8, .97]) {
    await p.evaluate(y => scrollTo(0, y), top + pinLen * f); await p.waitForTimeout(900);
    const r = await p.evaluate(() => {
      const cards = [...document.querySelectorAll('.pile-card')];
      const pile = document.querySelector('.pile').getBoundingClientRect();
      const cx = pile.left + pile.width / 2, cy = pile.top + pile.height / 2;
      const gone = cards.map(c => { const r = c.getBoundingClientRect(); return r.right < 0 || r.left > innerWidth || Math.abs(r.left + r.width / 2 - cx) > innerWidth * .45; });
      const topEl = document.elementFromPoint(cx, cy)?.closest('.pile-card');
      const topIdx = cards.indexOf(topEl);
      return { gone, topIdx, counter: document.querySelector('.pile-count i')?.textContent };
    });
    // Cards must leave strictly in order 0,1,2,3 (never a later card while an earlier one remains), and the
    // visible top card must be the first one that has not left.
    const firstStaying = r.gone.findIndex(g => !g);
    const outOfOrder = r.gone.some((g, i) => g && r.gone.slice(0, i).some(x => !x));
    const topOk = r.topIdx === firstStaying || r.topIdx === -1 && firstStaying === -1;
    if (outOfOrder || !topOk) bad++;
    log.push(`${f}: gone=[${r.gone.map(g => (g ? 1 : 0)).join('')}] top=${r.topIdx} counter=${r.counter}${outOfOrder ? ' OUT-OF-ORDER' : ''}${topOk ? '' : ' WRONG-TOP'}`);
  }
  console.log(`${w}x${h}\n  ` + log.join('\n  '));
  await ctx.close();
}
console.log(bad ? `FAIL: ${bad} problems` : 'PASS: top photo always leaves first, next photo revealed beneath');
await b.close();
