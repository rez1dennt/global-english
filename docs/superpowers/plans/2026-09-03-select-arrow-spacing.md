# Select Arrow Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give both native language selects a clearly inset SVG arrow without changing their native interaction or existing visual states.

**Architecture:** Strengthen the existing CDP browser regression first so it measures the rendered select styles in both forms. Add one reusable local SVG asset and one shared token-driven CSS rule, preserve high-contrast behavior, then run the existing responsive and interaction suite and rebuild the WordPress ZIP.

**Tech Stack:** WordPress classic theme, semantic HTML, token-driven vanilla CSS, SVG, Node.js CDP browser QA, PHP static checks.

## Global Constraints

- Keep both existing native `<select>` elements and their HTML attributes unchanged.
- Use `var(--space-4)` for the visible 16 px arrow inset and `var(--space-10)` for the 40 px text-safe area.
- Use a local `assets/icons/chevron-down.svg`; do not add a dependency or JavaScript dropdown.
- Preserve default, hover, focus, validation-error, keyboard, mobile, and forced-colors behavior.
- Verify desktop, intermediate, 360 px, and 320 px layouts without horizontal overflow.

---

### Task 1: Add a failing rendered-style regression

**Files:**
- Modify: `global-english/tests/browser-qa.mjs`

**Interfaces:**
- Consumes: both `.form-field select` elements rendered by `tests/preview.php`.
- Produces: measured assertions for `appearance`, right padding, background image, background position, and keyboard focus.

- [ ] **Step 1: Extend the interaction evaluation**

Evaluate both selects and return these computed values:

```js
const selectStyles = Array.from(document.querySelectorAll('.form-field select')).map((select) => {
  const style = getComputedStyle(select);
  return {
    appearance: style.appearance,
    paddingRight: parseFloat(style.paddingRight),
    backgroundImage: style.backgroundImage,
    backgroundPosition: style.backgroundPosition,
  };
});
```

Assert that two controls are found, every `appearance` is `none`, every `paddingRight` is `40`, every background image contains `chevron-down.svg`, and every position contains `calc(100% - 16px)` and `50%`.

- [ ] **Step 2: Verify RED**

Run the browser QA against the current preview.

Expected: FAIL because the current selects use `appearance: auto`, 16 px right padding, and no SVG background.

---

### Task 2: Add the shared arrow treatment

**Files:**
- Create: `global-english/assets/icons/chevron-down.svg`
- Modify: `global-english/assets/css/main.css`
- Modify: `global-english/tests/php-static-check.php`

**Interfaces:**
- Consumes: the existing `.form-field select` primitive and spacing tokens.
- Produces: one shared arrow implementation used by inline and modal forms.

- [ ] **Step 1: Add the SVG asset**

Create a 24×24 `viewBox` icon matching the existing chevrons:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#17191c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
```

- [ ] **Step 2: Add the minimal shared CSS**

Add after the shared input/select rule:

```css
.form-field select {
    padding-inline-end: var(--space-10);
    appearance: none;
    background-image: url("../icons/chevron-down.svg");
    background-repeat: no-repeat;
    background-position: calc(100% - var(--space-4)) 50%;
    background-size: var(--space-4);
}
```

Extend the existing forced-colors block with:

```css
.form-field select { appearance: auto; background-image: none; }
```

- [ ] **Step 3: Add the asset contract**

Append `chevron-down.svg` to `$requiredIcons` in `php-static-check.php` so packaging cannot omit the arrow.

- [ ] **Step 4: Verify GREEN**

Run the browser QA again.

Expected: both selects report the required values, keyboard focus remains visible, and the full existing browser suite passes.

---

### Task 3: Verify and package version 1.3.2

**Files:**
- Modify: `global-english/style.css`
- Replace: `global-english.zip`

**Interfaces:**
- Consumes: the verified `global-english/` directory.
- Produces: an installable `global-english.zip` containing version 1.3.2 and the new SVG.

- [ ] **Step 1: Set the theme version to 1.3.2**

Replace `Version: 1.3.1` with `Version: 1.3.2` in `style.css`.

- [ ] **Step 2: Run the full suite**

Run recursive PHP lint, JavaScript syntax checks, 18 Node unit tests, `php-static-check.php`, and browser QA at 1440, 1024, 768, 360, and 320 px.

Expected: all commands exit 0; modal, burger, forms, privacy, cookies, images, fonts, console, and overflow checks pass.

- [ ] **Step 3: Rebuild and inspect the archive**

Replace `global-english.zip` from the theme directory and inspect entries using `System.IO.Compression.ZipFile`.

Expected: one `global-english/` root, version 1.3.2, `global-english/assets/icons/chevron-down.svg` present, and no temporary files.

- [ ] **Step 4: Refresh the live preview**

Reload `http://127.0.0.1:8765/global-english/tests/preview.php` and visually confirm the arrow spacing in the inline and modal forms.
