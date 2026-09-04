import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
test('price details use controlled reversible disclosure markup',()=>{
 const front=read('front-page.php'),js=read('assets/js/main.js');
 assert.ok(front.includes('price-disclosure__toggle'));
 assert.ok(!front.includes('<details class="price-disclosure"'));
 for(const token of ['data-price-disclosure','data-disclosure-content','data-disclosure-inner'])assert.ok(front.includes(token),token);
 for(const token of ['initPriceDisclosure','details.dataset.state','transitionend','Escape'])assert.ok(js.includes(token),token);
});
test('price columns stay top-aligned while details change height',()=>{
 const css=read('assets/css/main.css');
 assert.match(css,/\.price-layout\s*\{[^}]*align-items:\s*start/);
 assert.ok(css.includes('grid-template-rows'));
 assert.ok(css.includes('--motion-disclosure'));
});
