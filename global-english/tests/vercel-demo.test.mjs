import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pages = ['index.html', 'privacy-policy/index.html', 'data-consent/index.html'];

test('Vercel configuration builds the static client demo', () => {
    assert.ok(existsSync(join(root, 'package.json')), 'package.json is missing');
    assert.ok(existsSync(join(root, 'vercel.json')), 'vercel.json is missing');
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
    assert.equal(pkg.scripts.build, 'node scripts/build-vercel-demo.mjs');
    assert.equal(config.outputDirectory, 'vercel-demo/dist');
    assert.equal(config.buildCommand, 'npm run build');
});

test('static pages are safe snapshots with clean routes', () => {
    for (const page of pages) {
        const path = join(root, 'vercel-demo/site', page);
        assert.ok(existsSync(path), `${page} is missing`);
        const html = readFileSync(path, 'utf8');
        assert.doesNotMatch(html, /localhost|preview\.php|<\?php/i);
        assert.match(html, /name="robots" content="noindex, nofollow"/i);
        assert.equal((html.match(/<meta\s+name="robots"/gi) || []).length, 1, `${page} must contain one robots meta tag`);
        assert.match(html, /src="\/demo-form\.js"/i);
        assert.match(html, /data-static-demo="true"/i);
        assert.equal((html.match(/<h1\b/gi) || []).length, 1);
    }
});

test('build output contains pages, assets and demo safety files', () => {
    for (const page of pages) assert.ok(existsSync(join(root, 'vercel-demo/dist', page)), `${page} is absent from dist`);
    assert.ok(existsSync(join(root, 'vercel-demo/dist/global-english/assets/css/main.css')));
    assert.ok(existsSync(join(root, 'vercel-demo/dist/demo-form.js')));
    assert.match(readFileSync(join(root, 'vercel-demo/dist/robots.txt'), 'utf8'), /Disallow:\s*\//);
});
