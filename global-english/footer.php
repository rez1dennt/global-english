<?php
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
$config = global_english_config();
?>
<footer class="site-footer">
    <div class="container site-footer__grid">
        <div class="footer-brand"><a class="brand" href="<?php echo esc_url(global_english_section_url('home')); ?>" aria-label="Global English, на главную"><img src="<?php echo esc_url(get_theme_file_uri('/assets/icons/brand.svg')); ?>" alt="" width="52" height="52"><span class="brand__copy"><strong>GLOBAL <span>ENGLISH</span></strong><small>ШКОЛА ИНОСТРАННЫХ ЯЗЫКОВ</small></span></a><p>Английский и китайский языки.<br>Ближе к вам. Ближе к большому миру.</p></div>
        <nav class="footer-column" aria-label="Навигация в подвале"><h2>Знакомимся</h2><a href="<?php echo esc_url(global_english_section_url('about')); ?>">О нас</a><a href="<?php echo esc_url(global_english_section_url('teachers')); ?>">Педагоги</a><a href="<?php echo esc_url(global_english_section_url('reviews')); ?>">Отзывы</a><a href="<?php echo esc_url(global_english_section_url('prices')); ?>">Стоимость занятий</a></nav>
        <div class="footer-column"><h2>Наши города</h2><span>Казань</span><span>Нижнекамск</span><span>Чебоксары</span><span>Екатеринбург</span></div>
        <address class="footer-column footer-contact"><h2>На связи</h2><a class="footer-phone" href="tel:<?php echo esc_attr(global_english_contact_phone()); ?>">+7 (960) 064-31-41</a><a href="mailto:<?php echo esc_attr(global_english_contact_email()); ?>"><?php echo esc_html(global_english_contact_email()); ?></a><a href="<?php echo esc_url(global_english_director_url()); ?>" target="_blank" rel="noopener noreferrer"><?php echo global_english_icon('telegram'); ?> Telegram руководителя</a><?php $messengerPlacement = 'footer'; require __DIR__ . '/template-parts/messengers.php'; ?><?php if (global_english_external_url((string) ($config['whatsapp_url'] ?? '')) !== '') : ?><a href="<?php echo esc_url($config['whatsapp_url']); ?>" target="_blank" rel="noopener noreferrer">WhatsApp менеджера</a><?php endif; ?></address>
    </div>
    <div class="container footer-documents" aria-label="Документы школы">
        <?php foreach (['license' => 'Образовательная лицензия', 'offer' => 'Договор оферты'] as $key => $label) : $documentUrl = global_english_document_url($key); if ($documentUrl !== '') : ?><a href="<?php echo esc_url($documentUrl); ?>" target="_blank" rel="noopener"><?php echo esc_html($label); ?> ↗</a><?php else : ?><span><?php echo esc_html($label); ?><small>Документ готовится</small></span><?php endif; endforeach; ?>
        <a href="<?php echo esc_url(global_english_privacy_url()); ?>">Политика конфиденциальности</a>
        <a href="<?php echo esc_url(global_english_consent_url()); ?>">Согласие на обработку данных</a>
    </div>
    <div class="container site-footer__bottom"><p>© <?php echo esc_html(wp_date('Y')); ?> Global English</p><button type="button" data-cookie-settings>Настройки cookie</button></div>
</footer>
<aside class="cookie-banner" data-cookie-banner data-state="open" role="region" aria-label="Настройки файлов cookie" aria-hidden="false">
    <div class="cookie-banner__copy"><strong>Немного о cookie</strong><p>Сохраняем ваш выбор в браузере. Необязательная аналитика не подключена. <a href="<?php echo esc_url(global_english_privacy_url()); ?>">Подробнее</a></p></div>
    <div class="cookie-banner__actions"><button class="button button--secondary" type="button" data-cookie-essential>Только необходимые</button><button class="button button--primary" type="button" data-cookie-accept>Принять</button></div>
</aside>
<?php wp_footer(); ?>
</body>
</html>
