<?php

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/inc/content.php';
require_once __DIR__ . '/inc/form-validation.php';

function global_english_setup(): void
{
    load_theme_textdomain('global-english', get_template_directory() . '/languages');

    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo', [
        'height' => 72,
        'width' => 320,
        'flex-height' => true,
        'flex-width' => true,
    ]);
    add_theme_support('html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ]);
}
add_action('after_setup_theme', 'global_english_setup');

function global_english_asset_version(string $relativePath): string
{
    $path = get_theme_file_path($relativePath);
    return is_file($path) ? (string) filemtime($path) : wp_get_theme()->get('Version');
}

function global_english_assets(): void
{
    wp_enqueue_style(
        'global-english-main',
        get_theme_file_uri('/assets/css/main.css'),
        [],
        global_english_asset_version('/assets/css/main.css')
    );

    wp_enqueue_script(
        'global-english-phone-mask',
        get_theme_file_uri('/assets/js/phone-mask.js'),
        [],
        global_english_asset_version('/assets/js/phone-mask.js'),
        true
    );

    wp_enqueue_script(
        'global-english-cookie-consent',
        get_theme_file_uri('/assets/js/cookie-consent.js'),
        [],
        global_english_asset_version('/assets/js/cookie-consent.js'),
        true
    );

    wp_enqueue_script(
        'global-english-scroll-lock',
        get_theme_file_uri('/assets/js/scroll-lock.js'),
        [],
        global_english_asset_version('/assets/js/scroll-lock.js'),
        true
    );

    wp_enqueue_script(
        'global-english-modal',
        get_theme_file_uri('/assets/js/modal.js'),
        ['global-english-scroll-lock'],
        global_english_asset_version('/assets/js/modal.js'),
        true
    );

    wp_enqueue_script(
        'global-english-script',
        get_theme_file_uri('/assets/js/main.js'),
        ['global-english-phone-mask', 'global-english-cookie-consent', 'global-english-scroll-lock', 'global-english-modal'],
        global_english_asset_version('/assets/js/main.js'),
        true
    );
}
add_action('wp_enqueue_scripts', 'global_english_assets');

function global_english_privacy_url(): string
{
    $configuredUrl = get_privacy_policy_url();
    if ($configuredUrl !== '') {
        return $configuredUrl;
    }

    $privacyPage = get_page_by_path('privacy-policy');
    if ($privacyPage instanceof WP_Post) {
        return get_permalink($privacyPage);
    }

    return home_url('/privacy-policy/');
}

function global_english_section_url(string $section): string
{
    $anchor = '#' . sanitize_html_class($section);
    return is_front_page() ? $anchor : home_url('/' . $anchor);
}

function global_english_ensure_privacy_page(): void
{
    if (get_privacy_policy_url() !== '') { return; }
    $privacyPage = get_page_by_path('privacy-policy');
    if (!($privacyPage instanceof WP_Post)) {
        $pageId = wp_insert_post([
            'post_type' => 'page',
            'post_status' => 'publish',
            'post_title' => 'Политика конфиденциальности',
            'post_name' => 'privacy-policy',
            'post_content' => '',
        ], true);

        if (!is_wp_error($pageId)) {
            update_post_meta($pageId, '_wp_page_template', 'page-privacy-policy.php');
            update_option('wp_page_for_privacy_policy', $pageId);
        }
        return;
    }

    if ((int) get_option('wp_page_for_privacy_policy') === 0) {
        update_option('wp_page_for_privacy_policy', $privacyPage->ID);
    }
    // Keep any existing policy content and template chosen by the site owner.
}

function global_english_ensure_consent_page(): void
{
    if (get_page_by_path('data-consent') instanceof WP_Post) { return; }
    $pageId = wp_insert_post([
        'post_type' => 'page', 'post_status' => 'publish',
        'post_title' => 'Согласие на обработку персональных данных',
        'post_name' => 'data-consent', 'post_content' => '',
    ], true);
    if (!is_wp_error($pageId)) { update_post_meta($pageId, '_wp_page_template', 'page-data-consent.php'); }
}
function global_english_migrate_legal_pages(): void
{
    if (get_option('global_english_schema_version') === '2.0.0') { return; }
    global_english_ensure_privacy_page();
    global_english_ensure_consent_page();
    if (get_privacy_policy_url() !== '' && get_page_by_path('data-consent') instanceof WP_Post) {
        update_option('global_english_schema_version', '2.0.0');
    }
}
function global_english_maybe_upgrade(): void
{
    if (current_user_can('manage_options')) { global_english_migrate_legal_pages(); }
}
add_action('after_switch_theme', 'global_english_migrate_legal_pages');
add_action('admin_init', 'global_english_maybe_upgrade');

function global_english_form_redirect(string $status): void
{
    $source = isset($_POST['form_source'])
        ? sanitize_key(wp_unslash($_POST['form_source']))
        : 'inline';
    $source = $source === 'modal' ? 'modal' : 'inline';
    $url = add_query_arg([
        'form_status' => rawurlencode($status),
        'form_source' => $source,
    ], home_url('/'));
    if ($source === 'inline') {
        $url .= '#contacts';
    }
    wp_safe_redirect($url);
    exit;
}

function global_english_handle_trial_form(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        global_english_form_redirect('invalid_request');
    }

    $nonce = isset($_POST['global_english_nonce'])
        ? sanitize_text_field(wp_unslash($_POST['global_english_nonce']))
        : '';

    if (!wp_verify_nonce($nonce, 'global_english_trial')) {
        global_english_form_redirect('security_error');
    }

    $honeypot = isset($_POST['company'])
        ? sanitize_text_field(wp_unslash($_POST['company']))
        : '';

    if ($honeypot !== '') {
        global_english_form_redirect('success');
    }

    $remoteAddress = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    $rateKey = 'ge_trial_' . substr(hash_hmac('sha256', $remoteAddress, wp_salt('nonce')), 0, 32);
    if (get_transient($rateKey) !== false) {
        global_english_form_redirect('rate_limited');
    }

    $name = isset($_POST['name']) ? sanitize_text_field(wp_unslash($_POST['name'])) : '';
    $phone = isset($_POST['phone']) ? sanitize_text_field(wp_unslash($_POST['phone'])) : '';
    $consent = isset($_POST['consent']) ? sanitize_text_field(wp_unslash($_POST['consent'])) : '';

    $phoneDigits = global_english_phone_digits($phone);
    if (!global_english_valid_trial_data($name, $phone, $consent)) {
        global_english_form_redirect('validation_error');
    }

    set_transient($rateKey, time(), MINUTE_IN_SECONDS);

    $recipient = sanitize_email(global_english_contact_email());
    $subject = 'Новая заявка с сайта Global English';
    $message = implode("\n", [
        'Имя: ' . $name,
        'Телефон: +' . $phoneDigits,
        'Согласие на обработку данных: получено',
    ]);

    $sent = wp_mail($recipient, $subject, $message, ['Content-Type: text/plain; charset=UTF-8']);
    global_english_form_redirect($sent ? 'success' : 'mail_error');
}
add_action('admin_post_nopriv_global_english_trial', 'global_english_handle_trial_form');
add_action('admin_post_global_english_trial', 'global_english_handle_trial_form');
