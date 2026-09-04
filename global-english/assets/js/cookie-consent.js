(function (root) {
    'use strict';

    var CONSENT_KEY = 'globalEnglishCookieConsentV1';
    var ALLOWED_VALUES = ['all', 'necessary'];

    function readConsent(storage) {
        try {
            var value = storage.getItem(CONSENT_KEY);
            return ALLOWED_VALUES.includes(value) ? value : null;
        } catch (error) {
            return null;
        }
    }

    function writeConsent(storage, value) {
        if (!ALLOWED_VALUES.includes(value)) {
            throw new Error('Unsupported cookie consent value');
        }
        storage.setItem(CONSENT_KEY, value);
        return value;
    }

    function clearConsent(storage) {
        storage.removeItem(CONSENT_KEY);
    }

    function initCookieConsent() {
        if (typeof document === 'undefined' || typeof window === 'undefined') {
            return;
        }

        var banner = document.querySelector('[data-cookie-banner]');
        var accept = document.querySelector('[data-cookie-accept]');
        var essential = document.querySelector('[data-cookie-essential]');
        var settings = document.querySelectorAll('[data-cookie-settings]');
        if (!banner || !accept || !essential) {
            return;
        }

        var closeTimer = 0;

        function openBanner(returnFocus) {
            window.clearTimeout(closeTimer);
            banner.inert = false;
            banner.setAttribute('aria-hidden', 'false');
            banner.dataset.state = 'open';
            if (returnFocus) {
                window.setTimeout(function () { accept.focus({ preventScroll: true }); }, 30);
            }
        }

        function closeBanner() {
            banner.dataset.state = 'closing';
            banner.setAttribute('aria-hidden', 'true');
            closeTimer = window.setTimeout(function () {
                banner.dataset.state = 'closed';
                banner.inert = true;
            }, 380);
        }

        function choose(value) {
            try {
                writeConsent(window.localStorage, value);
            } catch (error) {
                /* The choice still closes the notice when storage is unavailable. */
            }
            closeBanner();
        }

        accept.addEventListener('click', function () { choose('all'); });
        essential.addEventListener('click', function () { choose('necessary'); });
        settings.forEach(function (button) {
            button.addEventListener('click', function () { openBanner(true); });
        });

        if (readConsent(window.localStorage)) {
            banner.dataset.state = 'closed';
            banner.inert = true;
            banner.setAttribute('aria-hidden', 'true');
        } else {
            openBanner(false);
        }
    }

    root.GlobalEnglishCookie = {
        CONSENT_KEY: CONSENT_KEY,
        readConsent: readConsent,
        writeConsent: writeConsent,
        clearConsent: clearConsent,
        initCookieConsent: initCookieConsent,
    };
}(typeof globalThis !== 'undefined' ? globalThis : this));
