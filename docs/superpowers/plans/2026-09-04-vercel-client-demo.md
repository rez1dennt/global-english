# Vercel Client Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить воспроизводимую статическую сборку полного сайта для клиентского просмотра на Vercel без WordPress, PHP и базы данных.

**Architecture:** Локальный Node.js-экспортёр получает три HTML-страницы из существующего PHP preview и сохраняет очищенные снимки в `vercel-demo/site`. Vercel запускает независимый Node.js-сборщик, который копирует снимки, demo-скрипт и актуальные ресурсы WordPress-темы в игнорируемый `vercel-demo/dist`.

**Tech Stack:** Node.js 22, static HTML/CSS/JavaScript, WordPress preview PHP, Playwright, Vercel configuration.

## Global Constraints

- WordPress-тема `global-english/` остаётся рабочей и не дублирует бизнес-логику в PHP.
- Публичные demo-маршруты: `/`, `/privacy-policy/`, `/data-consent/`.
- В статическом HTML не остаётся `localhost`, `preview.php` или исполняемых PHP-ссылок.
- Формы не передают данные и не показывают ложный успех; после валидной отправки предлагается телефон.
- Все страницы получают `noindex, nofollow`; `robots.txt` запрещает индексацию.
- Сборка не использует внешние npm-зависимости и не требует PHP на Vercel.
- Браузерная матрица: 1280, 768, 360 и 320 пикселей.
- Изменения отправляются обычным push в `origin/main` без force.

---

### Task 1: Контракт и статический экспорт

**Files:**
- Create: `global-english/tests/vercel-demo.test.mjs`
- Create: `scripts/export-vercel-demo.mjs`
- Create: `scripts/build-vercel-demo.mjs`
- Create: `package.json`
- Create: `vercel.json`
- Create: `vercel-demo/static/demo-form.js`
- Create: `vercel-demo/static/robots.txt`
- Create: `vercel-demo/README.md`
- Create: `global-english/tests/vercel-demo-qa.mjs`
- Modify: `.gitignore`
- Generate: `vercel-demo/site/index.html`
- Generate: `vercel-demo/site/privacy-policy/index.html`
- Generate: `vercel-demo/site/data-consent/index.html`

**Interfaces:**
- `GE_PREVIEW_URL`: optional preview endpoint, default `http://127.0.0.1:8765/global-english/tests/preview.php`.
- `npm run export:vercel`: refreshes committed static page snapshots.
- `npm run build`: creates `vercel-demo/dist` with three routes and `/global-english/assets/`.

- [x] **Step 1: Write the failing contract and browser tests**

Create `global-english/tests/vercel-demo.test.mjs` that asserts:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pages = ['index.html', 'privacy-policy/index.html', 'data-consent/index.html'];

test('Vercel configuration builds the static client demo', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const config = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  assert.equal(pkg.scripts.build, 'node scripts/build-vercel-demo.mjs');
  assert.equal(config.outputDirectory, 'vercel-demo/dist');
  assert.equal(config.buildCommand, 'npm run build');
});

test('static pages are safe snapshots with clean routes', () => {
  for (const page of pages) {
    const html = readFileSync(join(root, 'vercel-demo/site', page), 'utf8');
    assert.doesNotMatch(html, /localhost|preview\.php|<\?php/i);
    assert.match(html, /name="robots" content="noindex, nofollow"/i);
    assert.match(html, /src="\/demo-form\.js"/i);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  }
});

