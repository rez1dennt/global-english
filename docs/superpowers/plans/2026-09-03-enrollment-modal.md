# Enrollment Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить доступную модальную форму ко всем CTA, ведущим к нижней форме, не удаляя существующую форму и не создавая скачков прокрутки.

**Architecture:** Модалка реализуется отдельным UMD-модулем `modal.js`, но использует общий singleton scroll-lock вместе с бургером. Две формы имеют уникальные ID, общий POST-обработчик WordPress, одинаковую клиентскую валидацию и параметр `form_source`, определяющий место показа серверного ответа.

**Tech Stack:** PHP 8+, WordPress classic theme, vanilla JavaScript, CSS, Node.js test runner, Chrome DevTools Protocol.

## Global Constraints

- Нижняя форма остаётся на странице.
- Модалку открывают только `.button`, которые на главной ведут к `#contacts`; навигационные ссылки продолжают прокрутку.
- AJAX, ACF, CRM и внешние библиотеки не добавляются.
- Модалка поддерживает клавиатуру, Escape, backdrop, возврат фокуса и reduced motion.
- Проверяются 1280, 768, 360 и 320 px; Git-операции не выполняются.

---

### Task 1: Разделяемый scroll-lock

**Files:**
- Modify: `global-english/tests/scroll-lock.test.mjs`
- Modify: `global-english/assets/js/scroll-lock.js`
- Modify: `global-english/assets/js/main.js`

**Interfaces:**
- Produces: `getSharedScrollLock(window, document)`.
- Produces: reference-counted `lock()` / `unlock()`; стили восстанавливаются только при глубине `0`.

- [x] Добавить failing-тест: два `lock()` и один `unlock()` сохраняют блокировку и компенсацию.
- [x] Запустить тест и подтвердить ошибочное преждевременное восстановление.
- [x] Реализовать счётчик и общий singleton; передать один экземпляр меню и модалке.
- [x] Запустить focused-тест до полного PASS.

### Task 2: Разметка, стили и общая форма

**Files:**
- Create: `global-english/assets/js/modal.js`
- Modify: `global-english/front-page.php`
- Modify: `global-english/header.php`
- Modify: `global-english/functions.php`
- Modify: `global-english/assets/js/main.js`
- Modify: `global-english/assets/css/main.css`
- Modify: `global-english/tests/preview.php`
- Modify: `global-english/tests/php-static-check.php`

**Interfaces:**
- Produces: `[data-enrollment-modal]`, `[data-enrollment-modal-trigger]`, `[data-modal-close]`, `[data-modal-backdrop]`.
- Produces: две формы `[data-trial-form][data-form-source]` со значениями `inline` и `modal`.
- Consumes: `GlobalEnglishScrollLock.getSharedScrollLock()` и существующий `global_english_trial` POST action.

- [x] Добавить failing static contracts для диалога, уникальных ID, CTA-триггеров, двух источников форм и enqueue `modal.js`.
- [x] Запустить static test и подтвердить RED на отсутствующей модалке.
- [x] Добавить модальную разметку с уникальными field/error ID и сохранить нижнюю форму.
- [x] Пометить CTA-триггеры, не затрагивая ссылки навигации.
- [x] Добавить CSS состояний `closed/opening/open/closing`, адаптивную высоту, backdrop и focus-visible.
- [x] Реализовать `modal.js`: открытие, closing transition, backdrop, Escape, focus trap, возврат фокуса, shared scroll-lock и автооткрытие при `form_source=modal`.
- [x] Переписать `initForm()` на инициализацию всех форм независимо.
- [x] Добавить `form_source` в серверный redirect и показывать status только в исходной форме.
- [x] Запустить static/unit checks до PASS.

### Task 3: Browser QA и пакет

**Files:**
- Modify: `global-english/tests/browser-qa.mjs`
- Modify: `global-english/style.css`
- Modify: `global-english/README.md`
- Modify: `global-english/screenshot.png`
- Modify: `global-english.zip`

**Interfaces:**
- Consumes: завершённую модалку и обе формы.
- Produces: installable ZIP rooted at `global-english/`.

- [x] Добавить browser assertions для всех CTA, open/closing/closed, фокуса, Tab-цикла, Escape, backdrop, scroll restoration, стабильной шапки и modal validation.
- [x] Запустить browser QA на главной и политике при 1280/768/360/320 без overflow, console errors и broken resources.
- [x] Запустить PHP lint, JS syntax,  все Node tests и static contract.
- [x] Обновить версию темы, README и WordPress preview.
- [x] Пересобрать ZIP и проверить корень архива и отсутствие QA-файлов.
