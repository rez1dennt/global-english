<?php
declare(strict_types=1);
$root = dirname(__DIR__);
$failures = [];
function check_contract(bool $ok, string $message): void { global $failures; if (!$ok) { $failures[] = $message; } }
$read = static fn(string $name): string => is_file($root . '/' . $name) ? (string) file_get_contents($root . '/' . $name) : '';
$front = $read('front-page.php');
$header = $read('header.php');
$footer = $read('footer.php');
$form = $read('template-parts/trial-form.php');
$functions = $read('functions.php');
$css = $read('assets/css/main.css');
foreach (['style.css','index.php','functions.php','header.php','footer.php','front-page.php','page-privacy-policy.php','page-data-consent.php','inc/content.php','inc/form-validation.php','template-parts/trial-form.php','screenshot.png'] as $file) {
    check_contract(is_file($root . '/' . $file), 'Missing theme file: ' . $file);
}
check_contract(str_contains($read('style.css'), 'Version: 2.0.0'), 'Theme version must be 2.0.0');
check_contract(substr_count($front, '<h1') === 1, 'Homepage must have exactly one h1');
foreach (['home','about','benefits','teachers','reviews','prices','branches','contacts'] as $id) {
    check_contract(substr_count($front, 'id="' . $id . '"') === 1, 'Missing or duplicate section: ' . $id);
}
foreach (['wp_head()', 'wp_body_open()'] as $hook) { check_contract(str_contains($header, $hook), 'Missing header hook: ' . $hook); }
check_contract(str_contains($footer, 'wp_footer()'), 'Missing wp_footer');
foreach (["add_action('after_setup_theme'", "add_action('wp_enqueue_scripts'", "add_action('admin_post_nopriv_global_english_trial'", "add_action('admin_post_global_english_trial'", 'wp_verify_nonce(', 'set_transient(', 'wp_mail(', 'global_english_valid_trial_data(', 'global_english_contact_email()'] as $contract) {
    check_contract(str_contains($functions, $contract), 'Missing WordPress contract: ' . $contract);
}
check_contract(substr_count($front, 'template-parts/trial-form.php') === 2, 'Both forms must share one partial');
check_contract(substr_count($front . $header, 'data-enrollment-modal-trigger') === 4, 'Four enrollment CTA triggers are required');
check_contract(str_contains($front, 'role="dialog"') && str_contains($front, 'aria-modal="true"'), 'Accessible enrollment modal required');
foreach (['wp_nonce_field','name="form_source"','name="consent"','data-phone-input','global_english_consent_url()','global_english_privacy_url()'] as $contract) {
    check_contract(str_contains($form, $contract), 'Missing shared form contract: ' . $contract);
}
check_contract(!str_contains($form, '<select'), 'New brief requires name/phone/consent only');
foreach (['data-cookie-banner','data-cookie-settings','data-cookie-essential','data-cookie-accept'] as $hook) {
    check_contract(str_contains($footer, $hook), 'Missing cookie hook: ' . $hook);
}
foreach (['hero-scene-clean.webp'] as $file) { check_contract(is_file($root . '/assets/images/' . $file), 'Missing image: ' . $file); }
foreach (['brand.svg','ui.svg','skyline.svg'] as $file) { check_contract(is_file($root . '/assets/icons/' . $file), 'Missing SVG: ' . $file); }
preg_match_all('/var\((--[\w-]+)/', $css, $refs);
preg_match_all('/(--[\w-]+)\s*:/', $css, $defs);
foreach (array_unique($refs[1]) as $ref) { check_contract(in_array($ref, $defs[1], true) || $ref === '--reveal-index', 'Undefined CSS token: ' . $ref); }
check_contract(str_contains($css, 'prefers-reduced-motion') && str_contains($css, 'forced-colors'), 'Motion/high-contrast fallbacks required');
if ($failures) { fwrite(STDERR, "Theme foundation: FAIL\n- " . implode("\n- ", $failures) . "\n"); exit(1); }
echo "Theme foundation 2.0: PASS\n";
