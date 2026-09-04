import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage();
try {
    for (const width of [1440,1280,1024,768,640,360,320]) {
        await page.setViewportSize({width,height:900});
        await page.goto('http://127.0.0.1:8765/global-english/tests/preview.php?hero=live',{waitUntil:'networkidle'});
        const heading=page.locator('#hero-title');
        assert.ok(await heading.isVisible(),'The hero title must be visible HTML, not sr-only');
        assert.equal(await heading.locator('span').count(),2,'GLOBAL ENGLISH is two real text lines');
        assert.match(await heading.innerText(),/GLOBAL\s+ENGLISH/);
        assert.ok(!(await heading.getAttribute('class')||'').includes('sr-only'));
        assert.equal(await page.locator('.hero-banner__picture,.hero-banner__phone').count(),0,'No flattened banner or invisible phone hotspot');
        const phone=page.locator('.hero-phone');
        assert.equal(await phone.getAttribute('href'),'tel:+79600643141');
        assert.match(await phone.innerText(),/960.*064-31-41/);
        const image=page.locator('.hero-scene__background');
        assert.equal(await image.count(),1,'Only the background is a raster asset');
        assert.ok((await image.getAttribute('src')).includes('hero-scene-clean.webp'));
        assert.ok(await image.evaluate(img=>img.complete&&img.naturalWidth>0));
        const boxes=await page.evaluate(()=>{
            const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};};
            return {title:rect('#hero-title'),offer:rect('.hero-offer'),phone:rect('.hero-phone'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};
        });
        assert.ok(!boxes.overflow);
        for(const box of [boxes.title,boxes.offer,boxes.phone]) assert.ok(box.x>=0&&box.right<=width);
        assert.ok(boxes.title.right<=boxes.offer.x||boxes.title.bottom<=boxes.offer.y||boxes.offer.bottom<=boxes.title.y,'No overlap between live title and offer');
        const cookie=page.getByRole('button',{name:'Только необходимые'});if(await cookie.isVisible())await cookie.click();
        await page.locator('.hero [data-enrollment-modal-trigger]').click();
        await page.waitForTimeout(400);
        assert.equal(await page.locator('#enrollment-modal').getAttribute('aria-hidden'),'false');
        await page.keyboard.press('Escape');
        console.log(width+'px live title + visible phone + clean background + enrollment: PASS');
    }
} finally { await browser.close(); }
