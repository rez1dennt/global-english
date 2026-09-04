<?php
declare(strict_types=1);
// WordPress hook stubs: no network, email or persistent writes occur in this test.
define('ABSPATH', dirname(__DIR__) . '/');
define('MINUTE_IN_SECONDS', 60);
class RedirectObserved extends RuntimeException {}
$sentMessages = [];
$transients = [];
function add_action(...$args): void {}
function sanitize_text_field($value): string { return trim(strip_tags((string) $value)); }
function wp_unslash($value): string { return stripslashes((string) $value); }
function sanitize_key($value): string { return preg_replace('/[^a-z0-9_-]/', '', strtolower((string) $value)); }
function sanitize_email($value): string { return (string) filter_var($value, FILTER_SANITIZE_EMAIL); }
function wp_verify_nonce($nonce, $action): bool { return $nonce === 'valid-nonce'; }
function wp_salt($scheme): string { return 'test-only-salt'; }
function get_transient($key) { global $transients; return $transients[$key] ?? false; }
function set_transient($key, $value, $ttl): void { global $transients; $transients[$key] = $value; }
function home_url($path): string { return 'https://example.test' . $path; }
function add_query_arg($args, $url): string { return $url . '?' . http_build_query($args); }
function wp_safe_redirect($url): void { throw new RedirectObserved($url); }
function wp_mail($to, $subject, $body, $headers): bool { global $sentMessages; $sentMessages[] = compact('to','subject','body','headers'); return true; }
require dirname(__DIR__) . '/functions.php';
function submit_case(array $post): string {
    $_SERVER['REQUEST_METHOD'] = 'POST'; $_SERVER['REMOTE_ADDR'] = '127.0.0.1'; $_POST = $post;
    try { global_english_handle_trial_form(); } catch (RedirectObserved $redirect) { return $redirect->getMessage(); }
    throw new RuntimeException('No redirect observed');
}
$base = ['global_english_nonce'=>'valid-nonce','company'=>'','name'=>'Анна','phone'=>'+7 (960) 064-31-41','consent'=>'1','form_source'=>'modal'];
$url = submit_case($base);
if (!str_contains($url, 'form_status=success') || !str_contains($url, 'form_source=modal') || count($sentMessages) !== 1 || $sentMessages[0]['to'] !== 'buavagloriya@mail.ru' || !str_contains($sentMessages[0]['body'], '+79600643141')) { throw new RuntimeException('Valid form contract failed'); }
$url = submit_case($base);
if (!str_contains($url, 'rate_limited') || count($sentMessages) !== 1) { throw new RuntimeException('Rate limit failed'); }
$transients = [];
foreach ([['global_english_nonce'=>'bad'],['name'=>'Я'],['phone'=>'+796006431411'],['consent'=>'']] as $changes) {
    $url = submit_case(array_replace($base, $changes));
    if (!str_contains($url, 'error') || count($sentMessages) !== 1) { throw new RuntimeException('Invalid request was accepted'); }
}
$url = submit_case(array_replace($base, ['company'=>'bot','form_source'=>'inline']));
if (count($sentMessages) !== 1 || !str_contains($url, '#contacts')) { throw new RuntimeException('Honeypot/source failed'); }
echo "7 form handler cases: PASS (wp_mail stub; no messages sent)\n";
