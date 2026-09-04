import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../assets/css/main.css',import.meta.url),'utf8');
test('primary orange buttons use a dedicated white-text palette',()=>{
 assert.match(css,/\.button--primary\s*\{[^}]*background:\s*var\(--color-button-action\)[^}]*color:\s*var\(--color-surface\)/s);
 assert.match(css,/\.button--primary:hover\s*\{[^}]*var\(--color-button-action-hover\)/s);
});
