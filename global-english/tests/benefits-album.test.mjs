import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('benefits use illustrated album sheets with optional school photography',()=>{
    const front=read('front-page.php');
    assert.ok(front.includes('benefit-card__sheet'));
    assert.ok(front.includes('benefit-scenes.svg'));
    assert.ok(front.includes("$config['benefit_photos']"));
    assert.ok(existsSync(new URL('../assets/icons/benefit-scenes.svg',import.meta.url)));
});
test('album retains exactly the approved eight titles without explanation paragraphs',()=>{
    const front=read('front-page.php');
    const grid=front.slice(front.indexOf('<div class="benefit-grid"'),front.indexOf('id="teachers"'));
    assert.ok(!grid.includes('<p>'));
    assert.ok(!grid.includes('Система пропусков'));
    assert.ok(front.includes('Дополнительные видеоуроки занятий'));
});
