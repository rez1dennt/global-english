import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.GE_PREVIEW_URL || 'http://127.0.0.1:8767/global-english/tests/preview.php';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
try {
    for (const [width, height] of [[320, 640], [360, 740], [768, 900], [844, 390]]) {
        const context = await browser.newContext({ viewport: { width, height }, hasTouch: true });
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base, { waitUntil: 'networkidle' });
        await page.locator('[data-cookie-essential]').click();
        await page.evaluate(() => scrollTo({ top: 420, behavior: 'instant' }));
        const toggle = page.locator('[data-menu-toggle]');
        const panel = page.locator('[data-menu-panel]');
        const before = await toggle.boundingBox();
        const scrollBefore = await page.evaluate(() => scrollY);
        await toggle.tap();
        await page.waitForTimeout(400);
        // The old outside-pointer handler closes the dropdown on this touch.
        await page.touchscreen.tap(width - 4, height - 8);
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Touching the lower screen must keep the menu open');
        const box = await panel.boundingBox();
        assert.ok(Math.abs(box.y + box.height - height) <= 1, 'Menu must cover the viewport below the header');
        assert.ok(Math.abs(box.width - width) <= 1);
        assert.deepEqual(await toggle.boundingBox(), before, 'Cross must stay in the burger position');
        await toggle.focus();
        await page.keyboard.press('Shift+Tab');
        assert.equal(await panel.evaluate(el => el.contains(document.activeElement)), true);
        await page.keyboard.press('Tab');
        assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
        await page.setViewportSize({ width, height: height - 50 });
        await page.waitForTimeout(100);
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Mobile browser height changes must not dismiss navigation');
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Only the cross dismisses mobile navigation');
        await page.mouse.wheel(0, 300);
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        await toggle.tap();
        assert.equal(await panel.getAttribute('data-state'), 'closing');
        assert.equal(await page.locator('body').evaluate(el => el.classList.contains('menu-open')), true, 'Keep background locked through closing animation');
        await page.waitForFunction(() => document.querySelector('[data-menu-panel]').dataset.state === 'closed');
        assert.ok(Math.abs(await page.evaluate(() => scrollY) - scrollBefore) <= 1);
        await toggle.tap();
        await page.waitForTimeout(350);
        await panel.locator('a[href="#teachers"]').tap();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true', 'Selecting a section keeps the menu open until cross');
        await toggle.tap();
        await page.waitForFunction(() => document.querySelector('[data-menu-panel]').dataset.state === 'closed');
        await page.waitForTimeout(700);
        assert.ok(await page.locator('#teachers').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 180), 'Selected section must be reached after cross');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await toggle.tap();
        await page.waitForTimeout(50);
        await toggle.tap();
        await page.waitForFunction(() => document.querySelector('[data-menu-panel]').dataset.state === 'closed');
        assert.equal(await page.locator('body').evaluate(el => el.classList.contains('menu-open')), false);
        if (width === 320 || width === 768) {
            await toggle.tap();
            await mkdir('docs/source-review/redesign-qa', { recursive: true });
            await page.screenshot({ path: `docs/source-review/redesign-qa/mobile-menu-fullscreen-${width}.png` });
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.evaluate(() => {
            const button = document.querySelector('[data-menu-toggle]');
            if (button.getAttribute('aria-expanded') !== 'true') button.click();
            button.click(); button.click(); button.click();
        });
        await page.waitForFunction(() => document.querySelector('[data-menu-panel]').dataset.state === 'closed');
        assert.equal(await page.locator('body').evaluate(el => el.classList.contains('menu-open')), false, 'Rapid toggling must release the scroll lock');
        await toggle.tap();
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.waitForTimeout(100);
        assert.equal(await page.locator('body').evaluate(el => el.classList.contains('menu-open')), false);
        assert.equal(await page.locator('main').evaluate(el => el.inert), false);
        await context.close();
        console.log(`${width}x${height}: touch, full-screen, cross, scroll, selection, reduced motion PASS`);
    }
    assert.deepEqual(errors, []);
} finally {
    await browser.close();
}
