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
        const cookie = page.locator('[data-cookie-banner]');
        const menuButton = page.locator('[data-menu-toggle]');
        for (const choice of ['all', 'necessary']) {
            if (choice === 'necessary') await page.locator('[data-cookie-settings]').click();
            await menuButton.tap();
            await page.waitForTimeout(400);
            assert.equal(await cookie.evaluate(el => el.inert), false, 'Cookie banner must remain interactive above the menu');
            const accept = cookie.locator('[data-cookie-accept]');
            assert.equal(await accept.evaluate(el => {
                const box = el.getBoundingClientRect();
                return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
            }), true, 'Accept must be above the menu and receive touches');
            await menuButton.focus();
            await page.keyboard.press('Shift+Tab');
            assert.equal(await accept.evaluate(el => el === document.activeElement), true, 'Keyboard loop must include cookie buttons');
            await page.keyboard.press('Tab');
            assert.equal(await menuButton.evaluate(el => el === document.activeElement), true);
            await page.keyboard.press('Tab');
            assert.equal(await page.locator('[data-menu-panel] a').first().evaluate(el => el === document.activeElement), true);
            await accept.focus();
            if (width === 320 && choice === 'all') {
                await mkdir('docs/source-review/redesign-qa', { recursive: true });
                await page.screenshot({ path: 'docs/source-review/redesign-qa/cookie-over-menu-320.png' });
            }
            if (choice === 'all') await page.keyboard.press('Enter');
            else await cookie.locator('[data-cookie-essential]').tap();
            await page.waitForFunction(() => document.querySelector('[data-cookie-banner]').dataset.state === 'closed');
            assert.equal(await page.evaluate(() => localStorage.getItem('globalEnglishCookieConsentV1')), choice);
            assert.equal(await menuButton.getAttribute('aria-expanded'), 'true', 'Cookie choice must not close navigation');
            assert.equal(await page.locator('body').evaluate(el => el.classList.contains('menu-open')), true);
            assert.equal(await cookie.evaluate(el => el.contains(document.activeElement)), false, 'Focus must leave the dismissed banner');
            await menuButton.tap();
            await page.waitForFunction(() => document.querySelector('[data-menu-panel]').dataset.state === 'closed');
            assert.equal(await cookie.evaluate(el => el.inert), true, 'Closing menu must not reactivate dismissed cookie banner');
        }
        await page.evaluate(() => localStorage.removeItem('globalEnglishCookieConsentV1'));
        await page.reload({ waitUntil: 'networkidle' });
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
        for (const section of ['about', 'reviews', 'prices', 'teachers']) {
            await toggle.tap();
            await page.waitForTimeout(350);
            await panel.locator(`a[href="#${section}"]`).tap();
            assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Selecting a section must close the menu without a second tap');
            await page.waitForFunction(() => document.querySelector('[data-menu-panel]').dataset.state === 'closed');
            assert.equal(await page.locator('body').evaluate(el => el.classList.contains('menu-open')), false);
            const position = await page.locator(`#${section}`).evaluate(el => ({
                top: el.getBoundingClientRect().top,
                header: document.querySelector('[data-site-header]').getBoundingClientRect().bottom,
                focused: document.activeElement === el,
            }));
            assert.ok(position.top >= position.header - 1 && position.top < position.header + 100, `${section} must be visible below the header`);
            assert.equal(position.focused, true, 'Keyboard focus must follow navigation to the section');
        }
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
