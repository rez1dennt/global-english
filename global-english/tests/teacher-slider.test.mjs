import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('photo-only teacher carousel precedes the director',()=>{
 const front=read('front-page.php');
 const carousel=front.indexOf('data-teacher-slider'),director=front.indexOf('class="director-contact"');
 assert.ok(carousel>0&&carousel<director);
 assert.ok(front.includes('teacher-placeholder'));
 assert.ok(!front.includes('class="team-gallery"'));
});
test('carousel supports loop, keyboard, touch and reduced motion',()=>{
 const js=read('assets/js/main.js');
 for(const token of ['data-slider-clone','pointerdown','pointerup','ArrowLeft','ArrowRight','prefers-reduced-motion'])assert.ok(js.includes(token),token);
 assert.ok(!js.includes('previous.disabled = track.scrollLeft'));
});
