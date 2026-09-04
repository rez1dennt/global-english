# Contextual CTA Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace misleading one-page button labels with approved contextual calls to action while preserving all current links, modal behavior, and form behavior.

**Architecture:** Keep the existing WordPress PHP templates and JavaScript untouched except for visible button copy. Extend the existing static contract test first, then change the minimum template text, verify the actual browser behavior at representative widths, and rebuild the installable theme archive.

**Tech Stack:** WordPress classic theme, PHP, vanilla JavaScript, CSS, Node.js browser QA, PowerShell archive tooling.

## Global Constraints

- Use exactly the Russian labels approved in `docs/superpowers/specs/2026-09-03-contextual-cta-copy-design.md`.
- Keep `href`, modal data attributes, form attributes, validation, phone mask, and lower inline form unchanged.
- Keep «Узнать больше» and «Начать обучение» unchanged.
- Exactly six elements must retain `data-enrollment-modal-trigger`.
- The installable ZIP must contain one `global-english/` root and no temporary files.

---

### Task 1: Lock the approved copy in the static contract

**Files:**
- Modify: `global-english/tests/php-static-check.php`

**Interfaces:**
- Consumes: `$header` and `$frontPage`, which contain the production templates as strings.
- Produces: failing assertions for the exact new labels and forbidden legacy labels.

- [ ] **Step 1: Write the failing test**

Add assertions that require the exact trigger-label sequence and two identical form-submit labels:

```php
$expectedModalTriggerLabels = [
    'Записаться на пробный урок',
    'Попробовать бесплатно',
    'Подобрать курс',
    'Попробовать методику',
    'Начать обучение',
    'Записаться на пробный урок',
];
preg_match_all('/<a[^>]*data-enrollment-modal-trigger[^>]*>(.*?)<\/a>/su', $header . $frontPage, $ctaMatches);
$actualModalTriggerLabels = array_map(
    static fn(string $label): string => trim(strip_tags($label)),
    $ctaMatches[1] ?? []
);
check_contract($actualModalTriggerLabels === $expectedModalTriggerLabels, 'Enrollment CTA labels must match the approved contextual copy');
check_contract(substr_count($frontPage, '>Записаться на пробный урок</button>') === 2, 'Both form submit buttons must use the trial-lesson CTA');
foreach (['Все курсы', 'Подробнее о методике', 'Смотреть больше фото'] as $legacyLabel) {
    check_contract(!str_contains($header . $frontPage, '>' . $legacyLabel . '</a>'), 'Legacy CTA label is forbidden: ' . $legacyLabel);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php global-english/tests/php-static-check.php`

Expected: `Theme foundation: FAIL` with the contextual-copy assertion because production templates still contain old labels.

- [ ] **Step 3: Review the failure**

Confirm the failure is caused only by the missing approved copy; fix the test itself first if it reports a parsing error.

---

### Task 2: Apply the approved CTA copy

**Files:**
- Modify: `global-english/header.php`
- Modify: `global-english/front-page.php`

**Interfaces:**
- Consumes: existing anchors, `data-enrollment-modal-trigger`, and existing inline/modal forms.
- Produces: the approved visible labels without structural or behavioral changes.

- [ ] **Step 1: Write the minimal production change**

Replace visible text only:

```text
Header: Записаться на пробный урок
Hero: Попробовать бесплатно
Courses: Подобрать курс
Method: Попробовать методику
Opportunities: Начать обучение
Classes: Записаться на пробный урок
Inline form submit: Записаться на пробный урок
Modal form submit: Записаться на пробный урок
```

- [ ] **Step 2: Run the static contract to verify GREEN**

Run: `php global-english/tests/php-static-check.php`

Expected: `Theme foundation: PASS`.

- [ ] **Step 3: Run syntax checks**

Run PHP lint recursively and `node --check` for every JavaScript file in `global-english/assets/js`.

Expected: no PHP syntax errors and no JavaScript syntax errors.

---

### Task 3: Verify the real one-page interactions

**Files:**
- Modify: `global-english/tests/browser-qa.mjs`

**Interfaces:**
- Consumes: the live preview at `http://127.0.0.1:8765/global-english/tests/preview.php` and Chrome DevTools Protocol.
- Produces: regression coverage for the ordered CTA labels plus existing modal, responsive, privacy, cookie, and overflow checks.

- [ ] **Step 1: Add the exact browser assertion**

Read the normalized text of all `[data-enrollment-modal-trigger]` elements and compare it to:

```js
[
  'Записаться на пробный урок',
  'Попробовать бесплатно',
  'Подобрать курс',
  'Попробовать методику',
  'Начать обучение',
  'Записаться на пробный урок',
]
```

- [ ] **Step 2: Run browser QA**

Run: `$env:CHROME_DEBUG_PORT='9224'; node global-english/tests/browser-qa.mjs`

Expected: every configured viewport passes, all six CTA triggers open the modal, forms submit correctly, and no horizontal overflow is reported.

- [ ] **Step 3: Inspect the visible preview**

Reload the in-app browser, confirm the updated text is readable at desktop and mobile widths, and click a representative CTA to confirm it opens the existing enrollment dialog.

---

### Task 4: Version and package the WordPress theme

**Files:**
- Modify: `global-english/style.css`
- Modify: `global-english/functions.php`
- Replace: `global-english.zip`

**Interfaces:**
- Consumes: verified theme directory `global-english/`.
- Produces: version `1.3.1` installable archive with the same root directory.

- [ ] **Step 1: Bump theme and asset version**

Set the WordPress theme header and runtime asset version to `1.3.1`.

- [ ] **Step 2: Re-run the full automated suite**

Run PHP lint, JavaScript syntax checks, Node unit tests, the static theme contract, and browser QA.

Expected: every command exits with code 0 and browser console errors remain empty.

- [ ] **Step 3: Rebuild and inspect the archive**

Create `global-english.zip` from the `global-english/` directory and list its entries.

Expected: every entry is under `global-english/`, required theme files are present, and no test output, browser profile, cache, or temporary files are included.

- [ ] **Step 4: Leave the verified preview running**

Keep the PHP preview server available at the existing local URL and mark the browser tab as the deliverable.
