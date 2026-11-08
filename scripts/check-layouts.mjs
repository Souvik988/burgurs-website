import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const output = [];
for (const width of [390, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of ['', 'menu', 'story', 'kolkata', 'stories', 'visit', 'cart', 'checkout']) {
    await page.goto(`http://localhost:5177/${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready;for (const image of document.images) image.loading = 'eager';await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
    await page.waitForTimeout(150);
    output.push({ width, route, ...await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, broken: [...document.images].filter(i => !i.naturalWidth).map(i => i.src), h1: document.querySelector('h1').innerText })) });
    await page.screenshot({ path: `output/verification/layout-${route || 'home'}-${width}.jpg`, fullPage: true, type: 'jpeg', quality: 70, timeout: 30000 });
  }
}
await writeFile('output/verification/layout-results.json', JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));await browser.close();
