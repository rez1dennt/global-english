(function () {
    'use strict';

    document.documentElement.classList.add('js');

    function focusableElements(container) {
        return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    }

    function initMenu(scrollLock) {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-menu-panel]');
        if (!toggle || !panel) {
            return;
        }

        var scrollPosition = 0;
        var closeTimer = 0;

        function isMobileMenu() {
            return window.matchMedia('(max-width: 60rem)').matches;
        }

        function setClosedState() {
            panel.dataset.state = 'closed';
            if (isMobileMenu()) {
                panel.inert = true;
                panel.setAttribute('aria-hidden', 'true');
            } else {
                panel.inert = false;
                panel.setAttribute('aria-hidden', 'false');
            }
        }

        function openMenu() {
            window.clearTimeout(closeTimer);
            scrollPosition = scrollLock ? scrollLock.lock() : window.scrollY;
            toggle.setAttribute('aria-expanded', 'true');
            toggle.setAttribute('aria-label', 'Закрыть меню');
            panel.dataset.state = 'open';
            panel.inert = false;
            panel.setAttribute('aria-hidden', 'false');
            if (!scrollLock) {
                document.body.style.top = '-' + scrollPosition + 'px';
                document.body.classList.add('menu-open');
            }
            var focusable = focusableElements(panel);
            if (focusable[0]) {
                focusable[0].focus();
            }
        }

        function closeMenu(returnFocus) {
            if (toggle.getAttribute('aria-expanded') !== 'true') {
                return;
            }
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Открыть меню');
            panel.dataset.state = 'closing';
            panel.inert = true;
            panel.setAttribute('aria-hidden', 'true');
            if (scrollLock) {
                scrollLock.unlock();
            } else {
                document.body.classList.remove('menu-open');
                document.body.style.top = '';
                window.scrollTo({ top: scrollPosition, left: 0, behavior: 'instant' });
            }
            closeTimer = window.setTimeout(setClosedState, 360);
            if (returnFocus) {
                toggle.focus({ preventScroll: true });
            }
        }

        toggle.addEventListener('click', function () {
            if (toggle.getAttribute('aria-expanded') === 'true') {
                closeMenu(false);
            } else {
                openMenu();
            }
        });

        panel.addEventListener('click', function (event) {
            if (event.target.closest('a[href^="#"]')) {
                closeMenu(false);
            }
        });

        document.addEventListener('pointerdown', function (event) {
            if (toggle.getAttribute('aria-expanded') === 'true' && !panel.contains(event.target) && !toggle.contains(event.target)) {
                closeMenu(false);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (toggle.getAttribute('aria-expanded') !== 'true') {
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu(true);
                return;
            }
            if (event.key !== 'Tab') {
                return;
            }
            var focusable = [toggle].concat(focusableElements(panel));
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 960) {
                closeMenu(false);
                setClosedState();
            } else if (toggle.getAttribute('aria-expanded') !== 'true') {
                setClosedState();
            }
        });

        setClosedState();
    }

    function initSmoothAnchors() {
        document.addEventListener('click', function (event) {
            if (event.defaultPrevented) {
                return;
            }
            var link = event.target.closest('a[href^="#"]');
            if (!link) {
                return;
            }
            var selector = link.getAttribute('href');
            if (!selector || selector === '#') {
                return;
            }
            var target = document.querySelector(selector);
            if (!target) {
                return;
            }
            event.preventDefault();
            var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            window.setTimeout(function () {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
                target.addEventListener('blur', function cleanup() {
                    target.removeAttribute('tabindex');
                }, { once: true });
            }, reduceMotion ? 0 : 420);
        });
    }

    function initPhoneMask() {
        var phone = window.GlobalEnglishPhone;
        var inputs = document.querySelectorAll('[data-phone-input]');
        if (!phone || !inputs.length) {
            return;
        }

        inputs.forEach(function (input) {
            input.addEventListener('beforeinput', function (event) {
                if (event.inputType === 'insertFromPaste' || event.isComposing) {
                    return;
                }
                if (!event.inputType.startsWith('insert') && !event.inputType.startsWith('delete')) {
                    return;
                }
                event.preventDefault();
                var result = phone.editRussianPhone(
                    input.value,
                    input.selectionStart || 0,
                    input.selectionEnd || 0,
                    event.inputType,
                    event.data || ''
                );
                input.value = result.value;
                input.setSelectionRange(result.caret, result.caret);
                input.dispatchEvent(new Event('maskchange', { bubbles: true }));
            });

            input.addEventListener('paste', function (event) {
                event.preventDefault();
                var text = event.clipboardData ? event.clipboardData.getData('text') : '';
                var result = phone.editRussianPhone(
                    input.value,
                    input.selectionStart || 0,
                    input.selectionEnd || 0,
                    'insertText',
                    text
                );
                input.value = result.value;
                input.setSelectionRange(result.caret, result.caret);
                input.dispatchEvent(new Event('maskchange', { bubbles: true }));
            });

            input.addEventListener('input', function () {
                var formatted = phone.formatRussianPhone(input.value);
                if (formatted !== input.value) {
                    input.value = formatted;
                }
            });
        });
    }

    function setFieldError(field, message) {
        var errorId = field.getAttribute('aria-describedby');
        var error = errorId ? document.getElementById(errorId) : null;
        field.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (error) {
            error.textContent = message;
        }
    }

    function initForm() {
        var forms = document.querySelectorAll('[data-trial-form]');
        if (!forms.length) {
            return;
        }

        forms.forEach(function (form) {
            initFormInstance(form);
        });
    }

    function initFormInstance(form) {

        var name = form.elements.name || form.querySelector('[data-demo-name="name"]');
        var phoneInput = form.elements.phone || form.querySelector('[data-demo-name="phone"]');
        var consent = form.elements.consent;
        var submit = form.querySelector('[type="submit"]');
        var status = form.querySelector('[data-form-status]');
        var phone = window.GlobalEnglishPhone;

        if (!name || !phoneInput || !consent || !submit || !status) {
            return;
        }

        var statusMessages = {
            success: ['success', 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.'],
            validation_error: ['error', 'Проверьте данные формы и отправьте заявку ещё раз.'],
            rate_limited: ['error', 'Заявка уже отправлена. Подождите минуту перед повторной отправкой.'],
            mail_error: ['error', 'Не удалось отправить заявку. Позвоните нам по телефону.'],
            security_error: ['error', 'Страница устарела. Обновите её и повторите отправку.'],
            invalid_request: ['error', 'Не удалось обработать запрос. Обновите страницу.'],
        };
        var serverStatus = new URLSearchParams(window.location.search).get('form_status');
        var serverSource = new URLSearchParams(window.location.search).get('form_source') || 'inline';
        var formSource = form.dataset.formSource || 'inline';
        if (serverStatus && statusMessages[serverStatus] && serverSource === formSource) {
            status.dataset.status = statusMessages[serverStatus][0];
            status.textContent = statusMessages[serverStatus][1];
        }

        [name, phoneInput, consent].forEach(function (field) {
            field.addEventListener('input', function () {
                setFieldError(field, '');
            });
            field.addEventListener('change', function () {
                setFieldError(field, '');
            });
        });

        form.addEventListener('submit', function (event) {
            var firstInvalid = null;
            var nameValue = name.value.trim();

            if (Array.from(nameValue).length < 2 || Array.from(nameValue).length > 80) {
                setFieldError(name, 'Укажите имя от 2 до 80 символов.');
                firstInvalid = firstInvalid || name;
            } else {
                setFieldError(name, '');
            }

            if (!phone || !phone.isValidRussianPhone(phoneInput.value)) {
                setFieldError(phoneInput, 'Введите телефон полностью: +7 (999) 999-99-99.');
                firstInvalid = firstInvalid || phoneInput;
            } else {
                setFieldError(phoneInput, '');
            }

            if (!consent.checked) {
                setFieldError(consent, 'Подтвердите согласие на обработку данных.');
                firstInvalid = firstInvalid || consent;
            } else {
                setFieldError(consent, '');
            }

            if (firstInvalid) {
                event.preventDefault();
                status.dataset.status = 'error';
                status.textContent = 'Исправьте отмеченные поля.';
                firstInvalid.focus();
                return;
            }

            submit.disabled = true;
            submit.setAttribute('aria-busy', 'true');
            submit.textContent = 'Отправляем...';
            status.textContent = '';
        });
    }

    function initPriceDisclosure() {
        document.querySelectorAll('[data-price-disclosure]').forEach(function (details) {
            var summary = details.querySelector('[aria-controls="price-disclosure-content"]');
            var content = details.querySelector('[data-disclosure-content]');
            if (!summary || !content) { return; }
            var openTimer = 0;
            var timer = 0;
            var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

            function finishClose() {
                window.clearTimeout(timer);
                window.clearTimeout(openTimer);
                if (details.dataset.state !== 'closing') { return; }
                details.dataset.state = 'closed';
                content.inert = true;
            }
            function open() {
                window.clearTimeout(timer);
                details.dataset.state = 'opening';
                content.inert = false;
                content.setAttribute('aria-hidden', 'false');
                summary.setAttribute('aria-expanded', 'true');
                if (reduceMotion.matches) { details.dataset.state = 'open'; return; }
                void content.offsetHeight;
                openTimer = window.setTimeout(function () { details.dataset.state = 'open'; }, 30);
            }
            function close() {
                window.clearTimeout(timer);
                window.clearTimeout(openTimer);
                summary.setAttribute('aria-expanded', 'false');
                content.setAttribute('aria-hidden', 'true');
                if (reduceMotion.matches) { details.dataset.state = 'closing'; finishClose(); return; }
                details.dataset.state = 'closing';
                var duration = parseFloat(window.getComputedStyle(content).transitionDuration) * 1000 || 420;
                timer = window.setTimeout(finishClose, duration + 80);
            }
            summary.addEventListener('click', function (event) {
                event.preventDefault();
                if (details.dataset.state === 'open' || details.dataset.state === 'opening') { close(); }
                else { open(); }
            });
            details.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && details.dataset.state !== 'closed') {
                    event.preventDefault(); close(); summary.focus({ preventScroll: true });
                }
            });
            content.addEventListener('transitionend', function (event) {
                if (event.target === content && event.propertyName === 'grid-template-rows') { finishClose(); }
            });
            details.dataset.state = 'closed';
            content.inert = true;
            content.setAttribute('aria-hidden', 'true');
            summary.setAttribute('aria-expanded', 'false');
        });
    }

    function initTeacherSlider() {
        var slider = document.querySelector('[data-teacher-slider]');
        if (!slider) { return; }
        var viewport = slider.querySelector('[data-slider-viewport]');
        var track = slider.querySelector('[data-slider-track]');
        var previous = slider.querySelector('[data-slider-prev]');
        var next = slider.querySelector('[data-slider-next]');
        var counter = slider.querySelector('[data-slider-count]');
        var status = slider.querySelector('#teacher-slider-status');
        var originals = Array.from(track.children);
        var total = originals.length;
        if (!total || !viewport) { return; }
        var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        var index = 0, physical = total, visible = 4, step = 0;
        var moving = false, queued = 0, timer = 0, pointer = null;
        var before = document.createDocumentFragment();
        var after = document.createDocumentFragment();

        function clone(card) {
            var copy = card.cloneNode(true);
            copy.setAttribute('data-slider-clone', '');
            copy.setAttribute('aria-hidden', 'true');
            copy.inert = true;
            copy.removeAttribute('id');
            copy.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
            return copy;
        }
        originals.forEach(function (card) { before.appendChild(clone(card)); after.appendChild(clone(card)); });
        track.prepend(before);
        track.appendChild(after);
        track.querySelectorAll('img').forEach(function (img) { img.loading = 'eager'; });
        slider.classList.add('is-ready');

        function normalize(value) { return ((value % total) + total) % total; }
        function position(instant) {
            track.style.transition = instant ? 'none' : '';
            track.style.transform = 'translate3d(' + (-physical * step) + 'px,0,0)';
            if (instant) { void track.offsetWidth; track.style.transition = ''; }
        }
        function update(announce) {
            index = normalize(physical - total);
            slider.dataset.index = String(index);
            slider.dataset.total = String(total);
            if (counter) { counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0'); }
            originals.forEach(function (card, i) { card.setAttribute('aria-hidden', String(normalize(i - index) >= visible)); });
            if (announce && status) { status.textContent = 'Фотография ' + (index + 1) + ' из ' + total; }
        }
        function finish() {
            if (!moving) { return; }
            window.clearTimeout(timer);
            physical = total + normalize(physical - total);
            position(true);
            moving = false;
            slider.dataset.moving = 'false';
            if (queued) { var direction = queued > 0 ? 1 : -1; queued -= direction; move(direction); }
        }
        function move(direction) {
            if (total <= visible) { return; }
            if (moving) { queued = Math.max(-total, Math.min(total, queued + direction)); return; }
            moving = true;
            slider.dataset.moving = 'true';
            physical += direction;
            update(true);
            position(motion.matches);
            if (motion.matches) { finish(); }
            else {
                var duration = parseFloat(window.getComputedStyle(track).transitionDuration) * 1000 || 300;
                timer = window.setTimeout(finish, duration + 100);
            }
        }
        function layout() {
            window.clearTimeout(timer); moving = false; queued = 0;
            slider.dataset.moving = 'false';
            visible = Math.min(total, window.matchMedia('(max-width: 40rem)').matches ? 1 : (window.matchMedia('(max-width: 60rem)').matches ? 2 : 4));
            slider.style.setProperty('--teacher-visible', String(visible));
            var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
            step = originals[0].getBoundingClientRect().width + gap;
            physical = total + index;
            position(true);
            previous.disabled = next.disabled = total <= visible;
            update(false);
        }
        previous.addEventListener('click', function () { move(-1); });
        next.addEventListener('click', function () { move(1); });
        track.addEventListener('transitionend', function (event) { if (event.target === track && event.propertyName === 'transform') { finish(); } });
        viewport.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
        });
        viewport.addEventListener('pointerdown', function (event) {
            if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) { return; }
            pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
            viewport.setPointerCapture(event.pointerId);
        });
        viewport.addEventListener('pointerup', function (event) {
            if (!pointer || pointer.id !== event.pointerId) { return; }
            var dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
            pointer = null;
            if (viewport.hasPointerCapture(event.pointerId)) { viewport.releasePointerCapture(event.pointerId); }
            if (Math.abs(dx) >= 35 && Math.abs(dx) > Math.abs(dy) * 1.2) { move(dx < 0 ? 1 : -1); }
        });
        viewport.addEventListener('pointercancel', function () { pointer = null; });
        viewport.addEventListener('dragstart', function (event) { event.preventDefault(); });
        window.addEventListener('resize', layout);
        if (motion.addEventListener) { motion.addEventListener('change', layout); }
        layout();
    }

    function initReveal() {
        var elements = document.querySelectorAll('[data-reveal]');
        if (!elements.length) {
            return;
        }
        if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            elements.forEach(function (element) { element.dataset.revealed = 'true'; });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.dataset.revealed = 'true';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
        elements.forEach(function (element, index) {
            element.style.setProperty('--reveal-index', String(index % 4));
            observer.observe(element);
        });
    }

    function init() {
        var scrollLock = window.GlobalEnglishScrollLock
            ? window.GlobalEnglishScrollLock.getSharedScrollLock(window, document)
            : null;
        initMenu(scrollLock);
        initSmoothAnchors();
        initPhoneMask();
        initForm();
        initPriceDisclosure();
        initTeacherSlider();
        initReveal();
        if (window.GlobalEnglishModal) {
            window.GlobalEnglishModal.initEnrollmentModal({ scrollLock: scrollLock });
        }
        if (window.GlobalEnglishCookie) {
            window.GlobalEnglishCookie.initCookieConsent();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
