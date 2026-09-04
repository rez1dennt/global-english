import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
test('forms contain no preview footnotes or demo success messages',()=>{
    const source=read('template-parts/trial-form.php')+read('inc/content.php')+read('assets/js/main.js');
    assert.ok(!source.includes('Режим предпросмотра'));
    assert.ok(!source.includes('Предпросмотр:'));
    assert.ok(!source.includes('preview-note'));
});
test('branches appear after prices and before the contact form',()=>{
    const page=read('front-page.php');
    const p=page.indexOf('id="prices"'),b=page.indexOf('id="branches"'),c=page.indexOf('id="contacts"');
    assert.ok(p<b&&b<c,'Place branches in the lower part of the page');
    const branches=page.slice(b,c);
    for(const city of ['Казань','Нижнекамск','Чебоксары','Екатеринбург'])assert.ok(branches.includes(city));
    assert.ok(branches.includes('Наши филиалы'));
});
test('local server does not report mail success without an actual transport',()=>{
    const preview=read('tests/preview.php');
    assert.ok(preview.includes("$valid ? 'mail_error' : 'validation_error'"));
    assert.ok(!preview.includes("$valid ? 'success'"));
});
