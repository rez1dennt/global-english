import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const front=readFileSync(new URL('../front-page.php',import.meta.url),'utf8');
test('director is a personal contact card below the teacher slider',()=>{
 const slider=front.indexOf('data-teacher-slider'),card=front.indexOf('director-contact');
 assert.ok(slider>0&&card>slider);
 for(const token of ['director-contact__identity','director-contact__panel','director-contact__avatar','director-contact__wordmark'])assert.ok(front.includes(token),token);
});
test('verified director facts and direct Telegram action remain intact',()=>{
 const start=front.indexOf('director-contact'),end=front.indexOf('id="reviews"');const card=front.slice(start,end);
 for(const fact of ['Борисова','Глория Гариевна','14','Руководитель Школы Global English','global_english_director_url()'])assert.ok(card.includes(fact),fact);
 assert.ok(card.includes("$config['director_photo']"));
 assert.ok(!card.includes('director__portrait-note'));
});
