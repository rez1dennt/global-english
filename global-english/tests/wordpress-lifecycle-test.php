<?php
declare(strict_types=1);
define('ABSPATH', dirname(__DIR__) . '/');
class WP_Post { public int $ID; public function __construct(int $id) { $this->ID = $id; } }
$pages = []; $options = ['wp_page_for_privacy_policy' => 42]; $created = []; $updates = []; $postContent = '';
function add_action(...$args): void {}
function get_privacy_policy_url(): string { global $options; return !empty($options['wp_page_for_privacy_policy']) ? 'https://example.test/?page_id=' . $options['wp_page_for_privacy_policy'] : ''; }
function get_page_by_path($slug) { global $pages; return $pages[$slug] ?? null; }
function wp_insert_post($post,$error=false) { global $pages,$created; $id=100+count($created); $created[]=$post; $pages[$post['post_name']]=new WP_Post($id); return $id; }
function is_wp_error($value): bool { return false; }
function update_post_meta(...$args): void {}
function get_option($key) { global $options; return $options[$key] ?? ''; }
function update_option($key,$value): void { global $options,$updates; $options[$key]=$value; $updates[]=$key; }
function current_user_can($cap): bool { return true; }
function get_permalink($id): string { return 'https://example.test/?page_id=' . $id; }
function home_url($path): string { return 'https://example.test' . $path; }
function get_the_content(): string { global $postContent; return $postContent; }
require dirname(__DIR__) . '/functions.php';
if (!function_exists('global_english_maybe_upgrade')) { fwrite(STDERR,"FAIL: active-theme upgrade migration missing\n"); exit(1); }
global_english_maybe_upgrade();
if ($options['wp_page_for_privacy_policy'] !== 42 || count($created)!==1 || $created[0]['post_name']!=='data-consent') { throw new RuntimeException('Existing approved policy was replaced'); }
if (global_english_consent_url() !== 'https://example.test/?page_id=100') { throw new RuntimeException('Plain permalink failed'); }
global_english_maybe_upgrade();
if (count($created)!==1) { throw new RuntimeException('Migration is not idempotent'); }
$postContent = '<p>Approved operator policy</p>';
if (global_english_existing_legal_content() !== $postContent) { throw new RuntimeException('Existing policy content was lost'); }
echo "4 WordPress lifecycle cases: PASS\n";
