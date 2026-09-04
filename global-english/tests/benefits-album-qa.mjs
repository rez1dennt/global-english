import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
 for(const width of [1440,1280,1024,768,512,360,320]){
  await page.setViewportSize({width,height:1100});await page.goto('http://127.0.0.1:8765/global-english/tests/preview.php?album=1#benefits',{waitUntil:'networkidle'});
  await page.locator('.benefit-card').last().scrollIntoViewIfNeeded();await page.waitForTimeout(850);
  assert.equal(await page.locator('.benefit-card').count(),8);
  assert.equal(await page.locator('.benefit-card p').count(),0);
  assert.equal(await page.locator('.benefit-card__icon use').count(),8);
  const bad=await page.locator('.benefit-card h3').evaluateAll(els=>els.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent));
  assert.deepEqual(bad,[],width+'px title overflow');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
  console.log(width+'px album: PASS');
 }
 await page.setViewportSize({width:1440,height:1100});await page.goto('http://127.0.0.1:8765/global-english/tests/preview.php?album=1#benefits',{waitUntil:'networkidle'});
 const card=page.locator('.benefit-card').first(),sheet=card.locator('.benefit-card__sheet');await card.scrollIntoViewIfNeeded();await page.waitForTimeout(800);
 const before=await card.boundingBox();await card.hover();await page.waitForTimeout(350);const after=await card.boundingBox();assert.equal(after.width,before.width);assert.equal(after.height,before.height);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await card.scrollIntoViewIfNeeded();await card.hover();
 assert.equal(await sheet.evaluate(e=>getComputedStyle(e).transform),'none');
 assert.deepEqual(errors,[]);
 console.log('hover geometry + reduced motion + console: PASS');
}finally{await browser.close();}
