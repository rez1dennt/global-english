# Global English Visual Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Исправить hero и CTA по увеличенным референсам, улучшить типографику, иконки и анимации, добавить политику конфиденциальности и управление cookie.

**Architecture:** Существующая классическая WordPress-тема сохраняется. Hero получает отдельный адаптивный фоновый слой, CTA — точную векторную иллюстрацию, шрифты подключаются локально, а cookie-состояние реализуется отдельным чистым модулем с проверяемым API. Политика — отдельный шаблон страницы с безопасным созданием страницы при активации темы.

**Tech Stack:** PHP 8.0+, WordPress 6.4+, CSS, vanilla JavaScript, Node.js test runner, local WOFF2, WebP/SVG.

## Global Constraints

- Основные секции имеют белый фон `#FFFFFF`.
- Hero содержит Биг-Бен с автобусом, светлый skyline и китайскую пагоду, как на увеличенном референсе.
- CTA содержит линейную иллюстрацию Биг-Бена, самолётиков, звёзд и реплик.
- Основной шрифт — локальный Manrope с кириллицей.
- SVG не используют CSS `filter`, внешние ссылки или скрипты.
- Анимации плавные, каскадные и имеют reduced-motion режим.
- Cookie-выбор хранится под ключом `globalEnglishCookieConsentV1`.
- Политика не содержит выдуманных реквизитов.

---

### Task 1: Точная фоновая композиция hero и CTA

**Files:**
- Create: `global-english/assets/images/hero-landmarks.webp`
- Modify: `global-english/front-page.php`
- Modify: `global-english/assets/icons/contact-doodle.svg`
- Modify: `global-english/assets/css/main.css`

**Interfaces:**
- Produces: `.hero__backdrop`, адаптивные кропы и обновлённый `.contact-panel__art`.

- [ ] Сгенерировать широкий фон без текста: детальный Биг-Бен и красный автобус слева, светлый лондонский skyline снизу, пагода справа, прозрачный центр под контент и портрет.
- [ ] Проверить изображение, оптимизировать WebP и сохранить в теме.
- [ ] Заменить CSS-геометрию на растровый фон и настроить desktop/mobile кропы.
- [ ] Перерисовать CTA-дудл по крупному референсу.
- [ ] Сравнить desktop hero и CTA с референсами.

### Task 2: Шрифт, фон и чёткие иконки

**Files:**
- Create: `global-english/assets/fonts/manrope-cyrillic.woff2`
- Modify: `global-english/assets/css/main.css`
- Modify: `global-english/assets/icons/*.svg`

**Interfaces:**
- Produces: `@font-face Manrope`, белый `--color-page`, SVG с прямыми цветами и единым штрихом.

- [ ] Подключить локальный Manrope с `font-display: swap`.
- [ ] Установить белый фон основных секций и оставить кремовый только для CTA.
- [ ] Удалить CSS-фильтрацию SVG и перекрасить исходные SVG напрямую.
- [ ] Проверить фактический загруженный шрифт и цвет фона в браузере.

### Task 3: Плавная motion-система

**Files:**
- Modify: `global-english/assets/css/main.css`
- Modify: `global-english/assets/js/main.js`

**Interfaces:**
- Produces: `initReveal()` с `--reveal-index`, мягкие hover-переходы и двусторонние состояния слоёв.

- [ ] Добавить браузерную проверку каскадных задержек.
- [ ] Увеличить длительности и применить одну мягкую easing-кривую.
- [ ] Назначать индекс внутри каждой группы карточек.
- [ ] Сохранить мгновенные конечные состояния под `prefers-reduced-motion`.

### Task 4: Политика конфиденциальности и cookie

**Files:**
- Create: `global-english/page-privacy-policy.php`
- Create: `global-english/assets/js/cookie-consent.js`
- Create: `global-english/tests/cookie-consent.test.mjs`
- Modify: `global-english/functions.php`
- Modify: `global-english/footer.php`
- Modify: `global-english/assets/css/main.css`
- Modify: `global-english/tests/preview.php`
- Modify: `global-english/tests/php-static-check.php`

**Interfaces:**
- Produces: `global_english_privacy_url(): string`, `global_english_ensure_privacy_page(): void`, `readConsent(storage): string|null`, `writeConsent(storage, value): string`.

- [ ] Сначала написать падающие тесты consent API и PHP-контрактов.
- [ ] Реализовать и подключить consent API.
- [ ] Добавить плашку, accept/reject/reopen, фокус и закрывающую анимацию.
- [ ] Создать шаблон политики и WordPress activation hook без перезаписи существующей страницы.
- [ ] Направить ссылки формы, плашки и подвала на privacy URL.
- [ ] Проверить пустое, принятое, отклонённое и повторно открытое состояния.

### Task 5: Релизная проверка и архив

**Files:**
- Modify: `global-english/README.md`
- Modify: `global-english/screenshot.png`
- Modify: `global-english.zip`

**Interfaces:**
- Produces: обновлённая устанавливаемая тема.

- [ ] Выполнить PHP lint, статический контракт, Node-тесты, SVG-санитизацию и token gates.
- [ ] Проверить 1280, 768, 360 и 320 px, hero/CTA, cookie, меню, форму, ресурсы и консоль.
- [ ] Обновить screenshot и README.
- [ ] Пересобрать ZIP, проверить единственную корневую папку и повторно запустить тесты из распакованного архива.

## Plan Self-Review

- Все замечания пользователя и оба увеличенных референса покрыты Tasks 1–4.
- Поведение cookie имеет чистый тестируемый API и отделено от DOM orchestration.
- Политика создаётся без выдуманных реквизитов и без перезаписи существующего контента.
- Git-коммиты не запланированы, потому что рабочая папка не является Git-репозиторием.
