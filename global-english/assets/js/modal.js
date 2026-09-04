(function (root) {
    'use strict';

    function focusableElements(container) {
        return Array.from(container.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));
    }

    function initEnrollmentModal(options) {
        if (typeof document === 'undefined' || typeof window === 'undefined') {
            return null;
        }

        var modal = document.querySelector('[data-enrollment-modal]');
        var dialog = modal ? modal.querySelector('[data-modal-dialog]') : null;
        var closeButton = modal ? modal.querySelector('[data-modal-close]') : null;
        var backdrop = modal ? modal.querySelector('[data-modal-backdrop]') : null;
        var triggers = document.querySelectorAll('[data-enrollment-modal-trigger]');
        if (!modal || !dialog || !closeButton || !backdrop || !triggers.length) {
            return null;
        }

        var scrollLock = options && options.scrollLock ? options.scrollLock : null;
        var lastTrigger = null;
        var closeTimer = 0;
        var backgroundState = [];

        function setBackgroundInert() {
            backgroundState = Array.from(document.body.children)
                .filter(function (element) {
                    return element !== modal && !['SCRIPT', 'STYLE'].includes(element.tagName);
                })
                .map(function (element) {
                    var snapshot = {
                        element: element,
                        inert: element.inert,
                        ariaHidden: element.getAttribute('aria-hidden'),
                    };
                    element.inert = true;
                    element.setAttribute('aria-hidden', 'true');
                    return snapshot;
                });
        }

        function restoreBackground() {
            backgroundState.forEach(function (snapshot) {
                snapshot.element.inert = snapshot.inert;
                if (snapshot.ariaHidden === null) {
                    snapshot.element.removeAttribute('aria-hidden');
                } else {
                    snapshot.element.setAttribute('aria-hidden', snapshot.ariaHidden);
                }
            });
            backgroundState = [];
        }

        function openModal(trigger) {
            if (modal.dataset.state === 'open' || modal.dataset.state === 'opening') {
                return;
            }
            window.clearTimeout(closeTimer);
            lastTrigger = trigger || document.activeElement;
            if (scrollLock) {
                scrollLock.lock();
            }
            setBackgroundInert();
            modal.inert = false;
            modal.setAttribute('aria-hidden', 'false');
            modal.dataset.state = 'opening';
            window.requestAnimationFrame(function () {
                modal.dataset.state = 'open';
                var firstField = dialog.querySelector('input:not([type="hidden"]):not([tabindex="-1"])');
                (firstField || dialog).focus({ preventScroll: true });
            });
        }

        function finishClose(returnFocus) {
            modal.dataset.state = 'closed';
            modal.setAttribute('aria-hidden', 'true');
            modal.inert = true;
            restoreBackground();
            if (scrollLock) {
                scrollLock.unlock();
            }
            if (returnFocus && lastTrigger && typeof lastTrigger.focus === 'function') {
                lastTrigger.focus({ preventScroll: true });
            }
            lastTrigger = null;
        }

        function closeModal(returnFocus) {
            if (modal.dataset.state !== 'open' && modal.dataset.state !== 'opening') {
                return;
            }
            modal.dataset.state = 'closing';
            var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            closeTimer = window.setTimeout(function () {
                finishClose(returnFocus !== false);
            }, reduceMotion ? 0 : 360);
        }

        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', function (event) {
                event.preventDefault();
                openModal(trigger);
            });
        });
        closeButton.addEventListener('click', function () { closeModal(true); });
        backdrop.addEventListener('click', function () { closeModal(true); });

        document.addEventListener('keydown', function (event) {
            if (modal.dataset.state !== 'open') {
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                closeModal(true);
                return;
            }
            if (event.key !== 'Tab') {
                return;
            }
            var focusable = focusableElements(dialog);
            if (!focusable.length) {
                event.preventDefault();
                dialog.focus({ preventScroll: true });
                return;
            }
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

        var parameters = new URLSearchParams(window.location.search);
        if (parameters.get('form_source') === 'modal' && parameters.get('form_status')) {
            openModal(null);
        }

        return { open: openModal, close: closeModal };
    }

    root.GlobalEnglishModal = {
        initEnrollmentModal: initEnrollmentModal,
    };
}(typeof globalThis !== 'undefined' ? globalThis : this));
