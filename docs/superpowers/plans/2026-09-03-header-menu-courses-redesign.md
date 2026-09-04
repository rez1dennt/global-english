# Header, Menu and Courses Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Устранить сдвиг страницы при открытии бургер-меню, оставить текстовый логотип без `GE` и заменить высокие карточки курсов на компактную горизонтальную сетку.

**Architecture:** Блокировка прокрутки выносится в тестируемый модуль `scroll-lock.js`, который владеет только временными inline-стилями `body` и фиксированной шапки. Разметка бренда и курсов остаётся серверной PHP-разметкой, а визуальная переработка использует существующие CSS-токены и адаптивные точки.

**Tech Stack:** PHP 8+, WordPress classic theme, vanilla JavaScript, CSS, Node.js test runner, Chrome DevTools Protocol browser QA.

## Global Constraints

- Не добавлять ACF и внешние библиотеки.
- Сохранить текущие тексты, SVG-иконки, форму, якоря и доступность.
- Проверить 1440, 1024, 768, 360 и 320 px.
- Не выполнять Git-операции: рабочая папка не является репозиторием.

---

### Task 1: Scroll lock без горизонтального прыжка

**Files:**
- Create: `global-english/assets/js/scroll-lock.js`
- Create: `global-english/tests/scroll-lock.test.mjs`
- Modify: `global-english/assets/js/main.js`
- Modify: `global-english/functions.php`
- Modify: `global-english/tests/preview.php`
- Modify: `global-english/tests/browser-qa.mjs`

**Interfaces:**
- Produces: `GlobalEnglishScrollLock.getScrollbarGap(innerWidth, clientWidth): number`.
- Produces: `GlobalEnglishScrollLock.createScrollLock(window, document): { lock(): number, unlock(): void, isLocked(): boolean }`.
- Consumes: fixed header selector `[data-site-header]` and existing `body.menu-open` state.

- [x] **Step 1: Write the failing unit and browser assertions**

Test zero/positive scrollbar gaps, preservation and restoration of owned inline styles, idempotent locking, and measured header/content X coordinates before/open/closed at 360 px.

- [x] **Step 2: Run tests and verify RED**

Run `node --test global-english/tests/scroll-lock.test.mjs` and confirm failure because `assets/js/scroll-lock.js` is absent.

- [x] **Step 3: Implement the module and integrate it**

Calculate `Math.max(0, window.innerWidth - document.documentElement.clientWidth)`, add the gap to the existing computed right padding of `body` and the fixed header, preserve previous inline values, and restore them during unlock before returning to the recorded `scrollY`.

- [x] **Step 4: Verify GREEN**

Run the focused unit test, then the browser interaction test. Expected: no X-coordinate or document-width change, exact scroll restoration and synchronized menu state.

### Task 2: Text-only brand and horizontal course cards

**Files:**
- Modify: `global-english/header.php`
- Modify: `global-english/footer.php`
- Modify: `global-english/front-page.php`
- Modify: `global-english/assets/css/main.css`
- Modify: `global-english/tests/php-static-check.php`

**Interfaces:**
- Consumes: existing `.brand`, `.brand__copy`, `.course-grid`, `.course-card` and `.icon-disc` components.
- Produces: `.course-card__content` wrapper and text-only brand markup.

- [x] **Step 1: Add failing structural assertions**

Require zero `.brand__mark` markup occurrences, require `.course-card__content`, require a two-column desktop course grid and one-column mobile override.

- [x] **Step 2: Run static test and verify RED**

Run `php global-english/tests/php-static-check.php`. Expected: failures for the old brand mark and missing new course structure.

- [x] **Step 3: Implement approved design**

Remove both `GE` spans, style the remaining wordmark with a thin gold leading rule, wrap card copy, switch desktop/tablet to 2×2 horizontal cards, render level as a compact pill, and use one horizontal card per row at 360/320 px.

- [x] **Step 4: Verify GREEN and visual geometry**

Run the static test and measure card orientation, grid columns, gutters, overflow and word wrapping across the viewport matrix.

### Task 3: Full regression and package handoff

**Files:**
- Modify: `global-english/style.css`
- Modify: `global-english/screenshot.png`
- Modify: `global-english.zip`

**Interfaces:**
- Consumes: all production theme files and automated tests.
- Produces: installable `global-english.zip` rooted at `global-english/`.

- [x] **Step 1: Run full syntax, unit and static suite**

Run PHP lint recursively, `node --check` for all theme scripts, all Node tests and `php global-english/tests/php-static-check.php`.

- [x] **Step 2: Run complete browser QA**

Check the homepage at 1440, 1024, 768, 360 and 320 px plus the privacy page at 360 px; verify resources, fonts, console, overflow, menu open/close/Escape, scroll restoration, form validation and cookie controls.

- [x] **Step 3: Refresh preview and package**

Capture the updated header/course area, update WordPress `screenshot.png`, rebuild `global-english.zip`, and verify every archive entry begins with `global-english/` with no QA artifacts.
