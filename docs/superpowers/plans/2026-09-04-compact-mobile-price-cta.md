# Compact Mobile Price CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Уменьшить CTA-кнопку карточки стоимости на мобильных экранах, не меняя desktop-версию и сохраняя безопасную зону нажатия.

**Architecture:** Существующее desktop-правило `.price-card > .button { width: 100%; }` остаётся базовым. В уже существующий breakpoint `max-width: 44rem` добавляется локальное переопределение только для этой кнопки; геометрия проверяется реальным браузером в общей матрице QA.

**Tech Stack:** WordPress PHP theme, vanilla CSS custom properties, Node.js assertions, Playwright, PowerShell release packaging.

## Global Constraints

- Изменение применяется только к `.price-card > .button` при ширине не больше `44rem`.
- Мобильная ширина кнопки — не больше 210 пикселей.
- Мобильная высота — от 48 до 60 пикселей.
- Кнопка центрируется, текст остаётся двухстрочным, стрелка сохраняется.
- Desktop-версия, цвета и интерактивные состояния не меняются.
- Проверяются ширины 1440, 1280, 1024, 768, 360 и 320 пикселей.

---

### Task 1: Измеряемый мобильный контракт кнопки

**Files:**
- Modify: `global-english/tests/browser-qa.mjs:32-49`
- Modify: `global-english/assets/css/main.css:533-565`

**Interfaces:**
- Consumes: `.price-card > .button`, общий Playwright preview URL и breakpoint `max-width: 44rem`.
- Produces: мобильную кнопку шириной до 210 пикселей и высотой 48–60 пикселей; desktop-кнопку шире 210 пикселей.

- [x] **Step 1: Add the failing browser assertions**

В цикл viewport-матрицы `global-english/tests/browser-qa.mjs` после проверки дубликатов `id` добавить:

```js
        const priceCtaBox = await page.locator('.price-card > .button').boundingBox();
        assert.ok(priceCtaBox, 'Price CTA is missing');
        if (width <= 360) {
            assert.ok(priceCtaBox.width <= 210, `Mobile price CTA is too wide: ${priceCtaBox.width}px at ${width}px`);
            assert.ok(priceCtaBox.height >= 48 && priceCtaBox.height <= 60, `Mobile price CTA height is ${priceCtaBox.height}px at ${width}px`);
        }
        if (width >= 768) assert.ok(priceCtaBox.width > 210, `Desktop price CTA unexpectedly compact at ${width}px`);
```

- [x] **Step 2: Run the browser QA and verify RED**

```powershell
$env:PLAYWRIGHT_MODULE='C:\Users\bahti\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node global-english/tests/browser-qa.mjs
```

Expected: FAIL at 360 or 320 pixels because the current button is wider than 210 pixels and approximately 73 pixels high.

- [x] **Step 3: Add the minimal mobile CSS override**

В `@media (max-width: 44rem)` после мобильного правила `.price-card` добавить:

```css
    .price-card > .button { width: min(100%,12.75rem); min-height: 3rem; margin-inline: auto; padding: var(--space-3) var(--space-5); gap: var(--space-2); font-size: var(--font-size-xs); line-height: 1.35; }
```

- [x] **Step 4: Run the focused browser QA and verify GREEN**

Run the command from Step 2.

Expected: all browser checks pass, including 360 and 320 pixel geometry assertions.

- [x] **Step 5: Capture and inspect the mobile result**

Open `http://127.0.0.1:8765/global-english/tests/preview.php#prices` at 320 and 360 pixels. Measure the CTA bounding box and capture the final card screenshot.

Expected: centered compact button, two-line label, visible arrow, no horizontal overflow.

### Task 2: Regression, release archive and GitHub update

**Files:**
- Modify: `global-english.zip`
- Modify: `docs/superpowers/plans/2026-09-04-compact-mobile-price-cta.md`

**Interfaces:**
- Consumes: verified source tree and `global-english/tests/package-release.ps1`.
- Produces: updated installable ZIP and a normal commit on `main` pushed to `origin/main`.

- [x] **Step 1: Run the full automated suite**

```powershell
$tests = (Get-ChildItem -LiteralPath global-english/tests -Filter '*.test.mjs').FullName
node --test $tests
php global-english/tests/php-static-check.php
```

Expected: every Node test passes and PHP reports `Theme foundation 2.0: PASS`.

- [x] **Step 2: Rebuild the release archive**

```powershell
& global-english/tests/package-release.ps1
```

Expected: `Release 2.0.0: PASS`, 36 entries, source hashes match and no test files are included.

- [x] **Step 3: Mark the plan complete and inspect the diff**

Replace every task checkbox with `[x]`, run `git diff --check`, and inspect `git diff --stat`.

Expected: only the plan, browser QA, CSS, final QA screenshot and rebuilt release ZIP differ from `HEAD`.

- [x] **Step 4: Commit and push**

```powershell
git add docs/superpowers/plans/2026-09-04-compact-mobile-price-cta.md docs/source-review/redesign-qa/mobile-price-cta-320.png global-english/tests/browser-qa.mjs global-english/assets/css/main.css global-english.zip
git commit -m "fix: compact mobile price CTA"
git push origin main
```

Expected: local `HEAD` and remote `refs/heads/main` resolve to the same commit hash.
