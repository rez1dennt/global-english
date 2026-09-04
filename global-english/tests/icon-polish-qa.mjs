import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel:'chrome', headless:true });
const page = await browser.newPage();
const issues = [];
const check = (ok, text) => { if (!ok) issues.push(text); };
const luminance = rgb => rgb.match(/\d+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
try {
    for (const width of [1440,1280,1024,768,360,320]) {
        await page.setViewportSize({width,height:900});
        await page.goto('http://127.0.0.1:8765/global-english/tests/preview.php?icons=1',{waitUntil:'networkidle'});
        const state = await page.evaluate(()=>({
            colors:[...document.querySelectorAll('.path-step__icon,.benefit-card__icon')].map(el=>getComputedStyle(el).color),
            backgrounds:[...document.querySelectorAll('.path-step__icon,.benefit-card__icon')].map(el=>getComputedStyle(el).backgroundColor),
            callback:getComputedStyle(document.querySelector('.site-header__actions .button')).color,
            callbackBackground:getComputedStyle(document.querySelector('.site-header__actions .button')).backgroundColor,
            headerCount:document.querySelectorAll('.site-header .messenger-icon').length,
            footerCount:document.querySelectorAll('.site-footer .messenger-icon').length,
            overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
            broken:[...document.images].filter(img=>!img.complete||!img.naturalWidth).length
        }));
        check(state.colors.length===8 && new Set(state.colors).size===1, width+': all eight benefit icon colors must match');
        check(new Set(state.backgrounds).size===1,width+': icon backgrounds must match');
        check(state.callback==='rgb(255, 255, 255)',width+': callback text must be white');
        const ratio=(Math.max(luminance(state.callback),luminance(state.callbackBackground))+.05)/(Math.min(luminance(state.callback),luminance(state.callbackBackground))+.05);
        check(ratio>=4.5,width+': callback contrast must be at least 4.5');
        check(state.headerCount===4 && state.footerCount===2,width+': MAX and Telegram in desktop/mobile header and footer');
        check(!state.overflow && !state.broken,width+': no overflow or broken assets');
        if (width<=960 && state.headerCount) {
            await page.locator('[data-menu-toggle]').click();
            await page.waitForTimeout(350);
            check(await page.locator('.messenger-group--mobile').isVisible(),width+': messengers visible inside open burger');
            await page.keyboard.press('Escape');
        }
        console.log(width+'px measured');
    }
    assert.deepEqual(issues,[]);
    console.log('ICON POLISH QA: PASS');
} finally { await browser.close(); }
