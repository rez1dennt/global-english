import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pages = ['index.html', 'privacy-policy/index.html', 'data-consent/index.html'];

execFileSync(process.execPath, [join(root, 'scripts', 'build-vercel-demo.mjs')], { cwd: root, stdio: 'pipe' });

test('Vercel configuration builds the static client demo', () => {
    assert.ok(existsSync(join(root, 'package.json')), 'package.json is missing');
    assert.ok(existsSync(join(root, 'vercel.json')), 'vercel.json is missing');
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
    assert.equal(pkg.scripts.build, 'node scripts/build-vercel-demo.mjs');
    assert.equal(pkg.scripts['test:vercel'], 'npm run build && node --test global-english/tests/vercel-demo.test.mjs && node global-english/tests/vercel-demo-qa.mjs');
    assert.ok(pkg.devDependencies?.playwright, 'Playwright must be declared for clean-clone QA');
    assert.equal(config.outputDirectory, 'vercel-demo/dist');
    assert.equal(config.buildCommand, 'npm run build');
    assert.equal(config.installCommand, 'npm install --omit=dev');
});

test('static pages are safe snapshots with clean routes', () => {
    for (const page of pages) {
        const path = join(root, 'vercel-demo/site', page);
        assert.ok(existsSync(path), `${page} is missing`);
        const html = readFileSync(path, 'utf8');
        assert.doesNotMatch(html, /localhost|preview\.php|<\?php/i);
        assert.doesNotMatch(html, /(?:href|src|action)=["'][^"']*\.php(?:[?/#"']|$)/i);
        assert.doesNotMatch(html, /\?v=\d+(?=["'])/i);
        assert.match(html, /name="robots" content="noindex, nofollow"/i);
        assert.equal((html.match(/<meta\s+name="robots"/gi) || []).length, 1, `${page} must contain one robots meta tag`);
        assert.match(html, /src="\/demo-form\.js"/i);
        assert.match(html, /data-static-demo="true"/i);
        assert.equal((html.match(/<h1\b/gi) || []).length, 1);
        if (page === 'index.html') {
            assert.equal((html.match(/data-static-demo-form/gi) || []).length, 2);
            assert.equal((html.match(/data-demo-name="(?:name|phone)"/gi) || []).length, 4);
            assert.equal((html.match(/<button\b[^>]*type="submit"[^>]*disabled/gi) || []).length, 2);
            assert.doesNotMatch(html, /\sname="(?:name|phone)"/i);
        }
    }
});

test('build output contains pages, assets and demo safety files', () => {
    for (const page of pages) assert.ok(existsSync(join(root, 'vercel-demo/dist', page)), `${page} is absent from dist`);
    assert.ok(existsSync(join(root, 'vercel-demo/dist/global-english/assets/css/main.css')));
    assert.ok(existsSync(join(root, 'vercel-demo/dist/demo-form.js')));
    assert.match(readFileSync(join(root, 'vercel-demo/dist/robots.txt'), 'utf8'), /Disallow:\s*\//);
});
