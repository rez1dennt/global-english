# Select Arrow Rotation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the shared language-select arrow from 0° to 180° while the native picker is open and return it smoothly when the picker closes.

**Architecture:** Keep the native selects and existing SVG asset. Move only the decorative rendering from the replaced select element to its `.form-field` wrapper pseudo-element, drive rotation through the native `:open` state, and verify the real open/close cycle through Chrome DevTools Protocol.

**Tech Stack:** WordPress classic theme, token-driven vanilla CSS, native HTML select, Node.js CDP browser QA.

## Global Constraints

- No custom JavaScript dropdown and no changes to the form markup or submitted values.
- Preserve the 16 px right inset and 40 px text-safe area from version 1.3.2.
- Use `var(--motion-base)` and `var(--ease-out)` for the transition.
- Keep `pointer-events: none`, reduced-motion behavior, and the native forced-colors fallback.
- Package the verified theme as version 1.3.3.

---

### Task 1: Add a failing rotation contract

**Files:**
- Modify: `global-english/tests/php-static-check.php`
- Modify: `global-english/tests/browser-qa.mjs`

**Interfaces:**
- Consumes: `main.css`, both rendered `.form-field select` controls, and CDP `Runtime.evaluate`/`CSS.forcePseudoState`.
- Produces: assertions for the wrapper pseudo-element, native `:open` support, 180° open transform, and identity closed transform.

- [ ] **Step 1: Add static CSS assertions**

Require all of these production fragments:

```php
foreach ([
    '.form-field:has(> select)::after',
    'pointer-events: none',
    'transition: transform var(--motion-base) var(--ease-out)',
    '.form-field:has(> select:open)::after',
    'transform: rotate(180deg)',
] as $selectRotationContract) {
    check_contract(str_contains($mainCss, $selectRotationContract), 'Missing select rotation contract: ' . $selectRotationContract);
}
```

- [ ] **Step 2: Add a browser open/close assertion**

Assert `CSS.supports('selector(select:open)')`, record the wrapper `::after` transform, force Chrome's native `open` pseudo-state through `CSS.forcePseudoState`, wait for `var(--motion-base)`, assert a non-identity transform, clear the pseudo-state, then assert that the transform returns to identity.

- [ ] **Step 3: Verify RED**

Run `php global-english/tests/php-static-check.php` and browser QA.

Expected: static and browser checks fail because the SVG is still painted as the select background and no rotatable wrapper pseudo-element exists.

---

### Task 2: Implement the shared CSS animation

**Files:**
- Modify: `global-english/assets/css/main.css`

**Interfaces:**
- Consumes: `.form-field`, its direct child `select`, `chevron-down.svg`, and existing spacing/motion tokens.
- Produces: one decorative arrow shared by inline and modal forms.

- [ ] **Step 1: Move arrow rendering to the wrapper**

Set `.form-field` to `position: relative`, keep the select padding and `appearance: none`, remove its background-image declarations, and create:

```css
.form-field:has(> select)::after {
    content: "";
    position: absolute;
    width: var(--space-4);
    height: var(--space-4);
    inset-block-start: calc((var(--control-height) - var(--space-4)) / 2);
    inset-inline-end: var(--space-4);
    transform: rotate(0deg);
    background: url("../icons/chevron-down.svg") center / contain no-repeat;
    pointer-events: none;
    transition: transform var(--motion-base) var(--ease-out);
}
```

- [ ] **Step 2: Add native open-state rotation**

Add:

```css
.form-field:has(> select:open)::after { transform: rotate(180deg); }
```

Inside `forced-colors: active`, hide the decorative pseudo-element while keeping the select at `appearance: auto`.

- [ ] **Step 3: Verify GREEN**

Run the static and CDP tests.

Expected: the open state reaches 180°, Escape restores 0°, both forms retain their padding and SVG, and all existing browser interactions pass.

---

### Task 3: Release version 1.3.3

**Files:**
- Modify: `global-english/style.css`
- Replace: `global-english.zip`

**Interfaces:**
- Consumes: verified `global-english/` sources.
- Produces: the installable version 1.3.3 theme archive.

- [ ] **Step 1: Bump the version**

Replace `Version: 1.3.2` with `Version: 1.3.3`.

- [ ] **Step 2: Run the full suite**

Run recursive PHP lint, JavaScript syntax checks, 18 Node unit tests, the static contract, and CDP browser QA at 1440, 1024, 768, 360, and 320 px.

Expected: all commands exit 0; select animation, forms, modal, burger, privacy, cookies, resources, console, and overflow checks pass.

- [ ] **Step 3: Rebuild and validate the ZIP**

Replace `global-english.zip`, inspect it using `System.IO.Compression.ZipFile`, and require version 1.3.3, `chevron-down.svg`, the new CSS rotation contract, one `global-english/` root, and no temporary files.

- [ ] **Step 4: Refresh the preview**

Reload the local preview, manually open and close the dropdown, visually confirm smooth bidirectional rotation, and leave the PHP server running.
