import { chromium } from '@playwright/test';
// Scroll each route on a throttled "phone" and report frame timing (production build on :4173).
const base = process.env.SITE_URL || 'http://localhost:4173';
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const r of (process.env.ROUTES || 'home,menu,story,kolkata,stories,visit').split(',').map(r => r === 'home' ? '/' : '/' + r)) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await p.goto(base + r, { waitUntil: 'networkidle' });
  await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const res = await p.evaluate(async () => {
    const frames = []; let last = performance.now(), on = true;
    const loop = t => { frames.push(t - last); last = t; if (on) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    let longTasks = 0; try { new PerformanceObserver(l => { longTasks += l.getEntries().length; }).observe({ type: 'longtask', buffered: false }); } catch {}
    const max = document.documentElement.scrollHeight - innerHeight;
    for (let y = 0; y < max; y += 24) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); }
    on = false;
    const f = frames.slice(2).sort((a, b) => a - b);
    const pct = q => f[Math.floor(f.length * q)];
    return { frames: f.length, p50: pct(.5).toFixed(1), p95: pct(.95).toFixed(1), janky: (f.filter(x => x > 50).length / f.length * 100).toFixed(1) + '%', longTasks };
  });
  console.log(r, JSON.stringify(res));
  await ctx.close();
}
await b.close();