test('build output contains pages, assets and demo safety files', () => {
  for (const page of pages) assert.ok(existsSync(join(root, 'vercel-demo/dist', page)));
  assert.ok(existsSync(join(root, 'vercel-demo/dist/global-english/assets/css/main.css')));
  assert.ok(existsSync(join(root, 'vercel-demo/dist/demo-form.js')));
  assert.match(readFileSync(join(root, 'vercel-demo/dist/robots.txt'), 'utf8'), /Disallow:\s*\//);
});
```

Create `global-english/tests/vercel-demo-qa.mjs` using Node `http` and Playwright. It must serve `vercel-demo/dist` on an ephemeral port; check all three routes at 1280, 768, 360 and 320 pixels for status 200, one `h1`, complete images, no console errors and no horizontal overflow; then exercise the mobile menu, modal, price disclosure, invalid and valid form states, and assert that zero POST requests occurred.

- [x] **Step 2: Run both new tests and verify RED**

```powershell
node --test global-english/tests/vercel-demo.test.mjs
$env:PLAYWRIGHT_MODULE='C:\Users\bahti\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node global-english/tests/vercel-demo-qa.mjs
```

Expected: both commands FAIL because configuration, static pages and dist do not exist.

- [x] **Step 3: Implement the local exporter**

Create `scripts/export-vercel-demo.mjs` with route mapping, clean URL replacements, `noindex` injection, `data-static-demo` marker and `/demo-form.js` injection. The exporter must throw on a non-200 response and after writing rescan every page for `localhost`, `preview.php` and `<?php`.

- [x] **Step 4: Implement the Vercel build**

Create `scripts/build-vercel-demo.mjs` that removes only `vercel-demo/dist`, copies `vercel-demo/site` there, copies `global-english/assets` to `dist/global-english/assets`, copies each file from `vercel-demo/static` to the dist root and validates all required outputs.

- [x] **Step 5: Add configuration and safe demo support**

Create `package.json`:

```json
{
  "name": "global-english-vercel-demo",
  "private": true,
  "scripts": {
    "export:vercel": "node scripts/export-vercel-demo.mjs",
    "build": "node scripts/build-vercel-demo.mjs"
  }
}
```

Create `vercel.json` with schema, `buildCommand: npm run build`, `outputDirectory: vercel-demo/dist`, clean URLs, trailing slashes and an `X-Robots-Tag: noindex, nofollow` header for every route.

Append `vercel-demo/dist/` to `.gitignore`.

Create `vercel-demo/static/demo-form.js`. It stores each submit button’s original HTML, lets the theme validator handle invalid forms, prevents only otherwise-valid submission, restores the button, sets the form status to error and displays: `Онлайн-заявка пока недоступна. Позвоните нам: +7 (960) 064-31-41.`

Create `vercel-demo/static/robots.txt`:

```text
User-agent: *
Disallow: /
```

Create `vercel-demo/README.md` with the exact Vercel Dashboard settings and the three expected routes.

- [x] **Step 6: Export the three pages and build**

```powershell
$env:GE_PREVIEW_URL='http://127.0.0.1:8766/global-english/tests/preview.php'
npm run export:vercel
npm run build
```

Expected: three snapshots exported; build reports three routes and copied theme assets.

- [x] **Step 7: Run both new tests and verify GREEN**

Run both commands from Step 2.

Expected: 3 contract tests pass; every static route, viewport and interaction passes; zero POST requests occur.

### Task 2: Полная регрессия и GitHub handoff

**Files:**
- Modify: `docs/superpowers/plans/2026-09-04-vercel-client-demo.md`
- All files created in Tasks 1–2.

**Interfaces:**
- Consumes: tested static output and existing WordPress suite.
- Produces: a clean `main` whose remote hash matches local `HEAD`.

- [x] **Step 1: Run all Node and PHP tests**

```powershell
$tests = (Get-ChildItem -LiteralPath global-english/tests -Filter '*.test.mjs').FullName
node --test $tests
php global-english/tests/php-static-check.php
```

Expected: all tests pass and PHP reports `Theme foundation 2.0: PASS`.

- [x] **Step 2: Run both browser suites**

Run the existing WordPress preview browser QA and the new static-demo QA with the configured Playwright module.

Expected: both suites pass at their complete viewport and interaction matrices.

- [x] **Step 3: Verify build cleanliness**

Run `npm run build`, confirm `vercel-demo/dist/` is ignored, run `git diff --check`, scan tracked candidate files for secrets and inspect `git status --short` plus `git diff --stat`.

Expected: no secrets, no whitespace errors, generated dist absent from Git status, and only task files changed.

- [x] **Step 4: Commit and push normally**

Commit with `feat: add Vercel client demo`, fetch `origin/main`, preserve any remote-only changes, push without force, and verify local and remote `main` hashes match.
