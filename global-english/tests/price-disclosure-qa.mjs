import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const url='http://127.0.0.1:8765/global-english/tests/preview.php?price=qa#prices';
try{
 for(const width of [1440,768,360,320]){
  await page.setViewportSize({width,height:900});await page.goto(url+'&width='+width,{waitUntil:'networkidle'});
  const d=page.locator('[data-price-disclosure]'),toggle=d.locator('.price-disclosure__toggle'),content=d.locator('[data-disclosure-content]'),left=page.locator('.price-layout>div').first();
  await d.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
  const baseTop=(await left.boundingBox()).y,baseX=(await toggle.boundingBox()).x;
  await toggle.click();await page.waitForTimeout(140);const middleOpen=(await content.boundingBox()).height;
  await page.waitForTimeout(420);const openHeight=(await content.boundingBox()).height;
  assert.ok(middleOpen>0&&middleOpen<openHeight,width+'px opening must interpolate');
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  assert.ok(Math.abs((await left.boundingBox()).y-baseTop)<.25,width+'px left column moved');
  assert.ok(Math.abs((await toggle.boundingBox()).x-baseX)<.25,width+'px toggle moved sideways');
  await toggle.click();await page.waitForTimeout(140);const middleClose=(await content.boundingBox()).height;
  assert.ok(middleClose>0&&middleClose<openHeight,width+'px closing must interpolate');
  await page.waitForTimeout(420);assert.ok((await content.boundingBox()).height<.25);
  assert.equal(await d.getAttribute('data-state'),'closed');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  await toggle.focus();await toggle.click();await page.waitForTimeout(500);await page.keyboard.press('Escape');await page.waitForTimeout(500);
  assert.equal(await d.getAttribute('data-state'),'closed');assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('price-disclosure__toggle')),true);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
  console.log(width+'px stable column + reversible animation + Escape: PASS');
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url+'&reduce=1',{waitUntil:'networkidle'});const d=page.locator('[data-price-disclosure]'),toggle=d.locator('.price-disclosure__toggle');await toggle.click();assert.equal(await d.getAttribute('data-state'),'open');await toggle.click();assert.equal(await d.getAttribute('data-state'),'closed');
 console.log('reduced motion: PASS');
}finally{await browser.close();}
