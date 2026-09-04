import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.GE_PREVIEW_URL || 'http://127.0.0.1:8765/global-english/tests/preview.php';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text() + ' ' + (m.location().url || '')); });
page.on('requestfailed', request => { console.log('Request failed:', request.url(), request.failure()?.errorText); });
const screenshotDir = process.env.GE_QA_SCREENSHOTS;
if (screenshotDir) mkdirSync(screenshotDir, { recursive: true });
const sleep = ms => page.waitForTimeout(ms);
async function load(url = base) {
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, url);
    await page.evaluate(() => document.fonts.ready);
}
async function geometry() {
    return page.evaluate(() => {
        const header = document.querySelector('[data-site-header]').getBoundingClientRect();
        const root = document.documentElement;
        return { width: innerWidth, client: root.clientWidth, scroll: root.scrollWidth, top: header.top, right: header.right, left: header.left,
            h1: document.querySelectorAll('h1').length, images: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) };
    });
}
try {
    for (const width of [1440,1280,1024,768,360,320]) {
        await page.setViewportSize({ width, height: 1000 });
        await load(base + '?qa=' + width);
        const result = await geometry();
        assert.ok(result.scroll <= result.client + 1, JSON.stringify(result));
        assert.equal(result.top, 0); assert.equal(result.left, 0);
        assert.equal(result.right, result.client); assert.equal(result.h1, 1);
        assert.deepEqual(result.images, []);
        assert.equal(await page.locator('.benefit-card').count(), 8);
        assert.equal(await page.locator('.school-step').count(), 4);
        assert.equal(await page.locator('.school-step__arrow').count(), 3);
        assert.equal(await page.locator('.city-band,.hero-caption,.learning-path,.preview-note').count(), 0);
        assert.equal(await page.locator('.branch-card').count(), 4);
        assert.equal(await page.locator('[data-trial-form]').count(), 2);
        assert.equal(await page.locator('select').count(), 0);
        const ids = await page.locator('[id]').evaluateAll(els => els.map(el => el.id));
        assert.equal(ids.length, new Set(ids).size, 'Duplicate IDs');
        const priceCtaBox = await page.locator('.price-card > .button').boundingBox();
        assert.ok(priceCtaBox, 'Price CTA is missing');
        if (width <= 360) {
            assert.ok(priceCtaBox.width <= 210, `Mobile price CTA is too wide: ${priceCtaBox.width}px at ${width}px`);
            assert.ok(priceCtaBox.height >= 48 && priceCtaBox.height <= 60, `Mobile price CTA height is ${priceCtaBox.height}px at ${width}px`);
        }
        if (width >= 768) assert.ok(priceCtaBox.width > 210, `Desktop price CTA unexpectedly compact at ${width}px`);
        const allSections = ['home','about','benefits','teachers','reviews','prices','branches','contacts'];
        for(const id of allSections) assert.equal(await page.locator('#' + id).count(), 1);
        if (screenshotDir) {
            for (const id of allSections) { await page.locator('#' + id).scrollIntoViewIfNeeded(); await sleep(100); }
            await sleep(800);
            await page.evaluate(() => scrollTo({ top:0, behavior:'instant' }));
            await page.screenshot({ path:join(screenshotDir, 'home-' + width + '.png'), fullPage:true });
        }
        console.log(width + 'px homepage: PASS');
        for (const route of ['privacy-policy','data-consent']) {
            await load(base + '?page=' + route);
            const legal = await geometry();
            assert.ok(legal.scroll <= legal.client + 1, route + ' overflow at ' + width);
            assert.equal(legal.h1,1); assert.deepEqual(legal.images,[]);
            assert.ok(await page.locator('.legal-draft-note').isVisible());
        }
        console.log(width + 'px privacy + consent: PASS');
    }
    await page.setViewportSize({ width:900,height:900 });
    await load();
    await page.evaluate(() => scrollTo({ top:420,behavior:'instant' }));
    const beforeMenu = await page.evaluate(() => ({ y:scrollY, x:document.querySelector('.brand').getBoundingClientRect().left }));
    await page.locator('[data-menu-toggle]').click();
    await sleep(340);
    assert.equal(await page.locator('[data-menu-toggle]').getAttribute('aria-expanded'),'true');
    assert.equal(await page.locator('[data-menu-panel]').getAttribute('data-state'),'open');
    const afterMenu = await page.evaluate(() => ({ x:document.querySelector('.brand').getBoundingClientRect().left, top:document.querySelector('[data-site-header]').getBoundingClientRect().top }));
    assert.ok(Math.abs(beforeMenu.x-afterMenu.x)<=1); assert.equal(afterMenu.top,0);
    await page.keyboard.press('Escape'); await sleep(420);
    assert.equal(await page.locator('[data-menu-panel]').getAttribute('data-state'),'closed');
    assert.ok(Math.abs((await page.evaluate(()=>scrollY))-beforeMenu.y)<=1);
    assert.equal(await page.locator('[data-menu-toggle]').evaluate(e=>e===document.activeElement),true);
    console.log('burger geometry + Escape + focus: PASS');

    await page.setViewportSize({width:1280,height:1000});
    await load();
    if(await page.locator('[data-cookie-essential]').isVisible()) await page.locator('[data-cookie-essential]').click();
    const triggers = page.locator('[data-enrollment-modal-trigger]');
    assert.equal(await triggers.count(),4);
    for(let i=0;i<4;i++){
        const trigger=triggers.nth(i);
        await trigger.scrollIntoViewIfNeeded(); await sleep(350);
        const before=await page.evaluate(()=>scrollY);
        await trigger.click(); await sleep(350);
        assert.equal(await page.locator('[data-enrollment-modal]').getAttribute('data-state'),'open');
        assert.equal(await page.evaluate(()=>document.activeElement.id),'modal-trial-name');
        assert.equal(await page.locator('main').evaluate(e=>e.inert),true);
        await page.locator('[data-modal-close]').focus();
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.evaluate(()=>document.activeElement.type),'submit');
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('[data-modal-close]').evaluate(e=>e===document.activeElement),true);
        await page.keyboard.press('Escape'); await sleep(420);
        assert.equal(await page.locator('[data-enrollment-modal]').getAttribute('data-state'),'closed');
        assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
        assert.ok(Math.abs((await page.evaluate(()=>scrollY))-before)<=1,'Modal scroll restore');
    }
    console.log('four CTA + modal focus trap + scroll restore: PASS');
    await triggers.nth(1).click(); await sleep(350);
    await page.locator('[data-modal-backdrop]').click({position:{x:2,y:2}}); await sleep(420);
    assert.equal(await page.locator('[data-enrollment-modal]').getAttribute('data-state'),'closed');
    for(const source of ['modal','inline']){
        if(source==='modal') { await page.locator('.hero [data-enrollment-modal-trigger]').click(); await sleep(350); }
        const form=page.locator('[data-form-source="' + source + '"]');
        await form.locator('[type=submit]').click();
        assert.equal(await form.locator('[aria-invalid=true]').count(),3,'Required form fields');
        await form.locator('[name=name]').fill('Анна');
        await form.locator('[name=phone]').fill('+79600643141');
        assert.equal(await form.locator('[name=phone]').inputValue(),'+7 (960) 064-31-41');
        await form.locator('[name=consent]').check();
        await Promise.all([page.waitForURL(url=>url.searchParams.get('form_status')==='mail_error'&&url.searchParams.get('form_source')===source),form.locator('[type=submit]').click()]);
        await page.waitForLoadState('networkidle'); await sleep(350);
        assert.match(await page.locator('[data-form-source="' + source + '"] [data-form-status]').innerText(),/Не удалось отправить заявку/);
        if(source==='modal'){ assert.equal(await page.locator('[data-enrollment-modal]').getAttribute('data-state'),'open'); await page.locator('[data-modal-close]').click();await sleep(420); }
    }
    console.log('two forms required validation + mask + preview POST: PASS (no email sent)');
    await page.locator('.price-disclosure__toggle').click();
    await page.waitForFunction(()=>document.querySelector('.price-disclosure').dataset.state==='open');
    assert.equal(await page.locator('.price-disclosure__toggle').getAttribute('aria-expanded'),'true');
    assert.match(await page.locator('.price-disclosure').innerText(),/ещё не добавлен/);
    await page.locator('.price-disclosure__toggle').click();
    console.log('honest price-list disclosure: PASS');

    await page.evaluate(()=>localStorage.removeItem('globalEnglishCookieConsentV1'));
    await load();
    await page.locator('[data-cookie-essential]').click(); await sleep(350);
    assert.equal(await page.evaluate(()=>localStorage.getItem('globalEnglishCookieConsentV1')),'necessary');
    await page.locator('[data-cookie-settings]').click(); await sleep(100);
    assert.equal(await page.locator('[data-cookie-banner]').getAttribute('data-state'),'open');
    await page.locator('[data-cookie-accept]').click(); await sleep(350);
    assert.equal(await page.evaluate(()=>localStorage.getItem('globalEnglishCookieConsentV1')),'all');
    console.log('cookie necessary + reopen + accept: PASS');

    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('.hero [data-enrollment-modal-trigger]').click(); await sleep(100);
    assert.equal(await page.locator('[data-enrollment-modal]').getAttribute('data-state'),'open');
    assert.equal(await page.locator('[data-modal-dialog]').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
    await page.keyboard.press('Escape'); await sleep(420);
    assert.equal(await page.locator('[data-enrollment-modal]').getAttribute('data-state'),'closed');
    console.log('reduced motion: PASS');
    assert.deepEqual(errors,[],'Browser console/page errors');
    const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});
    const nojsPage=await nojs.newPage(); await nojsPage.goto(base);
    assert.ok(await nojsPage.locator('.primary-nav').isVisible());
    const nojsOverflow=await nojsPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(nojsOverflow,false);
    await nojs.close();
    console.log('320px no-JavaScript navigation: PASS');
    console.log('BROWSER QA 2.0: PASS');
} finally { await browser.close(); }
