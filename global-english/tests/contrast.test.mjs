import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css = readFileSync(new URL('../assets/css/main.css', import.meta.url), 'utf8');
const colors = Object.fromEntries([...css.matchAll(/--(color-[\w-]+):\s*#([\da-f]{6})/gi)].map(m=>[m[1],m[2]]));
function luminance(hex) { const rgb=hex.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; }
for(const [fg,bg] of [['color-text','color-surface'],['color-text-muted','color-soft'],['color-sky-strong','color-blue-soft'],['color-on-action','color-action'],['color-on-action','color-action-hover'],['color-surface','color-button-action'],['color-surface','color-button-action-hover'],['color-ink','color-sky'],['color-blue-mid','color-ink'],['color-text','color-warm'],['color-surface','color-hero-blue'],['color-surface','color-hero-hover'],['color-hero-blue','color-soft'],['color-hero-red','color-soft']]) {
    test('text contrast ' + fg + ' on ' + bg,()=>{const a=luminance(colors[fg]),b=luminance(colors[bg]);const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5,ratio.toFixed(2)+' < 4.5');});
}
