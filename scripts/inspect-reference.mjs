import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'output/reference-inspection';await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-http2'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('https://www.cravburgers.shop/', { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(e => errors.push(e.message));
await page.waitForTimeout(5000);
const info = await page.evaluate(() => ({ title: document.title, height: document.documentElement.scrollHeight, headings: [...document.querySelectorAll('h1,h2')].map(el => ({ text: el.innerText, y: el.getBoundingClientRect().top + scrollY })), sections: [...document.querySelectorAll('main section')].map(el => ({ text: el.innerText.slice(0, 220), y: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height })) }));
console.log(JSON.stringify(info, null, 2));
const states = [];
for (let step = 0; step < 18; step++) {
  if (step) await page.mouse.wheel(0, 650);
  await page.waitForTimeout(650);
  states.push(await page.evaluate(() => ({ y: scrollY, pictures: [...document.querySelectorAll('img')].map(i => { const r = i.getBoundingClientRect();return { src: i.currentSrc, transform: getComputedStyle(i).transform, opacity: getComputedStyle(i).opacity, x: r.x, y: r.y, w: r.width, h: r.height }; }).filter(i => i.y < innerHeight && i.y + i.h > 0) })));
  await page.screenshot({ path: `${out}/scroll-${String(step).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80, timeout: 20000 });
}
await writeFile(`${out}/reference.json`, JSON.stringify({ info, states, errors }, null, 2));
console.log('Captured reference scroll states', states.map(s => s.y));await browser.close();
