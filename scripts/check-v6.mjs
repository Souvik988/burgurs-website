import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
for (const [w, h] of [[320, 568], [360, 640], [390, 844], [412, 915], [768, 1024], [1024, 768], [1440, 900]]) {
  for (const route of ['/', '/menu', '/story', '/kolkata', '/stories', '/visit']) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:5177' + route, { waitUntil: 'networkidle' });
    await page.waitForSelector('.preloader', { state: 'detached', timeout: 9000 });
    const wide = await page.evaluate(() => [...document.querySelectorAll('.v6-jump, .crew-section, .wots-section, .v7-words, .route-page > section')].map(el => ({ c: el.className.split(' ')[0], over: Math.round(el.getBoundingClientRect().right - document.documentElement.clientWidth), sw: el.scrollWidth - el.clientWidth })).filter(x => x.over > 0 || x.sw > 2));
    const pageOver = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    results.push({ w, route, pageOver, wide, errors });
    await page.close();
  }
}
// reduced motion: no preloader, content visible
const rm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await rm.goto('http://localhost:5177/', { waitUntil: 'networkidle' });
results.push({ reducedMotion: { preloader: await rm.locator('.preloader').count(), crewVisible: await rm.locator('.crew-andre').isVisible(), ready: await rm.evaluate(() => document.documentElement.dataset.siteReady) } });
console.log(JSON.stringify(results, null, 1));
await browser.close();
