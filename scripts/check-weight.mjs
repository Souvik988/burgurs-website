import { chromium } from '@playwright/test';
// Bytes downloaded per route after a full scroll, plus the heaviest files.
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of [[390, 844], [1440, 900]]) {
  for (const r of ['/', '/menu', '/story', '/kolkata', '/stories', '/visit']) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const files = [];
    p.on('response', async res => { try { const buf = await res.body(); files.push([res.url().replace('http://localhost:5177', ''), buf.length]); } catch {} });
    await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle' });
    await p.waitForSelector('.preloader', { state: 'detached', timeout: 10000 }).catch(() => {});
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 700) { await p.mouse.wheel(0, 700); await p.waitForTimeout(120); }
    await p.waitForLoadState('networkidle');
    const imgs = files.filter(f => /\.(webp|jpe?g|png)/.test(f[0]));
    const sum = a => (a.reduce((s, f) => s + f[1], 0) / 1048576).toFixed(2);
    console.log(`${w} ${r} total ${sum(files)}MB images ${sum(imgs)}MB n=${imgs.length} heaviest: ${imgs.sort((a, b) => b[1] - a[1]).slice(0, 4).map(f => `${f[0].split('/').slice(-2).join('/')} ${(f[1] / 1024) | 0}K`).join(', ')}`);
    await p.close();
  }
}
await b.close();
