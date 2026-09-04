# Global English WordPress Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать точную адаптивную WordPress-тему одностраничной школы языков по утверждённому референсу, с оригинальными изображениями, интерактивной навигацией и безопасной формой заявки.

**Architecture:** Классическая WordPress-тема `global-english` разделяет шаблон страницы, регистрацию ресурсов и обработку формы. CSS строится вокруг общих токенов и адаптивных сеток, JavaScript — вокруг небольших независимых модулей меню, слайдера, анимаций и маски телефона. Контент пока хранится в PHP-шаблонах, но каждая секция изолирована и готова к замене значений на ACF.

**Tech Stack:** PHP 8.0+, WordPress 6.4+, semantic HTML5, CSS3, vanilla JavaScript ES2020, Node.js built-in test runner, SVG, WebP/PNG.

## Global Constraints

- Тема не требует Elementor, ACF или других обязательных плагинов.
- Порядок секций, тексты, цветовая схема и плотность контента повторяют предоставленный пользователем референс.
- Фотографии создаются заново и не содержат текста, логотипов или водяных знаков.
- Контакты и тексты на первом этапе зафиксированы в шаблоне.
- Форма отправляет валидные заявки через `wp_mail()` на `get_option('admin_email')`.
- Поддерживаются desktop, tablet, 360 px и 320 px, клавиатура и `prefers-reduced-motion`.
- Финальный архив содержит единственную корневую папку `global-english/`.

## File Map

- `global-english/style.css` — метаданные темы и минимальная точка входа WordPress.
- `global-english/functions.php` — setup, enqueue, form routes and submission handler.
- `global-english/header.php` — document head, fixed header and mobile navigation.
- `global-english/front-page.php` — all landing-page sections in approved order.
- `global-english/footer.php` — footer, social links and closing document markup.
- `global-english/assets/css/main.css` — tokens, components, layout, responsive states and motion.
- `global-english/assets/js/main.js` — menu, anchors, slider, reveal effects and form UX.
- `global-english/assets/js/phone-mask.js` — pure phone-formatting helpers reusable in browser and tests.
- `global-english/assets/icons/*.svg` — local accessible decorative icons.
- `global-english/assets/images/*` — generated photos and hero imagery.
- `global-english/tests/phone-mask.test.mjs` — phone-mask behavior tests.
- `global-english/tests/php-static-check.php` — theme contract checks without a WordPress runtime.
- `global-english/README.md` — installation, mail delivery and ACF migration notes.
- `global-english/screenshot.png` — WordPress theme preview.

---

### Task 1: Theme foundation and static contract

**Files:**
- Create: `global-english/style.css`
- Create: `global-english/functions.php`
- Create: `global-english/tests/php-static-check.php`

**Interfaces:**
- Produces: `global_english_setup(): void`, `global_english_assets(): void`, theme support and resource handles `global-english-main`, `global-english-phone-mask`, `global-english-script`.

- [ ] **Step 1: Write the failing static contract check**

Create a PHP script that reads `style.css` and `functions.php`, asserts the theme header contains `Theme Name: Global English`, and asserts both `after_setup_theme` and `wp_enqueue_scripts` registrations exist. Exit non-zero with a named assertion when any contract is missing.

- [ ] **Step 2: Run the check and verify failure**

Run: `php global-english/tests/php-static-check.php`

Expected: non-zero exit because the theme files do not exist.

- [ ] **Step 3: Implement theme metadata and setup**

Add a valid WordPress theme header, `add_theme_support('title-tag')`, `add_theme_support('post-thumbnails')`, `add_theme_support('custom-logo')`, HTML5 supports, Russian locale text domain loading, and enqueued CSS/JS using `get_theme_file_uri()` plus `filemtime()` versions.

- [ ] **Step 4: Run syntax and contract checks**

Run: `php -l global-english/functions.php` and `php global-english/tests/php-static-check.php`.

Expected: both commands exit 0; contract output ends with `Theme foundation: PASS`.

### Task 2: Exact semantic page structure

