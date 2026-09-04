<?php
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }

function global_english_contact_phone(): string { return '+79600643141'; }
function global_english_contact_email(): string { return 'buavagloriya@mail.ru'; }
function global_english_director_url(): string { return 'https://t.me/gloriabuava_english'; }
function global_english_consent_url(): string
{
    if (function_exists('get_page_by_path')) {
        $page = get_page_by_path('data-consent');
        if ($page instanceof WP_Post) { return get_permalink($page->ID); }
    }
    return home_url('/data-consent/');
}
function global_english_existing_legal_content(): string
{
    return function_exists('get_the_content') ? trim((string) get_the_content()) : '';
}
function global_english_config(): array
{
    static $config;
    if ($config === null) { $config = require __DIR__ . '/client-config.php'; }
    return $config;
}
function global_english_client_image(string $path): string
{
    if ($path === '' || str_contains($path, '..') || !str_starts_with($path, 'assets/') || !is_file(dirname(__DIR__) . '/' . $path)) { return ''; }
    return get_theme_file_uri('/' . $path);
}
function global_english_external_url(string $url): string
{
    return filter_var($url, FILTER_VALIDATE_URL) && str_starts_with($url, 'https://') ? $url : '';
}
function global_english_document_url(string $name): string
{
    $files = ['price' => 'price-list.pdf', 'license' => 'license.pdf', 'offer' => 'offer.pdf', 'privacy' => 'privacy.pdf', 'consent' => 'consent.pdf'];
    if (!isset($files[$name]) || !is_file(dirname(__DIR__) . '/assets/documents/' . $files[$name])) { return ''; }
    return get_theme_file_uri('/assets/documents/' . $files[$name]);
}
function global_english_icon(string $name, string $class = ''): string
{
    $url = get_theme_file_uri('/assets/icons/ui.svg') . '#' . sanitize_key($name);
    return '<svg class="icon ' . esc_attr($class) . '" width="24" height="24" aria-hidden="true" focusable="false"><use href="' . esc_url($url) . '"></use></svg>';
}
function global_english_form_message(string $source): array
{
    $messages = [
        'success' => ['success', 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.'],
        'validation_error' => ['error', 'Проверьте данные формы и отправьте заявку ещё раз.'],
        'rate_limited' => ['error', 'Заявка уже отправлена. Подождите минуту перед повторной отправкой.'],
        'mail_error' => ['error', 'Не удалось отправить заявку. Позвоните нам по телефону.'],
        'security_error' => ['error', 'Страница устарела. Обновите её и повторите отправку.'],
        'invalid_request' => ['error', 'Не удалось обработать запрос. Обновите страницу.'],
    ];
    $status = sanitize_key(is_string($_GET['form_status'] ?? null) ? $_GET['form_status'] : '');
    $requestSource = sanitize_key(is_string($_GET['form_source'] ?? null) ? $_GET['form_source'] : 'inline');
    return $requestSource === $source ? ($messages[$status] ?? []) : [];
}
