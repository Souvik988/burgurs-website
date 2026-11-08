import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('output/contrast-v4', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const measurements = [];
const checks = [];
const check = (name, passed) => { checks.push({ name, passed }); if (!passed) throw new Error(name); };
try {
  await page.goto('http://localhost:5177/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.evaluate(async () => {
    for (const img of document.images) img.loading = 'eager';
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
  });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.waitForTimeout(700);
    for (const selector of ['.burger-assembly', '.bite-journey']) {
      const bounds = await page.locator(selector).evaluate(el => ({ top: el.offsetTop, travel: el.offsetHeight - innerHeight }));
      await page.evaluate(y => scrollTo(0, y), bounds.top + bounds.travel * .12);
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        window.motionSample = { frames: [], longTasks: [], running: true, previous: 0 };
        const sample = window.motionSample;
        sample.observer = new PerformanceObserver(list => sample.longTasks.push(...list.getEntries().map(e => e.duration)));
        sample.observer.observe({ type: 'longtask', buffered: false });
        function frame(time) {
          if (!sample.running) return;
          if (sample.previous) sample.frames.push(time - sample.previous);
          sample.previous = time;
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      for (let i = 0; i < 16; i++) { await page.mouse.wheel(0, bounds.travel * .04); await page.waitForTimeout(100); }
      measurements.push({ width, selector, ...await page.evaluate(() => {
        const sample = window.motionSample;
        sample.running = false;
        sample.observer.disconnect();
        const sorted = sample.frames.sort((a, b) => a - b);
        return { frameCount: sorted.length, medianFrameMs: sorted[Math.floor(sorted.length * .5)], p95FrameMs: sorted[Math.floor(sorted.length * .95)], longTasks: sample.longTasks };
      }) });
      if (width === 390) {
        await page.evaluate(y => scrollTo(0, y), bounds.top + bounds.travel * .5);
        await page.waitForTimeout(600);
        await page.screenshot({ path: `output/contrast-v4/${selector === '.burger-assembly' ? 'assembly' : 'portraits'}-mobile-final.jpg` });
        if (selector === '.burger-assembly') check('Phone ingredient story clears its action controls', await page.evaluate(() => document.querySelector('.assembly-actions').getBoundingClientRect().bottom < document.querySelector('.piece-0').getBoundingClientRect().top + 15));
      }
    }
  }
  await page.goto('http://localhost:5177/menu', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('dres-cart:v1'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('.menu-card').first().getByRole('button', { name: 'ADD TO BAG', exact: false }).click();
  await page.getByRole('link', { name: 'Open bag, 1 items', exact: true }).click();
  await page.waitForURL('**/cart');
  await page.getByRole('button', { name: 'REMOVE', exact: true }).click();
  await page.locator('.empty-bag').waitFor();
  check('Last-item removal keeps Undo available', await page.getByRole('button', { name: 'UNDO', exact: true }).isVisible());
  await page.getByRole('button', { name: 'UNDO', exact: true }).click();
  await page.locator('.cart-line').waitFor();
  check('Undo restores the last removed item', await page.locator('.cart-line').count() === 1);
} catch (error) { checks.push({ passed: false, error: error.message }); process.exitCode = 1; }
await writeFile('output/contrast-v4/motion-checks.json', JSON.stringify({ environment: 'Local headless Chrome, native wheel scrolling, no CPU throttling; frame timing is diagnostic, not a device-wide FPS guarantee.', checks, measurements }, null, 2));
console.log(JSON.stringify({ checks, measurements }, null, 2));
await browser.close();
