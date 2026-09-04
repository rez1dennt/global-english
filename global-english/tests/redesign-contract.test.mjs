import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => existsSync(join(root, name)) ? readFileSync(join(root, name), 'utf8') : '';

test('new client facts replace the demo content', () => {
  const source = read('front-page.php') + read('inc/content.php') + read('footer.php');
  for (const value of ['Казань','Нижнекамск','Чебоксары','Екатеринбург','Борисова Глория Гариевна','14 лет','7 до 17 лет','Стоимость наших занятий']) assert.ok(source.includes(value), value);
  for (const legacy of ['id="courses"','id="method"','id="classes-title"','1500+','Anna Smith','Michael Brown']) assert.ok(!read('front-page.php').includes(legacy), legacy);
});
test('eight concise advantages follow the brief', () => {
  const source = read('front-page.php') + read('inc/content.php');
  for (const value of ['Образовательная лицензия','Наши рабочие материалы','Ежеквартальные тестирования','Занятия с носителями языка','Праздничные мероприятия','Мини-группы','Система мотивации','Дополнительные видеоуроки занятий']) assert.ok(source.includes(value), value);
});
test('both forms share the name phone consent partial and no direction selector', () => {
  const form = read('template-parts/trial-form.php');
  for (const name of ['name="name"','name="phone"','name="consent"','data-phone-input','wp_nonce_field']) assert.ok(form.includes(name), name);
  assert.ok(!form.includes('<select'));
  assert.equal((read('front-page.php').match(/template-parts\/trial-form\.php/g) || []).length, 2);
});
test('real contact configuration and explicit missing-content states are supplied', () => {
  const source = read('inc/content.php');
  for (const value of ['79600643141','buavagloriya@mail.ru','gloriabuava_english','price-list.pdf','license.pdf','offer.pdf']) assert.ok(source.includes(value), value);
  assert.ok(read('front-page.php').includes('Отзывы будут'));
  assert.ok(read('functions.php').includes('global_english_contact_email()'));
});
test('new shared visual assets and palette are present', () => {
  assert.ok(existsSync(join(root,'assets/icons/brand.svg')));
  assert.ok(existsSync(join(root,'assets/images/hero-scene-clean.webp')));
  const css=read('assets/css/main.css');
  assert.match(css, /--color-action:\s*#f07f1c/i);
  assert.match(css, /--color-sky:\s*#38b3e7/i);
});
