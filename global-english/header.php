<?php
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
$config = global_english_config();
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <script>document.documentElement.classList.add('js');</script>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php if ($GLOBALS['global_english_legal_draft'] ?? false) : ?><meta name="robots" content="noindex,follow"><?php endif; ?>
    <meta name="description" content="Global English — английский и китайский для детей от 7 до 17 лет. Занятия в вашей школе: Казань, Нижнекамск, Чебоксары, Екатеринбург. Бесплатное пробное занятие.">
    <link rel="icon" href="<?php echo esc_url(get_theme_file_uri('/assets/icons/brand.svg')); ?>" type="image/svg+xml">
    <link rel="preload" href="<?php echo esc_url(get_theme_file_uri('/assets/fonts/manrope-cyrillic.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="<?php echo esc_url(get_theme_file_uri('/assets/fonts/manrope-latin.woff2')); ?>" as="font" type="font/woff2" crossorigin>
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main-content">Перейти к содержанию</a>
<header class="site-header" data-site-header>
    <div class="container site-header__inner">
        <a class="brand" href="<?php echo esc_url(global_english_section_url('home')); ?>" aria-label="Global English, на главную">
            <img src="<?php echo esc_url(get_theme_file_uri('/assets/icons/brand.svg')); ?>" alt="" width="48" height="48">
            <span class="brand__copy"><strong>GLOBAL <span>ENGLISH</span></strong><small>ШКОЛА ИНОСТРАННЫХ ЯЗЫКОВ</small></span>
        </a>
        <nav class="primary-nav" id="primary-navigation" aria-label="Основная навигация" data-menu-panel>
            <a href="<?php echo esc_url(global_english_section_url('about')); ?>">О нас</a>
            <a href="<?php echo esc_url(global_english_section_url('teachers')); ?>">Педагоги</a>
            <a href="<?php echo esc_url(global_english_section_url('reviews')); ?>">Отзывы</a>
            <a href="<?php echo esc_url(global_english_section_url('prices')); ?>">Цены</a>
            <a class="mobile-nav-contact" href="tel:<?php echo esc_attr(global_english_contact_phone()); ?>">+7 (960) 064-31-41</a>
            <?php $messengerPlacement = 'mobile'; require __DIR__ . '/template-parts/messengers.php'; ?>
        </nav>
        <div class="site-header__actions">
            <a class="header-phone" href="tel:<?php echo esc_attr(global_english_contact_phone()); ?>">+7 (960) 064-31-41</a>
            <?php $messengerPlacement = 'desktop'; require __DIR__ . '/template-parts/messengers.php'; ?>
            <a class="button button--primary button--small button--callback" href="<?php echo esc_url(global_english_section_url('contacts')); ?>"<?php if (is_front_page()) : ?> data-enrollment-modal-trigger aria-haspopup="dialog" aria-controls="enrollment-modal"<?php endif; ?>><?php echo global_english_icon('phone'); ?><span>Обратный звонок</span></a>
        </div>
        <button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="primary-navigation" data-menu-toggle><span class="menu-toggle__lines" aria-hidden="true"><i></i><i></i><i></i></span></button>
    </div>
</header>
