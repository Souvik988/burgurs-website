import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const url = process.argv[2] || 'http://localhost:5177/';
const out = process.argv[3] || 'output/v6-audit';
const w = +(process.argv[4] || 1440), h = +(process.argv[5] || 900);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: w, height: h } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => { try { sessionStorage.setItem('dres-opening-seen', '1'); } catch {} });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('.preloader', { state: 'detached', timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1200);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const step = Math.round(h * 0.9);
let i = 0;
for (let y = 0; y < total; y += step) {
  await page.mouse.wheel(0, y === 0 ? 0 : step);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/s-${String(i++).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 60 });
}
console.log(JSON.stringify({ total, shots: i, errors }));
await browser.close();
