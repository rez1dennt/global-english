<?php
/* Template Name: Согласие на обработку данных */
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
$documentUrl = global_english_document_url('consent');
$existingContent = global_english_existing_legal_content();
$GLOBALS['global_english_legal_draft'] = $documentUrl === '' && $existingContent === '';
get_header();
?>
<main id="main-content" class="legal-page">
    <header class="legal-hero"><div class="container legal-hero__inner"><p class="eyebrow">GLOBAL ENGLISH / ДОКУМЕНТЫ</p><h1>Согласие на обработку персональных данных</h1><p>Документ для формы записи на пробное занятие.</p></div></header>
    <div class="container legal-layout"><article class="legal-content">
        <?php if ($existingContent !== '') : ?>
            <?php echo apply_filters('the_content', $existingContent); ?>
        <?php else : ?>
        <?php if ($documentUrl !== '') : ?><a class="button button--primary" href="<?php echo esc_url($documentUrl); ?>" target="_blank" rel="noopener">Открыть документ <?php echo global_english_icon('arrow'); ?></a><?php else : ?><p class="legal-draft-note">Утверждённый текст согласия ещё не предоставлен школой. До публичного запуска необходимо добавить документ с реквизитами оператора и согласованными условиями обработки данных.</p><p>Форма запрашивает имя и телефон для обратной связи. Вопросы можно направить на <a href="mailto:<?php echo esc_attr(global_english_contact_email()); ?>"><?php echo esc_html(global_english_contact_email()); ?></a>.</p><?php endif; ?>
        <?php endif; ?>
        <a class="button button--outline legal-back" href="<?php echo esc_url(home_url('/#contacts')); ?>">Вернуться на сайт <?php echo global_english_icon('arrow'); ?></a>
    </article></div>
</main>
<?php get_footer(); ?>
