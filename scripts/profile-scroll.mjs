import { chromium } from '@playwright/test';
// CPU-profile a throttled phone scroll through a route. usage: node scripts/profile-scroll.mjs <route|home> [url-base]
const route = (r => (r === 'home' ? '/' : '/' + r))(process.argv[2] || 'home');
const base = process.argv[3] || 'http://localhost:4173';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
await p.addInitScript(() => { try { sessionStorage.setItem('dres-loader-seen', '1'); } catch {} });
await p.goto(base + route, { waitUntil: 'networkidle' });
await p.waitForSelector('.preloader', { state: 'detached', timeout: 12000 }).catch(() => {});
await p.waitForTimeout(1000);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReturnAsStream' }).catch(() => {});
await p.evaluate(async () => { const max = document.documentElement.scrollHeight - innerHeight; for (let y = 0; y < max; y += 24) { scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); } });
const { profile } = await cdp.send('Profiler.stop');
const byId = new Map(profile.nodes.map(n => [n.id, n])); const dt = profile.timeDeltas; const counts = new Map();
profile.samples.forEach((id, i) => counts.set(id, (counts.get(id) || 0) + (dt[i] || 0)));
const self = new Map();
for (const [id, t] of counts) { const cf = byId.get(id).callFrame; const k = `${cf.functionName || '(anon)'} ${cf.url.split('/').slice(-1)[0].slice(0, 28)}:${cf.lineNumber}`; self.set(k, (self.get(k) || 0) + t); }
const total = [...self.values()].reduce((a, c) => a + c, 0);
console.log([...self].sort((a, c) => c[1] - a[1]).slice(0, 10).map(([k, t]) => `${(t / 1000).toFixed(0)}ms ${(t / total * 100).toFixed(1)}% ${k}`).join('\n'));
await b.close();