**Files:**
- Create: `global-english/header.php`
- Create: `global-english/front-page.php`
- Create: `global-english/footer.php`
- Modify: `global-english/tests/php-static-check.php`

**Interfaces:**
- Consumes: WordPress helpers and enqueued handles from Task 1.
- Produces: anchors `about`, `courses`, `method`, `benefits`, `teachers`, `reviews`, `contacts`, and form element `#trial-form`.

- [ ] **Step 1: Extend the failing contract check**

Assert there is exactly one `<h1`, every required anchor ID occurs once, the page calls `get_header()` and `get_footer()`, header calls `wp_head()`/`wp_body_open()`, and footer calls `wp_footer()`.

- [ ] **Step 2: Run and verify the new assertions fail**

Run: `php global-english/tests/php-static-check.php`.

Expected: failure naming the first missing template contract.

- [ ] **Step 3: Build the complete PHP/HTML structure**

Implement all twelve sections from the specification with the exact Russian copy visible in the supplied reference, semantic headings, descriptive image `alt` text, accessible buttons and valid internal anchors. Use WordPress escaping helpers for URLs and attributes.

- [ ] **Step 4: Verify template contracts and PHP syntax**

Run: `Get-ChildItem global-english -Filter *.php -Recurse | ForEach-Object { php -l $_.FullName }` and `php global-english/tests/php-static-check.php`.

Expected: every file reports no syntax errors and the contract check passes.

### Task 3: Generated photography and local SVG assets

**Files:**
- Create: `global-english/assets/images/hero-student.webp`
- Create: `global-english/assets/images/method-online.webp`
- Create: `global-english/assets/images/opportunity-students.webp`
- Create: `global-english/assets/images/opportunity-london.webp`
- Create: `global-english/assets/images/opportunity-china.webp`
- Create: `global-english/assets/images/opportunity-study.webp`
- Create: `global-english/assets/images/teacher-anna.webp`
- Create: `global-english/assets/images/teacher-li.webp`
- Create: `global-english/assets/images/teacher-michael.webp`
- Create: `global-english/assets/images/teacher-zhang.webp`
- Create: `global-english/assets/images/class-01.webp` through `class-04.webp`
- Create: `global-english/assets/icons/*.svg`
- Modify: `global-english/front-page.php`

**Interfaces:**
- Produces: optimized local raster assets with stable filenames and SVG icons referenced through `get_theme_file_uri()`.

- [ ] **Step 1: Generate the coherent image set**

Use the supplied screenshot only as a composition/style reference. Generate text-free, watermark-free educational photography in a warm amber/neutral palette: an Asian student hero portrait with negative space, online-learning scene, international student group, London landmark/red bus scene, Chinese temple scene, Chinese study scene, four diverse teacher portraits and four candid classroom scenes.

- [ ] **Step 2: Inspect and normalize assets**

Visually inspect every generated file for subject, hands/faces, crop, lighting consistency and unwanted text. Convert final assets to WebP at the rendered aspect ratios while retaining sufficient resolution for 2x displays.

- [ ] **Step 3: Add local SVG icons**

Download or create visually consistent outline SVGs for course, benefits, methodology, statistics, contact and social motifs. Preserve any required SVG Repo attribution/license information in `README.md`; sanitize markup and remove scripts, inline raster data and external references.

- [ ] **Step 4: Wire images into templates and verify references**

Extend `php-static-check.php` to extract local `assets/images`/`assets/icons` paths and fail when a referenced file does not exist. Run it and expect `Asset references: PASS`.

### Task 4: Desktop visual system and reference composition

**Files:**
- Create: `global-english/assets/css/main.css`
- Modify: `global-english/front-page.php`
- Modify: `global-english/header.php`
- Modify: `global-english/footer.php`

**Interfaces:**
- Consumes: semantic classes and asset filenames from Tasks 2–3.
- Produces: CSS tokens `--color-ink`, `--color-gold`, `--color-cream`, `--container`, `--header-height`, reusable `.container`, `.button`, `.section-heading`, `.card`, and desktop section layouts.

