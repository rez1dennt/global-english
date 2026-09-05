import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=process.env.GE_PREVIEW_URL || 'http://127.0.0.1:8765/global-english/tests/preview.php?teachers=208#teachers';
const slider=page.locator('[data-teacher-slider]');
const index=async()=>Number(await slider.getAttribute('data-index'));
async function idle(){await page.waitForFunction(()=>document.querySelector('[data-teacher-slider]').dataset.moving==='false');}
try{
 for(const width of [1440,768,360,320]){
  await page.setViewportSize({width,height:1000});await page.goto(url.replace('#teachers','&width='+width+'#teachers'),{waitUntil:'networkidle'});
  assert.equal(await index(),0,'New page starts at the first teacher slot');
  const cookie=page.getByRole('button',{name:'Только необходимые'});if(await cookie.isVisible())await cookie.click();
  await slider.scrollIntoViewIfNeeded();
  assert.equal(await slider.locator('.teacher-card:not([data-slider-clone])').count(),6);
  assert.equal(await slider.locator('[data-slider-clone]').count(),12);
  assert.equal(await slider.locator('[data-slider-clone]:not([aria-hidden=true])').count(),0);
  assert.ok(await page.evaluate(()=>document.querySelector('[data-teacher-slider]').getBoundingClientRect().bottom<document.querySelector('.director-contact').getBoundingClientRect().top));
  const start = await slider.evaluate(async el => {
   const track = el.querySelector('[data-slider-track]');
   const step = track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
   const before = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
   el.querySelector('[data-slider-next]').click();
   await new Promise(resolve => setTimeout(resolve, 100));
   return Math.abs(new DOMMatrixReadOnly(getComputedStyle(track).transform).m41 - before) / step;
  });
  assert.ok(start > 0 && start < .25, `Slider should ease into motion, not cover ${Math.round(start * 100)}% of a card in the first 100ms`);
  await idle(); await slider.locator('[data-slider-prev]').click(); await idle();
  for(let i=0;i<8;i++){
   await slider.locator('[data-slider-next]').click();await idle();assert.equal(await index(),(i+1)%6);
   assert.ok(await slider.locator('[data-slider-prev]').isEnabled());assert.ok(await slider.locator('[data-slider-next]').isEnabled());
  }
  for(let i=0;i<9;i++){await slider.locator('[data-slider-prev]').click();await idle();assert.equal(await index(),((2-i-1)%6+6)%6);}
  await slider.locator('[data-slider-viewport]').focus();await page.keyboard.press('ArrowRight');await idle();assert.equal(await index(),0);
  const b=await slider.locator('[data-slider-viewport]').boundingBox();
  await page.mouse.move(b.x+b.width*.8,b.y+b.height*.5);await page.mouse.down();await page.mouse.move(b.x+b.width*.2,b.y+b.height*.5,{steps:8});await page.mouse.up();await idle();assert.equal(await index(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth));
  console.log(width+'px forward/backward loops, keyboard, drag, order: PASS');
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});await slider.locator('[data-slider-prev]').click();await idle();assert.equal(await index(),5);
 assert.equal(await slider.locator('[data-slider-track]').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 await page.setViewportSize({width:1280,height:1000});await page.waitForTimeout(150);assert.equal(await index(),5);
 assert.deepEqual(errors,[]);console.log('reduced motion + resize + console: PASS');
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});const plain=await context.newPage();await plain.goto(url,{waitUntil:'networkidle'});
 assert.equal(await plain.locator('.teacher-card').count(),6);assert.equal(await plain.locator('.teacher-slider__controls').isVisible(),false);await context.close();
 console.log('no-JavaScript horizontal gallery: PASS');
}finally{await browser.close();}
