<?php
if (!defined('ABSPATH')) { exit; }
$formSource = $formSource === 'modal' ? 'modal' : 'inline';
$prefix = $formSource === 'modal' ? 'modal-trial' : 'trial';
$message = global_english_form_message($formSource);
?>
<form class="trial-form <?php echo $formSource === 'modal' ? 'enrollment-modal__form' : ''; ?>" id="<?php echo esc_attr($prefix . '-form'); ?>" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post" novalidate data-trial-form data-form-source="<?php echo esc_attr($formSource); ?>">
    <input type="hidden" name="action" value="global_english_trial">
    <input type="hidden" name="form_source" value="<?php echo esc_attr($formSource); ?>">
    <?php echo str_replace('id="global_english_nonce"', 'id="' . esc_attr($prefix . '-nonce') . '"', wp_nonce_field('global_english_trial', 'global_english_nonce', false, false)); ?>
    <div class="honeypot" aria-hidden="true"><label for="<?php echo esc_attr($prefix . '-company'); ?>">Компания</label><input id="<?php echo esc_attr($prefix . '-company'); ?>" name="company" type="text" tabindex="-1" autocomplete="off"></div>
    <div class="form-field"><label for="<?php echo esc_attr($prefix . '-name'); ?>">Ваше имя</label><input id="<?php echo esc_attr($prefix . '-name'); ?>" name="name" type="text" autocomplete="name" placeholder="Как к вам обращаться?" minlength="2" maxlength="80" required aria-describedby="<?php echo esc_attr($prefix . '-name-error'); ?>"><span class="field-error" id="<?php echo esc_attr($prefix . '-name-error'); ?>"></span></div>
    <div class="form-field"><label for="<?php echo esc_attr($prefix . '-phone'); ?>">Телефон</label><input id="<?php echo esc_attr($prefix . '-phone'); ?>" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (999) 999-99-99" required aria-describedby="<?php echo esc_attr($prefix . '-phone-error'); ?>" data-phone-input><span class="field-error" id="<?php echo esc_attr($prefix . '-phone-error'); ?>"></span></div>
    <label class="consent"><input type="checkbox" name="consent" value="1" required aria-describedby="<?php echo esc_attr($prefix . '-consent-error'); ?>"><span>Даю <a href="<?php echo esc_url(global_english_consent_url()); ?>" target="_blank" rel="noopener">согласие на обработку персональных данных</a> и принимаю <a href="<?php echo esc_url(global_english_privacy_url()); ?>" target="_blank" rel="noopener">политику конфиденциальности</a>.</span></label>
    <span class="field-error consent-error" id="<?php echo esc_attr($prefix . '-consent-error'); ?>"></span>
    <button class="button button--primary form-submit" type="submit">Записаться на бесплатное занятие <?php echo global_english_icon('arrow'); ?></button>
    <div class="form-status" role="status" aria-live="polite" data-form-status<?php echo $message ? ' data-status="' . esc_attr($message[0]) . '"' : ''; ?>><?php echo $message ? esc_html($message[1]) : ''; ?></div>
</form>
