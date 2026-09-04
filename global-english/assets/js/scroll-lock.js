(function (root) {
    'use strict';

    function getScrollbarGap(innerWidth, clientWidth) {
        return Math.max(0, innerWidth - clientWidth);
    }

    function pixelValue(value) {
        var parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function createScrollLock(view, page) {
        var state = null;
        var owners = 0;

        function lock() {
            if (state) {
                owners += 1;
                return state.scrollY;
            }

            var body = page.body;
            var header = page.querySelector('[data-site-header]');
            var gap = getScrollbarGap(view.innerWidth, page.documentElement.clientWidth);
            state = {
                scrollY: view.scrollY,
                bodyTop: body.style.top,
                bodyPaddingRight: body.style.paddingRight,
                headerPaddingRight: header ? header.style.paddingRight : '',
            };
            owners = 1;

            body.style.top = '-' + state.scrollY + 'px';
            if (gap > 0) {
                body.style.paddingRight = pixelValue(view.getComputedStyle(body).paddingRight) + gap + 'px';
                if (header) {
                    header.style.paddingRight = pixelValue(view.getComputedStyle(header).paddingRight) + gap + 'px';
                }
            }
            body.classList.add('menu-open');
            return state.scrollY;
        }

        function unlock() {
            if (!state) {
                return;
            }

            owners = Math.max(0, owners - 1);
            if (owners > 0) {
                return;
            }

            var body = page.body;
            var header = page.querySelector('[data-site-header]');
            var scrollY = state.scrollY;
            body.classList.remove('menu-open');
            body.style.top = state.bodyTop;
            body.style.paddingRight = state.bodyPaddingRight;
            if (header) {
                header.style.paddingRight = state.headerPaddingRight;
            }
            state = null;
            view.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
        }

        return {
            lock: lock,
            unlock: unlock,
            isLocked: function () { return state !== null; },
        };
    }

    var sharedLocks = new WeakMap();

    function getSharedScrollLock(view, page) {
        if (!sharedLocks.has(page)) {
            sharedLocks.set(page, createScrollLock(view, page));
        }
        return sharedLocks.get(page);
    }

    root.GlobalEnglishScrollLock = {
        getScrollbarGap: getScrollbarGap,
        createScrollLock: createScrollLock,
        getSharedScrollLock: getSharedScrollLock,
    };
}(typeof globalThis !== 'undefined' ? globalThis : this));