- [ ] **Step 1: Establish design tokens and global primitives**

Define colors, type scale, spacing scale, radii, shadows, focus ring, container width, selection colors and consistent section padding. Include a readable Cyrillic-capable system font stack without a render-blocking third-party dependency.

- [ ] **Step 2: Reproduce the desktop layout**

Implement the dark header, layered hero, four-column course and benefit grids, methodology split, opportunity mosaic, black statistics band, teacher and review cards, classroom strip, cream CTA form and multi-column footer. Match the screenshot’s proportions, whitespace, thin borders, yellow accents and rounded corners.

- [ ] **Step 3: Add state styling**

Add hover, active, focus-visible, disabled, error, success and loading states for links, buttons, cards, slider controls and form fields.

- [ ] **Step 4: Render desktop and compare visually**

Run a local WordPress-compatible preview, capture at 1440 px width, compare section order, geometry, dominant colors and image crops to the reference, then correct visible drift before proceeding.

### Task 5: Responsive navigation and layouts

**Files:**
- Modify: `global-english/assets/css/main.css`
- Create: `global-english/assets/js/main.js`

**Interfaces:**
- Produces: `initMenu()`, `initSmoothAnchors()`, body state `.menu-open`, button state `aria-expanded`, mobile panel state `data-open`.

- [ ] **Step 1: Add responsive CSS contracts**

At 1024 px reduce grids, at 768 px show burger navigation and stack primary layouts, and below 480 px enforce one-column content, full-width CTA buttons, 44 px minimum interactive targets, safe image crops and zero horizontal overflow.

- [ ] **Step 2: Implement accessible menu behavior**

`initMenu()` toggles `aria-expanded`, traps focus while open, closes on Escape/link/outside click, restores focus to the trigger and locks body scrolling without losing the previous page position.

- [ ] **Step 3: Implement anchor behavior and reduced motion**

`initSmoothAnchors()` respects the fixed header offset, updates focus after navigation and uses instant behavior when `prefers-reduced-motion: reduce` matches.

- [ ] **Step 4: Exercise target viewports**

Capture and inspect at 1440, 1024, 768, 360 and 320 px. Expected: no clipped controls, no overlapping header, no horizontal scrollbar, coherent single-column reading order and functional menu at keyboard and touch sizes.

### Task 6: Phone mask, form UX and secure server handler

**Files:**
- Create: `global-english/assets/js/phone-mask.js`
- Create: `global-english/tests/phone-mask.test.mjs`
- Modify: `global-english/assets/js/main.js`
- Modify: `global-english/functions.php`
- Modify: `global-english/front-page.php`
- Modify: `global-english/tests/php-static-check.php`

**Interfaces:**
- Produces: `extractRussianPhoneDigits(value): string`, `formatRussianPhone(value): string`, `isValidRussianPhone(value): boolean`, `global_english_handle_trial_form(): void`.

- [ ] **Step 1: Write phone-mask tests first**

Cover empty input, `8` normalization to `+7`, pasted 11-digit values, partial values, deletion after `)`, non-digit removal, selection replacement and valid/invalid completion. A key assertion is that formatting `+7 (912) 34` returns `+7 (912) 34` without restoring deleted digits.

- [ ] **Step 2: Verify phone-mask tests fail**

Run: `node --test global-english/tests/phone-mask.test.mjs`.

Expected: failure because exported helpers do not exist.

- [ ] **Step 3: Implement pure phone helpers and input adapter**

Keep formatting pure and store only current digits. Map caret position by count of digits before the selection, handle `input`, `beforeinput`, paste and blur, and never inject a full placeholder as actual field value.

- [ ] **Step 4: Run mask tests**

Run: `node --test global-english/tests/phone-mask.test.mjs`.

Expected: all test cases pass.

- [ ] **Step 5: Add client-side form validation**

Validate name length, complete phone, allowed language values and consent. Connect each error through `aria-describedby`, focus the first invalid field, preserve entered values after validation errors, and disable the submit button only while submitting.

- [ ] **Step 6: Add secure WordPress handler**

