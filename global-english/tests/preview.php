<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli-server') { http_response_code(404); exit; }
define('ABSPATH', dirname(__DIR__) . DIRECTORY_SEPARATOR);
define('GLOBAL_ENGLISH_PREVIEW', true);
require_once dirname(__DIR__) . '/inc/form-validation.php';
$previewPage = str_contains($_SERVER['REQUEST_URI'] ?? '', 'data-consent') ? 'consent' : (str_contains($_SERVER['REQUEST_URI'] ?? '', 'privacy-policy') ? 'privacy' : 'home');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $name = trim(strip_tags((string) ($_POST['name'] ?? '')));
    $valid = global_english_valid_trial_data($name, (string) ($_POST['phone'] ?? ''), (string) ($_POST['consent'] ?? ''));
    $source = ($_POST['form_source'] ?? '') === 'modal' ? 'modal' : 'inline';
    // No WordPress mail transport is connected to this local renderer.
    // Use the normal delivery-error state, never a fabricated success.
    header('Location: /global-english/tests/preview.php?form_status=' . ($valid ? 'mail_error' : 'validation_error') . '&form_source=' . $source . ($source === 'inline' ? '#contacts' : ''));
    exit;
}
if (in_array($_GET['form_status'] ?? '', ['success', 'demo'], true)) {
    header('Location: /global-english/tests/preview.php');
    exit;
}
function language_attributes(): void { echo 'lang="ru"'; }
function bloginfo(string $name): void { echo $name === 'charset' ? 'UTF-8' : 'Global English'; }
function body_class(): void { echo is_front_page() ? 'class="home"' : 'class="legal"'; }
function wp_body_open(): void {}
function esc_url(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
function esc_attr(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
function esc_html(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
function wp_unslash(string $value): string { return stripslashes($value); }
function sanitize_key(string $value): string { return preg_replace('/[^a-z0-9_\-]/', '', strtolower($value)) ?? ''; }
function get_theme_file_uri(string $path = ''): string { return '/global-english' . $path; }
function admin_url(string $path = ''): string { return '/global-english/tests/preview.php'; }
function home_url(string $path = ''): string {
    if (str_contains($path, 'data-consent')) { return '/global-english/tests/preview.php?page=data-consent'; }
    if (str_contains($path, 'privacy-policy')) { return '/global-english/tests/preview.php?page=privacy-policy'; }
    return '/global-english/tests/preview.php' . (str_contains($path, '#') ? substr($path, strpos($path, '#')) : '');
}
function global_english_privacy_url(): string { return home_url('/privacy-policy/'); }
function global_english_section_url(string $section): string { return is_front_page() ? '#' . $section : home_url('/#' . $section); }
function is_front_page(): bool { global $previewPage; return $previewPage === 'home'; }
function wp_date(string $format): string { return date($format); }
function wp_nonce_field(string $action, string $name, bool $referer = true, bool $display = true): string {
    $field = '<input type="hidden" id="' . esc_attr($name) . '" name="' . esc_attr($name) . '" value="preview">';
    if ($display) { echo $field; }
    return $field;
}
function wp_head(): void {
    $version = (string) filemtime(dirname(__DIR__) . '/assets/css/main.css');
    echo '<meta name="robots" content="noindex,nofollow"><title>Global English — языки в вашей школе</title><link rel="stylesheet" href="/global-english/assets/css/main.css?v=' . $version . '">';
}
function wp_footer(): void {
    foreach (['phone-mask','cookie-consent','scroll-lock','modal','main'] as $script) {
        echo '<script src="/global-english/assets/js/' . $script . '.js?v=' . filemtime(dirname(__DIR__) . '/assets/js/' . $script . '.js') . '"></script>';
    }
}
function get_header(): void { require dirname(__DIR__) . '/header.php'; }
function get_footer(): void { require dirname(__DIR__) . '/footer.php'; }
require dirname(__DIR__) . '/inc/content.php';
require dirname(__DIR__) . ($previewPage === 'consent' ? '/page-data-consent.php' : ($previewPage === 'privacy' ? '/page-privacy-policy.php' : '/front-page.php'));
