import { chromium } from '@playwright/test';
// For every pinned section, at several screen sizes: (1) sits flush at the top while pinned,
// (2) no visible content is cut off at the top/bottom of the screen at several points along the pin.
const base = process.env.SITE_URL || 'http://localhost:5177';
const sel = {
  kolkata: ['.kol-hero', '.day-at-dres'],
  visit: ['.visit-route'],
  story: ['.story-chapters', '.story-method'],
  stories: ['.film-strip-section', '.behind-shot'],
  menu: ['.hall-of-fame'],
};
const sizes = (process.env.SIZES || '390x844,360x640,412x915,768x1024,1440x900').split(',').map(s => s.split('x').map(Number));
const CONTENT = 'h1,h2,h3,p:not(.kh-caption),button,.button,a.button,figcaption,.hof-photo img,.ch-photo>img:first-child,.film-poster,.route-step,.day-card,.day-clock,.m-counter,.pile-count';
let problems = 0;
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of sizes) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 800, hasTouch: w < 800 });
  for (const [route, list] of Object.entries(sel)) {
    const p = await ctx.newPage();
    await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
    await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
    await p.waitForTimeout(900);
    for (const s of list) {
      const info = await p.evaluate(async ([s, CONTENT]) => {
        const el = document.querySelector(s);
        if (!el) return { missing: true };
        const start = el.getBoundingClientRect().top + scrollY;
        const spacer = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : null;
        const pinLen = (spacer ? spacer.offsetHeight : el.offsetHeight) - el.offsetHeight;
        let bad = 0, worst = 0, samples = 0; const clipped = new Set();
        const checkpoints = [0, .15, .35, .5, .7, .9];
        for (let y = start - innerHeight * .3; y < start + pinLen + innerHeight * .2; y += Math.max(40, innerHeight / 14)) {
          scrollTo(0, y); await new Promise(r => setTimeout(r, 70));
          if (y >= start + 4 && y <= start + pinLen - 4) { samples++; const t = el.getBoundingClientRect().top; if (Math.abs(t) > 1.5) { bad++; worst = Math.max(worst, Math.abs(t)); } }
        }
        for (const f of checkpoints) {
          scrollTo(0, start + 6 + (pinLen - 12) * f); await new Promise(r => setTimeout(r, 650));
          for (const c of el.querySelectorAll(CONTENT)) {
            const cs = getComputedStyle(c);
            if (cs.visibility === 'hidden' || +cs.opacity < .5 || c.closest('[aria-hidden="true"]') || c.closest('.pile-card, .m-shot')) continue;
            const r = c.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) continue;
            const inX = r.right > 4 && r.left < innerWidth - 4;          // horizontally on screen
            if (!inX) continue;
            if (r.bottom > innerHeight + 3 || r.top < -3) clipped.add(`${f}:${c.className?.toString().slice(0, 22) || c.tagName}`);
          }
        }
        // The card that is meant to be on top at the start of the method / photo pile must fit on screen.
        scrollTo(0, start + 6); await new Promise(r => setTimeout(r, 2200));
        for (const q of ['.m-shot:first-child', '.pile-card:first-child']) {
          const c = el.querySelector(q); if (!c) continue;
          const r = c.getBoundingClientRect();
          if (r.top < -3 || r.bottom > innerHeight + 3 || r.left < -3 || r.right > innerWidth + 3) clipped.add('first:' + q);
        }
        return { pinLen: Math.round(pinLen), samples, bad, worst: Math.round(worst), clipped: [...clipped].slice(0, 6) };
      }, [s, CONTENT]);
      const flag = info.missing || info.bad || (info.clipped && info.clipped.length) || errs.length;
      if (flag) problems++;
      console.log(`${flag ? 'FAIL' : 'ok  '} ${w}x${h} /${route} ${s}`, JSON.stringify(info), errs.length ? 'ERR ' + errs[0] : '');
    }
    await p.close();
  }
  await ctx.close();
}
console.log('problems:', problems);
await b.close();
