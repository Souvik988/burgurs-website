import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
await mkdir('output/contrast-v4',{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:5177/',{waitUntil:'networkidle'});await p.waitForTimeout(2400);await p.screenshot({path:'output/contrast-v4/hero.jpg'});
for(const [name,selector,progress] of [['city','.city-grounded',null],['assembly','.burger-assembly',.5],['portraits','.bite-journey',.5]]){
 if(progress===null)await p.locator(selector).scrollIntoViewIfNeeded();else{const r=await p.locator(selector).evaluate(el=>({top:el.offsetTop,travel:el.offsetHeight-innerHeight}));await p.evaluate(y=>scrollTo(0,y),r.top+r.travel*progress)}
 await p.waitForTimeout(1500);await p.screenshot({path:`output/contrast-v4/${name}.jpg`});
}
await p.goto('http://localhost:5177/menu',{waitUntil:'networkidle'});await p.waitForTimeout(1500);await p.locator('.menu-card').first().getByRole('button',{name:'ADD TO BAG',exact:false}).click();await p.getByRole('link',{name:'Open bag, 1 items',exact:true}).click();await p.waitForTimeout(700);await p.screenshot({path:'output/contrast-v4/cart.jpg'});console.log(JSON.stringify({errors}));await b.close();
