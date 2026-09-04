<?php
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
$documentUrl = global_english_document_url('privacy');
$existingContent = global_english_existing_legal_content();
$GLOBALS['global_english_legal_draft'] = $documentUrl === '' && $existingContent === '';
get_header();
?>
<main id="main-content" class="legal-page">
    <header class="legal-hero"><div class="container legal-hero__inner"><p class="eyebrow">GLOBAL ENGLISH / ДОКУМЕНТЫ</p><h1>Политика конфиденциальности</h1><p>Информация о форме обратной связи и работе сайта.</p></div></header>
    <div class="container legal-layout"><article class="legal-content">
        <?php if ($existingContent !== '') : ?>
            <?php echo apply_filters('the_content', $existingContent); ?>
        <?php else : ?>
        <?php if ($documentUrl !== '') : ?><p>Утверждённая школой редакция доступна в PDF.</p><a class="button button--primary" href="<?php echo esc_url($documentUrl); ?>" target="_blank" rel="noopener">Открыть политику конфиденциальности <?php echo global_english_icon('arrow'); ?></a>
        <?php else : ?><p class="legal-draft-note">Утверждённая политика ещё не предоставлена школой. Эта страница — техническое описание формы, а не окончательный юридический документ. Перед публичным запуском необходимо добавить реквизиты оператора и утверждённую редакцию политики.</p>
        <h2>Данные формы</h2><p>Форма запрашивает имя, телефон и согласие на обработку данных. На рабочем сайте заявка передаётся на почту школы <?php echo esc_html(global_english_contact_email()); ?>. Техническая защита от повторных отправок использует кратковременный ключ, полученный из IP-адреса.</p>
        <h2>Настройки браузера</h2><p>Выбор в cookie-плашке сохраняется в локальном хранилище браузера. Необязательная аналитика и рекламные счётчики в тему не включены. Изменить выбор можно в подвале сайта.</p>
        <h2>Связаться со школой</h2><p>По вопросам обработки данных: <a href="mailto:<?php echo esc_attr(global_english_contact_email()); ?>"><?php echo esc_html(global_english_contact_email()); ?></a>.</p><?php endif; ?>
        <?php endif; ?>
        <a class="button button--outline legal-back" href="<?php echo esc_url(home_url('/#contacts')); ?>">Вернуться на сайт <?php echo global_english_icon('arrow'); ?></a>
    </article></div>
</main>
<?php get_footer(); ?>
