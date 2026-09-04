import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page=readFileSync(new URL('../front-page.php',import.meta.url),'utf8');
test('school sequence uses four supplied images and three arrow connectors',()=>{
    assert.match(page,/class="school-steps"/);
    for(let i=1;i<=4;i++) assert.ok(page.includes('school-'+i+'.png'));
    assert.equal((page.match(/class="school-step__arrow"/g)||[]).length,3);
});
test('unrequested hero caption and former city band are removed',()=>{
    assert.ok(!page.includes('hero-caption'));
    assert.ok(!page.includes('class="city-band"'));
    assert.ok(!page.includes('learning-path'));
});
test('school section uses the client copy and enrollment action',()=>{
    assert.ok(page.includes('Наши занятия проходят'));
    assert.ok(page.includes('Занятия для детей от 7 до 17 лет'));
    assert.ok(page.includes('Не нужно тратить время на дорогу для получения знаний по английскому и китайскому языку'));
    const about=page.slice(page.indexOf('id="about"'),page.indexOf('id="benefits"'));
    assert.match(about,/data-enrollment-modal-trigger/);
    assert.ok(!about.includes('A-Z'));
});
