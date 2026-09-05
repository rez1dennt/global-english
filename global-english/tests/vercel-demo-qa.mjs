import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = join(root, 'vercel-demo', 'dist');
const mime = new Map([
    ['.css', 'text/css; charset=utf-8'], ['.html', 'text/html; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
    ['.png', 'image/png'], ['.svg', 'image/svg+xml'], ['.webp', 'image/webp'],
    ['.woff2', 'font/woff2'], ['.txt', 'text/plain; charset=utf-8'],
]);

await stat(join(dist, 'index.html'));

const server = createServer(async (request, response) => {
    try {
        if (!['GET', 'HEAD'].includes(request.method || 'GET')) {
            response.writeHead(405).end('Method not allowed');
            return;
        }
        const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
        const relative = pathname.replace(/^\/+/, '');
        let file = normalize(join(dist, relative));
        if (pathname.endsWith('/') || extname(file) === '') file = join(file, 'index.html');
        if (file !== dist && !file.startsWith(dist + sep)) {
            response.writeHead(403).end('Forbidden');
            return;
        }
        const body = await readFile(file);
        response.writeHead(200, { 'Content-Type': mime.get(extname(file)) || 'application/octet-stream' });
        response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
        response.writeHead(404).end('Not found');
    }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const base = `http://127.0.0.1:${address.port}`;
let browser;
try {
    browser = await chromium.launch({ headless: true });
} catch {
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true });
}
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
let postRequests = 0;
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('requestfailed', request => errors.push(`${request.url()} ${request.failure()?.errorText || 'failed'}`));
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
page.on('request', request => { if (request.method() === 'POST') postRequests += 1; });

try {
    for (const width of [1280, 768, 400, 360, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const route of ['/', '/privacy-policy/', '/data-consent/']) {
            errors.length = 0;
            const response = await page.goto(base + route, { waitUntil: 'networkidle' });
            assert.equal(response.status(), 200, `${route} at ${width}px`);
            await page.evaluate(() => document.fonts.ready);
            const state = await page.evaluate(() => ({
                h1: document.querySelectorAll('h1').length,
                noindex: document.querySelector('meta[name="robots"]')?.content,
                overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
                brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
                demo: document.documentElement.dataset.staticDemo,
            }));
            assert.equal(state.h1, 1);
            assert.equal(state.noindex, 'noindex, nofollow');
            assert.equal(state.overflow, false, `${route} overflows at ${width}px`);
            assert.deepEqual(state.brokenImages, []);
            assert.equal(state.demo, 'true');
            assert.deepEqual(errors, [], `${route} errors at ${width}px`);
            if (route === '/') {
                if (await page.locator('[data-cookie-essential]').isVisible()) await page.locator('[data-cookie-essential]').click();
                await page.locator('.hero [data-enrollment-modal-trigger]').click();
                await page.waitForFunction(() => document.querySelector('[data-enrollment-modal]').dataset.state === 'open');
                await page.waitForTimeout(350);
                const centered = await page.locator('[data-modal-dialog]').evaluate(el => {
                    const box = el.getBoundingClientRect();
                    return { x: box.x + box.width / 2, y: box.y + box.height / 2, width: innerWidth, height: innerHeight };
                });
                assert.ok(Math.abs(centered.x - centered.width / 2) <= 1, `Modal must be horizontally centered at ${width}px`);
                assert.ok(Math.abs(centered.y - centered.height / 2) <= 1, `Modal must be vertically centered at ${width}px`);
                if (width === 400 && process.env.GE_QA_SCREENSHOTS) {
                    await page.screenshot({ path: join(process.env.GE_QA_SCREENSHOTS, 'modal-centered-400.png') });
                }
                if (width === 320) {
                    await page.setViewportSize({ width, height: 480 });
                    const short = await page.locator('[data-modal-dialog]').boundingBox();
                    assert.ok(short.y >= 11 && short.y + short.height <= 469, 'Short-screen dialog must stay inside the viewport');
                    await page.locator('[data-form-source="modal"] [type="submit"]').scrollIntoViewIfNeeded();
                    assert.equal(await page.locator('[data-form-source="modal"] [type="submit"]').isVisible(), true);
                    await page.setViewportSize({ width, height: 1000 });
                }
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => document.querySelector('[data-enrollment-modal]').dataset.state === 'closed');
            }
        }
    }

    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.removeItem('globalEnglishCookieConsentV1'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-cookie-essential]').click();
    assert.equal(await page.evaluate(() => localStorage.getItem('globalEnglishCookieConsentV1')), 'necessary');
    await page.locator('[data-menu-toggle]').click();
    await page.waitForFunction(() => document.querySelector('[data-menu-panel]').dataset.state === 'open');
    assert.equal(await page.locator('[data-menu-toggle]').getAttribute('aria-expanded'), 'true');
    await page.locator('[data-menu-toggle]').click();
    await page.waitForFunction(() => document.querySelector('[data-menu-panel]').dataset.state === 'closed');

    const trigger = page.locator('.hero [data-enrollment-modal-trigger]');
    await trigger.click();
    await page.waitForFunction(() => document.querySelector('[data-enrollment-modal]').dataset.state === 'open');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'modal-trial-name');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-enrollment-modal]').dataset.state === 'closed');

    await page.locator('.price-disclosure__toggle').click();
    await page.waitForFunction(() => document.querySelector('.price-disclosure').dataset.state === 'open');
    assert.equal(await page.locator('.price-disclosure__toggle').getAttribute('aria-expanded'), 'true');

    const form = page.locator('[data-form-source="inline"]');
    await form.locator('[type="submit"]').click();
    assert.equal(await form.locator('[aria-invalid="true"]').count(), 3);
    await form.locator('[data-demo-name="name"]').fill('Анна');
    await form.locator('[data-demo-name="phone"]').fill('+79600643141');
    await form.locator('[name="consent"]').check();
    const postBefore = postRequests;
    await form.locator('[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('[data-form-source="inline"] [data-form-status]').textContent.includes('Онлайн-заявка пока недоступна'));
    assert.equal(postRequests, postBefore, 'Static demo must not send POST requests');
    assert.equal(await form.locator('[type="submit"]').isEnabled(), true);
    assert.match(await form.locator('[data-form-status]').innerText(), /\+7 \(960\) 064-31-41/);

    await trigger.click();
    await page.waitForFunction(() => document.querySelector('[data-enrollment-modal]').dataset.state === 'open');
    const modalForm = page.locator('[data-form-source="modal"]');
    await modalForm.locator('[data-demo-name="name"]').fill('Анна');
    await modalForm.locator('[data-demo-name="phone"]').fill('+79600643141');
    await modalForm.locator('[name="consent"]').check();
    const modalPostBefore = postRequests;
    await modalForm.locator('[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('[data-form-source="modal"] [data-form-status]').textContent.includes('Онлайн-заявка пока недоступна'));
    assert.equal(postRequests, modalPostBefore, 'Static modal form must not send POST requests');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-enrollment-modal]').dataset.state === 'closed');

    await page.locator('[data-cookie-settings]').click();
    await page.waitForFunction(() => document.querySelector('[data-cookie-banner]').dataset.state === 'open');
    await page.locator('[data-cookie-accept]').click();
    assert.equal(await page.evaluate(() => localStorage.getItem('globalEnglishCookieConsentV1')), 'all');
    assert.match(await fetch(base + '/robots.txt').then(response => response.text()), /Disallow:\s*\//);

    const nativeSubmit = await browser.newContext({ viewport: { width: 320, height: 900 } });
    const nativeSubmitPage = await nativeSubmit.newPage();
    const nativeSubmitLeaks = [];
    nativeSubmitPage.on('request', request => {
        const body = request.postData() || '';
        if (/Анна|79600643141|%D0%90%D0%BD%D0%BD%D0%B0/i.test(request.url() + body)) nativeSubmitLeaks.push(request.url());
    });
    await nativeSubmitPage.goto(base + '/', { waitUntil: 'load' });
    for (const source of ['inline', 'modal']) {
        const nativeForm = nativeSubmitPage.locator(`[data-form-source="${source}"]`);
        assert.equal(await nativeForm.locator('[data-demo-name="name"]').getAttribute('name'), null);
        assert.equal(await nativeForm.locator('[data-demo-name="phone"]').getAttribute('name'), null);
        await nativeForm.locator('[data-demo-name="name"]').evaluate(field => { field.value = 'Анна'; });
        await nativeForm.locator('[data-demo-name="phone"]').evaluate(field => { field.value = '+7 (960) 064-31-41'; });
        await nativeForm.evaluate(form => HTMLFormElement.prototype.submit.call(form));
        await nativeSubmitPage.waitForLoadState('load');
    }
    assert.deepEqual(nativeSubmitLeaks, []);
    await nativeSubmit.close();

    const noJavaScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    const noJavaScriptPage = await noJavaScript.newPage();
    const noJavaScriptLeaks = [];
    noJavaScriptPage.on('request', request => {
        const body = request.postData() || '';
        if (request.method() === 'POST' || /Анна|79600643141|%D0%90%D0%BD%D0%BD%D0%B0/i.test(request.url() + body)) noJavaScriptLeaks.push(request.url());
    });
    await noJavaScriptPage.goto(base + '/', { waitUntil: 'load' });
    assert.equal(await noJavaScriptPage.locator('.primary-nav').isVisible(), true);
    assert.equal(await noJavaScriptPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    for (const source of ['inline', 'modal']) {
        const noJavaScriptForm = noJavaScriptPage.locator(`[data-form-source="${source}"]`);
        assert.equal(await noJavaScriptForm.locator('[type="submit"]').isDisabled(), true);
        assert.equal(await noJavaScriptForm.locator('input[data-demo-name="name"]').getAttribute('name'), null);
        assert.equal(await noJavaScriptForm.locator('input[data-demo-name="phone"]').getAttribute('name'), null);
        await noJavaScriptForm.locator('input[data-demo-name="name"]').evaluate(field => { field.value = 'Анна'; });
        await noJavaScriptForm.locator('input[data-demo-name="phone"]').evaluate(field => { field.value = '+7 (960) 064-31-41'; });
        await noJavaScriptForm.evaluate(form => HTMLFormElement.prototype.submit.call(form));
        await noJavaScriptPage.waitForLoadState('load');
    }
    await noJavaScriptPage.waitForTimeout(200);
    assert.deepEqual(noJavaScriptLeaks, []);
    await noJavaScript.close();

    const blockedScript = await browser.newContext({ viewport: { width: 320, height: 900 } });
    await blockedScript.route('**/demo-form.js', route => route.abort());
    const blockedScriptPage = await blockedScript.newPage();
    const blockedLeaks = [];
    const blockedErrors = [];
    blockedScriptPage.on('pageerror', error => blockedErrors.push(error.message));
    blockedScriptPage.on('request', request => {
        const body = request.postData() || '';
        if (request.method() === 'POST' || /Анна|79600643141|%D0%90%D0%BD%D0%BD%D0%B0/i.test(request.url() + body)) blockedLeaks.push(request.url());
    });
    await blockedScriptPage.goto(base + '/', { waitUntil: 'load' });
    await blockedScriptPage.locator('.price-disclosure__toggle').click();
    await blockedScriptPage.waitForFunction(() => document.querySelector('.price-disclosure').dataset.state === 'open');
    assert.ok(await blockedScriptPage.locator('[data-revealed="true"]').count() > 0);
    for (const source of ['inline', 'modal']) {
        const blockedForm = blockedScriptPage.locator(`[data-form-source="${source}"]`);
        assert.equal(await blockedForm.locator('[type="submit"]').isDisabled(), true);
        assert.equal(await blockedForm.locator('input[data-demo-name="name"]').getAttribute('name'), null);
        assert.equal(await blockedForm.locator('input[data-demo-name="phone"]').getAttribute('name'), null);
        await blockedForm.locator('input[data-demo-name="name"]').evaluate(field => { field.value = 'Анна'; });
        await blockedForm.locator('input[data-demo-name="phone"]').evaluate(field => { field.value = '+7 (960) 064-31-41'; });
        await blockedForm.evaluate(form => HTMLFormElement.prototype.submit.call(form));
        await blockedScriptPage.waitForLoadState('load');
    }
    assert.deepEqual(blockedLeaks, []);
    assert.deepEqual(blockedErrors, []);
    await blockedScript.close();
    assert.deepEqual(errors, []);
    console.log('VERCEL DEMO QA: PASS (3 routes, 5 viewports, centered modal, short screen, interactions, Cookie, no-JS, zero POST requests)');
} finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
}
