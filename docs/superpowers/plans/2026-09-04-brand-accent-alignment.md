# Brand Accent Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать книгу во всех экземплярах логотипа красной, как в hero, и перекрасить иконку подарка на оранжевой плашке в белый.

**Architecture:** Общий знак остаётся единым файлом `assets/icons/brand.svg`, поэтому изменение автоматически охватывает шапку, футер и favicon. Иконка подарка уже наследует `currentColor`, поэтому её цвет меняется локально у `.price-card__icon` без правки общего SVG-спрайта.

**Tech Stack:** SVG, CSS custom properties, Node.js `node:test`, PHP-шаблоны WordPress, Playwright.

## Global Constraints

- Синий глобус и геометрия знака не меняются.
- Для книги используется существующий цвет hero `#d50000`.
- Оранжевый фон плашки подарка и остальные оранжевые элементы не меняются.
- Изменение должно работать на ширинах 1280 и 320 пикселей.
- В каталоге нет Git-репозитория, поэтому шаги commit не выполняются.

---

### Task 1: Контракт цвета бренда и подарка

**Files:**
- Create: `global-english/tests/brand-accent.test.mjs`
- Modify: `global-english/assets/icons/brand.svg:1`
- Modify: `global-english/assets/css/main.css:386`

**Interfaces:**
- Consumes: `brand.svg`, CSS-класс `.price-card__icon`, токен `--color-surface`.
- Produces: общий красно-синий логотип и белую SVG-иконку подарка.

- [x] **Step 1: Write the failing test**

```js
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
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test global-english/tests/brand-accent.test.mjs`

Expected: FAIL because `brand.svg` still contains `#f07f1c` and `.price-card__icon` still uses `var(--color-ink)`.

- [x] **Step 3: Write minimal implementation**

In `global-english/assets/icons/brand.svg`, replace:

```svg
fill="#f07f1c"
```

with:

```svg
fill="#d50000"
```

In `global-english/assets/css/main.css`, change only the icon tile foreground:

```css
.price-card__icon { display: grid; place-items: center; width: 4rem; height: 4rem; margin-bottom: var(--space-6); color: var(--color-surface); background: var(--color-action); border-radius: var(--radius-md); transform: rotate(-8deg); }
```

- [x] **Step 4: Run focused test to verify it passes**

Run: `node --test global-english/tests/brand-accent.test.mjs`

Expected: 2 tests, 2 pass, 0 fail.

- [x] **Step 5: Verify rendered colors**

Open the local preview and assert that the header brand book resolves to `#d50000` in the loaded SVG asset and `.price-card__icon` resolves to white foreground on the orange background at 1280 and 320 pixels.

Expected: no layout change, no horizontal overflow, correct two colors.

### Task 2: Полная проверка и выпуск архива

**Files:**
- Modify: `global-english.zip`

**Interfaces:**
- Consumes: verified theme sources and release packaging script.
- Produces: installable WordPress theme archive with source hashes matching the working tree.

- [x] **Step 1: Run the full automated suite**

```powershell
$tests = (Get-ChildItem -LiteralPath global-english/tests -Filter '*.test.mjs').FullName
node --test $tests
php global-english/tests/php-static-check.php
```

Expected: every Node test passes and PHP reports `Theme foundation 2.0: PASS`.

- [x] **Step 2: Run the browser matrix**

```powershell
$env:PLAYWRIGHT_MODULE='C:\Users\bahti\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node global-english/tests/browser-qa.mjs
```

Expected: all routes, interactions and widths 1440, 1280, 1024, 768, 360 and 320 pixels pass.

- [x] **Step 3: Rebuild and verify the release archive**

```powershell
& global-english/tests/package-release.ps1
Get-FileHash -Algorithm SHA256 -LiteralPath global-english.zip
```

Expected: `Release 2.0.0: PASS`, 36 entries, source hashes match and no test files are included.
