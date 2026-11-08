import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { menu } from '../src/data/menu.js';
await mkdir('output/menu-rebuild',{recursive:true});
const source=JSON.parse(await readFile('research/zomato-menu-verified.json','utf8'));
const checks=[];const check=(name,passed)=>{checks.push({name,passed:!!passed});if(!passed)throw new Error(name)};
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];const failures=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith('http://localhost:5177')&&r.status()>=400)failures.push(r.url())});
try{
check('All 16 exact Zomato items, prices and full descriptions retained',menu.length===source.length&&menu.every((item,i)=>item.name===source[i].name&&item.price===source[i].price&&item.description===source[i].description));
check('Exact photo-to-item mappings retained',menu.every((item,i)=>item.imageSource===source[i].image));
check('Fourteen photographed items and two without listed photos',menu.filter(x=>x.image).length===14&&menu.filter(x=>!x.image).length===2);
check('All source dietary flags retained',menu.every((item,i)=>item.vegetarian===source[i].dietary.includes('veg')));
check('All catalog artwork placeholders removed',menu.every(item=>!item.art&&!item.icon));
await page.goto('http://localhost:5177/menu',{waitUntil:'networkidle'});await page.waitForTimeout(2300);
check('Sixteen menu cards rendered',await page.locator('.menu-card').count()===16);
check('Missing source photos explicitly identified',await page.locator('.product-photo-ticket').count()===2);
for(const item of menu.filter(x=>x.image)){
 const button=page.getByRole('button',{name:`Show original photo of ${item.name}`,exact:true});await button.click();const card=page.locator('.menu-card').filter({has:page.getByRole('button',{name:`View ${item.name}`,exact:true})});check(`${item.name} switches to its own original photograph`,(await card.locator('.product-photo>img').getAttribute('src'))===item.originalImage);await page.getByRole('button',{name:`Show edited photo of ${item.name}`,exact:true}).click();
}
await page.getByRole('button',{name:'View Smashburg',exact:true}).click();await page.waitForTimeout(450);
check('Full ingredient description in item detail',(await page.getByRole('dialog').innerText()).includes(menu.find(i=>i.id==='smashburg').description));
check('All three actual Smashburg add-ons shown',await page.locator('.cart-item-extras label').count()===3);
await page.getByRole('button',{name:'Show original photograph 2 of Smashburg',exact:true}).click();check('Additional mapped source photograph works',(await page.locator('dialog .product-photo>img').getAttribute('src'))===menu.find(i=>i.id==='smashburg').gallery[1]);
await page.screenshot({path:'output/menu-rebuild/smashburg-original-detail.jpg'});await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
await page.getByRole('button',{name:'View Stacked and Racked Beef Burger',exact:true}).click();check('Shared source photograph disclosed',(await page.getByRole('dialog').innerText()).includes('both Stacked and Racked'));await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
await page.goto('http://localhost:5177/',{waitUntil:'networkidle'});await page.waitForTimeout(2300);await page.screenshot({path:'output/menu-rebuild/home-updated.jpg'});
const scene=await page.locator('.burger-assembly').evaluate(e=>({top:e.offsetTop,travel:e.offsetHeight-innerHeight}));const transforms=[];
for(const progress of [0,.5,1]){await page.evaluate(y=>scrollTo(0,y),scene.top+scene.travel*progress);await page.waitForTimeout(1500);transforms.push(await page.locator('.piece-0').evaluate(el=>getComputedStyle(el).transform));await page.screenshot({path:`output/menu-rebuild/assembly-final-${progress}.jpg`});}
check('Burger top opens and closes with scroll',transforms[0]!==transforms[1]&&transforms[1]!==transforms[2]);
await page.getByRole('button',{name:'OPEN IT UP',exact:false}).click();await page.waitForTimeout(1500);check('Open button scrubs to separated state',(await page.locator('.assembly-readout').innerText()).includes('GOOD STUFF'));
await page.locator('.burger-encore').scrollIntoViewIfNeeded();await page.waitForTimeout(1500);const t1=await page.locator('.encore-photo').first().evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(700);const t2=await page.locator('.encore-photo').first().evaluate(e=>getComputedStyle(e).transform);check('Footer food bounces while visible',t1!==t2);
await page.screenshot({path:'output/menu-rebuild/footer-final.jpg'});await page.getByRole('button',{name:'View Smashburg from footer',exact:true}).click();check('Footer opens the correct real item',await page.getByRole('dialog',{name:'Smashburg',exact:true}).isVisible());await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:5177/',{waitUntil:'networkidle'});await page.waitForTimeout(1500);const phone=await page.locator('.burger-assembly').evaluate(e=>({top:e.offsetTop,travel:e.offsetHeight-innerHeight}));await page.evaluate(y=>scrollTo(0,y),phone.top+phone.travel*.5);await page.waitForTimeout(1500);await page.screenshot({path:'output/menu-rebuild/assembly-mobile-final.jpg'});
check('Phone assembly headline stays clear of first layer',await page.evaluate(()=>{const copy=document.querySelector('.assembly-actions').getBoundingClientRect();const layer=document.querySelector('.piece-0').getBoundingClientRect();return copy.bottom<layer.top+15}));
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto('http://localhost:5177/',{waitUntil:'networkidle'});
check('Reduced motion removes long pinned assembly',await reduced.locator('.burger-assembly').evaluate(e=>e.offsetHeight<=1000));await reduced.getByRole('button',{name:'EXPLORE THE LAYERS',exact:false}).click();check('Reduced motion still permits manual exploration',await reduced.locator('.burger-assembly').evaluate(e=>e.classList.contains('manual-open')));await reduced.close();
check('No runtime errors',errors.length===0);check('No failed local images or modules',failures.length===0);
}catch(e){checks.push({passed:false,error:e.message});await page.screenshot({path:'output/menu-rebuild/test-failure.jpg'});process.exitCode=1;}
await writeFile('output/menu-rebuild/results.json',JSON.stringify({checks,errors,failures},null,2));console.log(JSON.stringify({checks,errors,failures},null,2));await browser.close();