Register both `admin_post_nopriv_global_english_trial` and `admin_post_global_english_trial`; verify nonce; reject filled honeypot; sanitize fields; whitelist `english`, `chinese`, `ielts`; validate phone as 11 Russian digits; rate-limit by hashed IP transient; call `wp_mail()` with a plain-text body; redirect back to `#contacts` with `form_status=success` or a non-sensitive error code.

- [ ] **Step 7: Extend and run static/PHP checks**

Assert both routes, nonce verification, sanitizers, transient rate limit and `wp_mail` occur in `functions.php`. Run PHP syntax, static contract and Node tests; all must exit 0.

### Task 7: Slider, reveal motion and accessibility pass

**Files:**
- Modify: `global-english/assets/js/main.js`
- Modify: `global-english/assets/css/main.css`
- Modify: `global-english/front-page.php`

**Interfaces:**
- Produces: `initTeacherSlider()`, `initReveal()`, live status `#teacher-slider-status`, and CSS state `[data-revealed='true']`.

- [ ] **Step 1: Implement the teacher slider**

Use native horizontal scrolling with snap points. Previous/next buttons scroll by one visible card group, disable at boundaries, update a polite live-region status and leave every card reachable without JavaScript.

- [ ] **Step 2: Implement optional reveal motion**

Use `IntersectionObserver` to mark sections revealed. Content remains visible by default; animation activates only after a JS-enhanced class is added and is disabled under reduced motion.

- [ ] **Step 3: Complete accessibility states**

Verify heading order, landmark names, alt text, decorative `aria-hidden`, focus visibility, color contrast, form announcements, menu/sider keyboard behavior and minimum pointer targets.

- [ ] **Step 4: Browser interaction check**

Exercise Tab/Shift+Tab, Enter, Space, Escape, slider buttons, all anchor links and the complete error/success form flow at desktop and 320 px. Expected: no keyboard trap except the intentional open-menu focus trap, and all controls expose accurate names/states.

### Task 8: Documentation, WordPress preview and installable release

**Files:**
- Create: `global-english/README.md`
- Create: `global-english/screenshot.png`
- Create: `global-english.zip`
- Modify: `global-english/tests/php-static-check.php`

**Interfaces:**
- Produces: user-installable `global-english.zip` and operational documentation.

- [ ] **Step 1: Write installation and operations documentation**

Document WordPress version floor, theme upload/activation, static-front-page behavior, recipient email source, SMTP recommendation for production, required privacy-policy link review, SVG attribution/license notes, cache clearing and the exact sections intended for later ACF field groups.

- [ ] **Step 2: Create the WordPress preview image**

Capture a polished desktop view of the implemented theme, crop it to a WordPress-friendly preview ratio and save as `global-english/screenshot.png`.

- [ ] **Step 3: Run the complete release gate**

Run PHP lint over every PHP file, `php global-english/tests/php-static-check.php`, `node --test global-english/tests/phone-mask.test.mjs`, and browser checks at 1440, 1024, 768, 360 and 320 px. Expected: zero failed assertions, zero console errors and no horizontal overflow.

- [ ] **Step 4: Build and inspect the ZIP**

Compress only the `global-english/` directory to `global-english.zip`; list archive entries and verify the first path segment is always `global-english/`, with no temp files, source reference screenshot or test captures included.

- [ ] **Step 5: Record final evidence**

Add the exact verification commands and results to `README.md`, along with the known deployment dependency that live email delivery requires correctly configured WordPress mail transport.

## Plan Self-Review

- Spec coverage: all approved sections, imagery, SVGs, WordPress structure, responsive states, interactions, form security, phone deletion behavior, documentation and ZIP packaging map to Tasks 1–8.
- Placeholder scan: no deferred implementation markers are used.
- Interface consistency: template IDs, JavaScript initializer names, form action and PHP handler names remain stable across tasks.
- Repository note: the workspace was not a Git repository when this plan was written, so commit steps are intentionally omitted; implementation remains divided into independently verifiable tasks.
