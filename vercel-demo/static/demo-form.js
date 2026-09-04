(function () {
    'use strict';

    function initDemoForms() {
        document.querySelectorAll('[data-trial-form]').forEach(function (form) {
            var submit = form.querySelector('[type="submit"]');
            var status = form.querySelector('[data-form-status]');
            if (!submit || !status) { return; }
            var originalSubmitHtml = submit.innerHTML;

            form.addEventListener('submit', function (event) {
                event.preventDefault();
            }, true);

            form.addEventListener('submit', function () {
                window.setTimeout(function () {
                    if (form.querySelector('[aria-invalid="true"]')) { return; }
                    submit.disabled = false;
                    submit.removeAttribute('aria-busy');
                    submit.innerHTML = originalSubmitHtml;
                    status.dataset.status = 'error';
                    status.textContent = 'Онлайн-заявка пока недоступна. Позвоните нам: +7 (960) 064-31-41.';
                }, 0);
            });

            form.querySelectorAll('[data-demo-name]').forEach(function (field) {
                field.name = field.dataset.demoName;
            });
            submit.disabled = false;
        });
    }

    initDemoForms();
}());
