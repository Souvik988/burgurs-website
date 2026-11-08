import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('output/phase-4', {recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5177/',{waitUntil:'networkidle'});
await page.waitForTimeout(2500);
await page.screenshot({path:'output/phase-4/home.jpg'});
const section=await page.locator('.bite-journey').evaluate(e=>({top:e.offsetTop,h:e.offsetHeight-innerHeight}));
for(const p of [0,.5,1]){await page.evaluate(y=>scrollTo(0,y),section.top+section.h*p);await page.waitForTimeout(1500);await page.screenshot({path:`output/phase-4/gallery-${p}.jpg`});}
await page.goto('http://localhost:5177/kolkata',{waitUntil:'networkidle'});await page.waitForTimeout(1000);await page.screenshot({path:'output/phase-4/kolkata.jpg'});
await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.waitForTimeout(600);await page.screenshot({path:'output/phase-4/menu-open.jpg'});
console.log(JSON.stringify({errors,section}));await browser.close();
