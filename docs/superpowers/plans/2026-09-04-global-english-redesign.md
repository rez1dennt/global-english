# Global English Redesign Implementation Plan

> **For agentic workers:** Use executing-plans to implement task-by-task in this session. User approved autonomous execution.

**Goal:** Deliver a polished WordPress theme matching the new client specification and cyan/orange visual direction.

**Architecture:** Replace page content and shared visual tokens; retain tested menu, modal, mask, cookie modules. Consolidate the two forms in one PHP partial and centralize document/social configuration. Preserve the original ZIP outside the theme.

**Tech Stack:** PHP 8, classic WordPress theme, vanilla CSS/JS, local SVG/WebP, Node tests and Playwright MCP/CDP.

## Global Constraints

- All client facts come from the approved source-review ledger. No fabricated staff/photos/reviews/prices/legal details.
- No ACF, new dependencies, publishing, or real outbound test email.
- Apply edits with apply_patch; keep original supplied images and generated sources unchanged.

## Task 1 — RED content/form contract

- [x] Add `tests/redesign-contract.test.mjs` requiring approved cities/director/contact, shared form, recipient and no obsolete sections.
- [x] Run `node --test global-english/tests/redesign-contract.test.mjs`; expect failure on current legacy templates.

## Task 2 — Shared content and interface

- [x] Add `inc/content.php`, `template-parts/trial-form.php`, SVG logo and icon sprite; replace `front-page.php`, header/footer and `main.css` with the approved design.
- [x] Keep existing data attributes for menu/modal/cookie and use name/phone/consent only.
- [x] Adapt `functions.php` recipient and validation, `main.js` optional language removal, preview stubs and explicit demo POST result, privacy/consent routing and honest missing document states.
- [x] Preserve exact known facts and remove old fabricated statistics, courses, teachers, testimonials and gallery.

## Task 3 — Artwork and visual QA

- [x] Use the approved source banner with imagegen to create a pale-cyan portrait; optimize to local WebP using ImageMagick and retain provenance.
- [x] Test the page at 1440/1280/1024/768/360/320; inspect screenshots, both forms, menu, keyboard, cookie, reduced motion, console and loading.
- [x] Keep missing material states compact. No fake teacher photography or review content.

## Task 4 — Verification and handoff

- [x] Update static/browser contracts to the new approved structure; run all PHP syntax checks, JS syntax checks, Node unit/content tests and real browser scenarios.
- [x] Add installation/launch-input documentation and source-prompt ledger. Version 2.0.0.
- [x] Rebuild `global-english.zip`; validate root, asset inclusion, no dev/test debris, and content/version hashes.
- [x] Leave preview running; report verified result separately from legal/content/delivery launch dependencies.
