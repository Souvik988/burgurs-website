import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('output/menu-rebuild',{recursive:true});
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://localhost:5177/menu',{waitUntil:'networkidle'});await p.waitForTimeout(2300);await p.locator('.menu-catalog').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);await p.screenshot({path:'output/menu-rebuild/menu-desktop.jpg'});
await p.getByRole('button',{name:'View Smashburg',exact:true}).click();await p.waitForTimeout(500);await p.screenshot({path:'output/menu-rebuild/smashburg-detail.jpg'});await p.keyboard.press('Escape');await p.locator('dialog').waitFor({state:'detached'});
await p.goto('http://localhost:5177/',{waitUntil:'networkidle'});await p.waitForTimeout(2300);
const section=await p.locator('.burger-assembly').evaluate(e=>({top:e.offsetTop,travel:e.offsetHeight-innerHeight}));
for(const progress of [0,.5,1]){await p.evaluate(y=>scrollTo(0,y),section.top+section.travel*progress);await p.waitForTimeout(1500);await p.screenshot({path:`output/menu-rebuild/assembly-${progress}.jpg`});}
await p.locator('.burger-encore').scrollIntoViewIfNeeded();await p.waitForTimeout(1500);await p.screenshot({path:'output/menu-rebuild/footer-desktop.jpg'});
await p.setViewportSize({width:390,height:844});await p.goto('http://localhost:5177/',{waitUntil:'networkidle'});await p.waitForTimeout(2300);const phone=await p.locator('.burger-assembly').evaluate(e=>({top:e.offsetTop,travel:e.offsetHeight-innerHeight}));
for(const progress of [0,.5,1]){await p.evaluate(y=>scrollTo(0,y),phone.top+phone.travel*progress);await p.waitForTimeout(1500);await p.screenshot({path:`output/menu-rebuild/assembly-mobile-${progress}.jpg`});}
await p.goto('http://localhost:5177/menu',{waitUntil:'networkidle'});await p.waitForTimeout(1500);await p.locator('.menu-card').first().scrollIntoViewIfNeeded();await p.waitForTimeout(700);await p.screenshot({path:'output/menu-rebuild/menu-mobile.jpg'});console.log(JSON.stringify({errors,section,phone}));await b.close();
