import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const out = 'output/home-restoration';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const checks = [], errors = [], failures = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.url().startsWith('http://localhost:5177') && r.status() >= 400) failures.push(r.url()); });
const check = (name, passed) => { checks.push({ name, passed: !!passed }); if (!passed) throw new Error(name); };
const shot = name => page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 85 });
async function close() { await page.keyboard.press('Escape'); await page.locator('dialog').waitFor({ state: 'detached' }); }
async function scene(selector, progress) {
  const bounds = await page.locator(selector).evaluate(el => ({ top: el.offsetTop, travel: el.offsetHeight - innerHeight }));
  await page.evaluate(y => scrollTo(0, y), bounds.top + bounds.travel * progress);
  await page.waitForTimeout(950);
}
try {
  await page.goto('http://localhost:5177/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2300);
  await page.evaluate(async () => { for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
  check('Repeated rejected backdrop removed from homepage', await page.locator('img[src*="kolkata-paper-world-v4"]').count() === 0);
  check('Yellow portrait gallery restored', await page.locator('.bite-journey-stage').evaluate(el => getComputedStyle(el).backgroundColor === 'rgb(255, 215, 80)'));
  check('Yellow ingredient stage restored', await page.locator('.assembly-stage').evaluate(el => getComputedStyle(el).backgroundColor === 'rgb(255, 215, 80)'));
  check('Ingredient stage has no repeated city backdrop', await page.locator('.assembly-city').count() === 0);
  check('Seven original illustrated photo frames restored', await page.locator('.campaign-doodle-frame').count() === 7);
  check('Original tram artwork restored', (await page.locator('.city-tram').getAttribute('src')).includes('kolkata-tram-sticker-v2'));
  check('Campaign remains honestly labelled', (await page.locator('.campaign-disclosure').innerText()).includes('fictional people'));
  const track = [], tram = [];
  for (const progress of [0, .35, .5, 1]) {
    await scene('.bite-journey', progress);
    track.push(await page.locator('.bite-journey-track').evaluate(el => getComputedStyle(el).transform));
    tram.push(await page.locator('.city-tram').evaluate(el => getComputedStyle(el).transform));
    if (progress === .35) check('Tram has a clear visible pass above the portraits', await page.evaluate(() => {
      const tram = document.querySelector('.city-tram').getBoundingClientRect();
      const card = [...document.querySelectorAll('.bite-slide')].map(el => el.getBoundingClientRect()).find(b => b.left < tram.right && b.right > tram.left);
      return tram.left >= 0 && tram.right <= innerWidth && tram.top >= 0 && (!card || tram.bottom <= card.top + 30);
    }));
    await shot(`gallery-desktop-${progress}`);
  }
  check('Photo gallery travels with scroll', new Set(track).size === 4);
  check('Tram travels along its curved route with scroll', new Set(tram).size === 4);
  check('Last photo remains fully accessible', await page.locator('.bite-slide-6').evaluate(el => { const b = el.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth; }));
  await page.getByRole('button', { name: 'THE FIRST BITE.', exact: true }).click();
  await page.waitForTimeout(1100);
  check('Gallery controls reach first frame', await page.locator('.journey-dots .active').getAttribute('aria-label') === 'THE FIRST BITE.');
  await page.locator('.bite-slide-0 > button').click();
  check('Photo expansion still works', await page.getByRole('dialog').isVisible());
  await close();
  await scene('.burger-assembly', .5); await shot('assembly-desktop');
  await page.locator('.city-grounded').scrollIntoViewIfNeeded(); await page.waitForTimeout(900); await shot('city-desktop');
  check('City chapter uses a real street and real storefront', await page.locator('.city-grounded > .city-postcards-grid img').evaluateAll(images => images.length === 2 && images.some(i => i.src.includes('college-street')) && images.some(i => i.src.includes('dres-food-3'))));
  await page.getByRole('button', { name: 'See the real Dre’s storefront', exact: true }).click();
  check('Actual storefront opens with its source', await page.getByRole('dialog').getByRole('link').count() > 0); await close();
  await page.locator('.founder-workbench').scrollIntoViewIfNeeded(); await page.waitForTimeout(1000); await shot('founder-preserved');
  check('Approved founder cutout preserved', await page.locator('.founder-work-portrait img').getAttribute('src') === '/assets/founder/andre-at-work-cutout.webp');
  check('Approved kitchen paper frame preserved', await page.locator('.founder-work-buns img').getAttribute('src') === '/assets/founder/signature-buns-paper.webp');
  // v6: the homepage carries the paper-cut crew; the work scenes now live on /story.
  await page.locator('.crew-section').scrollIntoViewIfNeeded(); await page.waitForTimeout(1600); await shot('crew-section');
  check('Paper-cut founder portrait decodes', await page.locator('.crew-andre').evaluate(i => i.naturalWidth > 0));
  check('Crew illustration is disclosed', (await page.locator('.crew-note').innerText()).includes('Illustrated'));
  const story = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await story.goto('http://localhost:5177/story', { waitUntil: 'networkidle' });
  await story.waitForSelector('.preloader', { state: 'detached', timeout: 9000 }).catch(() => {});
  // v7: the two AI work scenes now illustrate the SMASH and STACK steps of the Story page's method.
  await story.evaluate(async () => { for (const img of document.querySelectorAll('.m-shot img')) { img.loading = 'eager'; await img.decode().catch(() => {}); } });
  const aiShots = await story.locator('.m-shot img[src*="concept-v5"]').evaluateAll(images => images.filter(i => i.naturalWidth > 0).length);
  check('Two AI work scenes decode in the method', aiShots === 2);
  check('AI work scenes are labelled', (await story.locator('.m-shot figcaption').allInnerTexts()).filter(t => t.includes('AI SCENE')).length === 2);
  check('Method text discloses AI scenes', (await story.locator('.m-texts').innerText()).includes('AI-created work scene'));
  await story.close();
  const videoCount = await page.locator('.video-poster').count();
  check('Original homepage food videos retained', videoCount >= 3);
  await page.locator('.video-poster').first().click();
  check('Original homepage video opens its player', await page.locator('dialog iframe').count() === 1); await close();
  await page.getByRole('button', { name: 'Open Instagram post: ANDRE IN THE KITCHEN.', exact: true }).click();
  check('Actual founder Instagram video is retained', (await page.locator('dialog iframe').getAttribute('src')).includes('DCjAOJ_vgBD')); await close();
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 }); await page.waitForTimeout(600);
    check(`Homepage ${width}px has no overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    for (const progress of [0, .5, 1]) { await scene('.bite-journey', progress); await shot(`gallery-${width}-${progress}`); }
    check(`Last portrait fits ${width}px`, await page.locator('.bite-slide-6').evaluate(el => { const b = el.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth; }));
    check(`Gallery controls fit ${width}px viewport`, await page.locator('.journey-controls').evaluate(el => { const b = el.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight; }));
    await scene('.burger-assembly', .5); await shot(`assembly-${width}`);
    if (width === 390) check('Phone burger stays clear of actions', await page.evaluate(() => document.querySelector('.assembly-actions').getBoundingClientRect().bottom < document.querySelector('.piece-0').getBoundingClientRect().top + 15));
    await page.locator('.city-grounded').scrollIntoViewIfNeeded(); await page.waitForTimeout(600); await shot(`city-${width}`);
    await page.locator('.crew-section').scrollIntoViewIfNeeded(); await page.waitForTimeout(600); await shot(`crew-${width}`);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  check('Reduced motion has native horizontal gallery', await page.locator('.bite-journey').evaluate(el => el.classList.contains('journey-static')));
  check('Reduced motion has no pinned tram animation', await page.locator('.city-tram').evaluate(el => getComputedStyle(el).display === 'none'));
  await page.getByRole('button', { name: 'ONE MORE ROUND.', exact: true }).click();
  check('Reduced motion controls reach last photo', await page.locator('.journey-dots .active').getAttribute('aria-label') === 'ONE MORE ROUND.');
  await page.evaluate(async () => { for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
  check('All homepage images decode', await page.locator('img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0)));
  check('No application exceptions', errors.length === 0);
  check('No failed local requests', failures.length === 0);
} catch (error) { checks.push({ passed: false, error: error.message }); await shot('failure'); process.exitCode = 1; }
await writeFile(`${out}/results.json`, JSON.stringify({ checks, errors, failures }, null, 2));
console.log(JSON.stringify({ checks, errors, failures }, null, 2));
await browser.close();
