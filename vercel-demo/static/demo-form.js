(function () {
    'use strict';

    function initDemoForms() {
        document.querySelectorAll('[data-trial-form]').forEach(function (form) {
            var submit = form.querySelector('[type="submit"]');
            var status = form.querySelector('[data-form-status]');
            if (!submit || !status) { return; }
            var originalSubmitHtml = submit.innerHTML;

            form.addEventListener('submit', function (event) {
                if (event.defaultPrevented) { return; }
                event.preventDefault();
                submit.disabled = false;
                submit.removeAttribute('aria-busy');
                submit.innerHTML = originalSubmitHtml;
                status.dataset.status = 'error';
                status.textContent = 'Онлайн-заявка пока недоступна. Позвоните нам: +7 (960) 064-31-41.';
            });
        });
    }

    function scheduleDemoForms() {
        window.setTimeout(initDemoForms, 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleDemoForms);
    } else {
        scheduleDemoForms();
    }
}());
