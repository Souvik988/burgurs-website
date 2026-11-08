import { chromium } from '@playwright/test';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
for (const r of ['/', '/menu', '/story', '/kolkata', '/stories', '/visit', '/cart']) {
  await p.goto('http://localhost:5177' + r, { waitUntil: 'networkidle' });
  const info = await p.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content.length,
    robots: document.querySelector('meta[name="robots"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    h1: document.querySelectorAll('h1').length,
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent)['@type']; } catch { return 'INVALID'; } }),
  }));
  console.log(r, JSON.stringify(info));
}
await b.close();
