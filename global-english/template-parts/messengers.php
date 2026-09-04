<?php
if (!defined('ABSPATH')) { exit; }
$messengerPlacement = in_array($messengerPlacement ?? '', ['desktop', 'mobile', 'footer'], true) ? $messengerPlacement : 'footer';
?>
<div class="messenger-group messenger-group--<?php echo esc_attr($messengerPlacement); ?>" aria-label="Мессенджеры менеджера">
    <?php foreach (['max_url' => ['MAX', 'max.png'], 'telegram_url' => ['Telegram', 'tg.svg']] as $key => [$label, $file]) :
        $messengerUrl = global_english_external_url((string) ($config[$key] ?? ''));
        $messengerTitle = $messengerUrl !== '' ? 'Написать менеджеру в ' . $label : $label . ': ссылка менеджера ещё не добавлена';
    ?>
        <?php if ($messengerUrl !== '') : ?><a class="messenger-link" href="<?php echo esc_url($messengerUrl); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr($messengerTitle); ?>" title="<?php echo esc_attr($messengerTitle); ?>">
        <?php else : ?><span class="messenger-link messenger-link--pending" role="link" aria-disabled="true" aria-label="<?php echo esc_attr($messengerTitle); ?>" title="<?php echo esc_attr($messengerTitle); ?>"><?php endif; ?>
            <img class="messenger-icon" src="<?php echo esc_url(get_theme_file_uri('/assets/icons/' . $file)); ?>" width="32" height="32" alt="">
            <span class="messenger-label"><?php echo esc_html($label); ?><?php if ($messengerUrl === '') : ?><small>Ссылка ожидается</small><?php endif; ?></span>
        <?php if ($messengerUrl !== '') : ?></a><?php else : ?></span><?php endif; ?>
    <?php endforeach; ?>
</div>
