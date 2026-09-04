import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = readFileSync(join(root, 'assets/icons/brand.svg'), 'utf8');
const css = readFileSync(join(root, 'assets/css/main.css'), 'utf8');

test('shared brand book uses the same red accent as the hero', () => {
  assert.match(brand, /fill="#d50000"/i);
  assert.doesNotMatch(brand, /fill="#f07f1c"/i);
});

test('gift icon is white on its orange tile', () => {
  assert.match(css, /\.price-card__icon\s*\{[^}]*color:\s*var\(--color-surface\)/s);
  assert.match(css, /\.price-card__icon\s*\{[^}]*background:\s*var\(--color-action\)/s);
});
