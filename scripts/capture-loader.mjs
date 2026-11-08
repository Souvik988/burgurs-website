import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const out = process.argv[2] || 'output/v6-audit/loader';
const w = +(process.argv[3] || 1440), h = +(process.argv[4] || 900);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: w, height: h } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:5177/');
for (let i = 0; i < 14; i++) { await page.screenshot({ path: `${out}/f-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 55 }); await page.waitForTimeout(280); }
console.log(JSON.stringify({ errors, gone: await page.locator('.preloader').count() === 0 }));
await browser.close();
