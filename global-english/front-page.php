<?php
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
$config = global_english_config();
$advantages = [
    ['certificate', 'Образовательная лицензия'],
    ['book', 'Наши рабочие материалы'],
    ['checklist', 'Ежеквартальные тестирования'],
    ['globe', 'Занятия с носителями языка'],
    ['party', 'Праздничные мероприятия'],
    ['users', 'Мини-группы'],
    ['star', 'Система мотивации'],
    ['video', 'Дополнительные видеоуроки занятий'],
];
$pricePoints = [
    'Доступная стоимость абонементов',
    'Гибкая система скидок',
    'Бесплатное пробное занятие',
    'Можно оплатить обучение материнским капиталом',
    'Можно вернуть налоговый вычет 13% с покупки занятий',
];
get_header();
?>
<main id="main-content">
    <section class="hero" id="home" aria-labelledby="hero-title">
        <div class="hero-scene">
            <img class="hero-scene__background" src="<?php echo esc_url(get_theme_file_uri('/assets/images/hero-scene-clean.webp')); ?>" alt="" width="1981" height="793" fetchpriority="high">
            <div class="hero-brand">
                <div class="hero-brand__intro">
                    <svg class="hero-brand__mark" viewBox="0 0 64 64" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="24" r="18"/><ellipse cx="32" cy="24" rx="8" ry="18"/><path d="M15 18h34M15 30h34M32 6v36"/></g><path class="hero-brand__book" d="M5 43c11-2 19 2 27 10 8-8 16-12 27-10v8c-11-1-19 2-27 8-8-6-16-9-27-8z"/></svg>
                    <p>Школа <em>иностранных</em><br>языков</p>
                </div>
                <h1 class="hero-brand__title" id="hero-title"><span>GLOBAL</span><span>ENGLISH</span></h1>
                <a class="hero-phone" href="tel:<?php echo esc_attr(global_english_contact_phone()); ?>">+7 (960) 064-31-41</a>
            </div>
            <div class="hero-offer">
                <h2><span>Бесплатное</span> <br>пробное <br>занятие</h2>
                <a class="button button--hero" href="#contacts" data-enrollment-modal-trigger aria-haspopup="dialog" aria-controls="enrollment-modal">Записаться бесплатно <?php echo global_english_icon('arrow'); ?></a>
            </div>
        </div>
    </section>

    <section class="section school-section" id="about" aria-labelledby="about-title">
        <div class="container">
            <header class="school-section__intro" data-reveal>
                <h2 id="about-title">Наши занятия проходят <span>в вашей школе</span></h2>
                <p class="school-section__age">Занятия для детей от 7 до 17 лет</p>
                <p class="school-section__description">Не нужно тратить время на дорогу для получения знаний по английскому и китайскому языку</p>
            </header>
            <ol class="school-steps" aria-label="Как проходят занятия">
                <li class="school-step" data-reveal>
                    <div class="school-step__picture"><img src="<?php echo esc_url(get_theme_file_uri('/assets/images/school-1.png')); ?>" alt="Дети идут в школу" width="300" height="300" loading="lazy"></div>
                    <h3>Вы приводите своих детей в школу</h3>
                    <span class="school-step__arrow" aria-hidden="true"><?php echo global_english_icon('arrow'); ?></span>
                </li>
                <li class="school-step" data-reveal>
                    <div class="school-step__picture"><img src="<?php echo esc_url(get_theme_file_uri('/assets/images/school-2.png')); ?>" alt="Учитель проводит школьный урок" width="300" height="300" loading="lazy"></div>
                    <h3>Дети учатся на школьных уроках</h3>
                    <span class="school-step__arrow" aria-hidden="true"><?php echo global_english_icon('arrow'); ?></span>
                </li>
                <li class="school-step" data-reveal>
                    <div class="school-step__picture"><img src="<?php echo esc_url(get_theme_file_uri('/assets/images/school-3.png')); ?>" alt="Занятие иностранным языком в классе" width="300" height="300" loading="lazy"></div>
                    <h3>Английский и китайский <span>с Global English</span></h3>
                    <span class="school-step__arrow" aria-hidden="true"><?php echo global_english_icon('arrow'); ?></span>
                </li>
                <li class="school-step" data-reveal>
                    <div class="school-step__picture"><img src="<?php echo esc_url(get_theme_file_uri('/assets/images/school-4.png')); ?>" alt="Радостные дети у школы" width="300" height="300" loading="lazy"></div>
                    <h3>Довольные дети и родители</h3>
                </li>
            </ol>
            <div class="school-section__action"><a class="button button--primary" href="#contacts" data-enrollment-modal-trigger aria-haspopup="dialog" aria-controls="enrollment-modal">Записаться на бесплатное занятие <?php echo global_english_icon('arrow'); ?></a></div>
        </div>
    </section>

    <section class="section benefits" id="benefits" aria-labelledby="benefits-title">
        <div class="container">
            <header class="benefits__intro" data-reveal>
                <div><p class="eyebrow">GLOBAL ENGLISH</p><h2 id="benefits-title">Наши<br>преимущества<span class="benefits__title-dot" aria-hidden="true">.</span></h2></div>
                <div class="benefits__stamp" aria-hidden="true"><strong>8</strong><span>причин<br>учиться с нами</span></div>
            </header>
            <div class="benefit-grid">
                <?php foreach ($advantages as $i => [$icon, $label]) : $benefitPhoto = global_english_client_image((string) ($config['benefit_photos'][$icon] ?? '')); ?>
                <article class="benefit-card" data-reveal>
                    <div class="benefit-card__sheet">
                        <div class="benefit-card__visual">
                            <span class="benefit-card__number" aria-hidden="true"><?php echo esc_html('0' . ($i + 1)); ?></span>
                            <?php if ($benefitPhoto !== '') : ?><img class="benefit-card__photo" src="<?php echo esc_url($benefitPhoto); ?>" alt="<?php echo esc_attr($label); ?>" width="600" height="420" loading="lazy">
                            <?php else : ?><svg class="benefit-card__icon" viewBox="0 0 240 170" width="240" height="170" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="<?php echo esc_url(get_theme_file_uri('/assets/icons/benefit-scenes.svg') . '#' . $icon); ?>"></use></svg><?php endif; ?>
                        </div>
                        <h3><?php echo esc_html($label); ?></h3>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section class="section teachers" id="teachers" aria-labelledby="teachers-title">
        <div class="container">
            <div class="section-intro" data-reveal><div><p class="eyebrow">ЛЮДИ, КОТОРЫЕ ВДОХНОВЛЯЮТ</p><h2 id="teachers-title">Наши педагоги</h2></div><p>Все наши педагоги имеют высшее педагогическое образование и опыт работы с детьми. Также каждый педагог проходит дополнительное обучение в соответствии с нашей программой.</p></div>
            <?php
            $teacherPhotos = [];
            foreach (($config['teacher_photos'] ?? []) as $photo) {
                $photoUrl = global_english_client_image((string) $photo);
                if ($photoUrl !== '') { $teacherPhotos[] = $photoUrl; }
            }
            $teacherSlides = $teacherPhotos ?: array_fill(0, 6, '');
            ?>
            <div class="teacher-slider" data-teacher-slider role="region" aria-roledescription="карусель" aria-label="Фотографии педагогов">
                <div class="teacher-slider__viewport" data-slider-viewport tabindex="0" aria-label="Фотографии педагогов. Используйте стрелки влево и вправо">
                    <div class="teacher-slider__track" id="teacher-photo-track" data-slider-track>
                        <?php foreach ($teacherSlides as $teacherIndex => $photoUrl) : ?>
                        <div class="teacher-card" role="group" aria-roledescription="слайд" aria-label="<?php echo esc_attr('Фотография ' . ($teacherIndex + 1) . ' из ' . count($teacherSlides)); ?>">
                            <?php if ($photoUrl !== '') : ?><img src="<?php echo esc_url($photoUrl); ?>" alt="Педагог школы Global English" width="480" height="600" loading="lazy" draggable="false">
                            <?php else : ?><div class="teacher-placeholder">
                                <span class="teacher-placeholder__number" aria-hidden="true"><?php echo esc_html('0' . ($teacherIndex + 1)); ?></span>
                                <svg viewBox="0 0 240 280" fill="none" aria-hidden="true"><circle class="teacher-placeholder__halo" cx="120" cy="134" r="91"/><circle class="teacher-placeholder__head" cx="120" cy="98" r="37"/><path class="teacher-placeholder__body" d="M38 270v-32c0-55 30-94 82-94s82 39 82 94v32Z"/><path class="teacher-placeholder__detail" d="m94 147 26 28 26-28M120 175v92M74 221v46m92-46v46"/></svg>
                                <span class="teacher-placeholder__label">Фото педагога</span>
                            </div><?php endif; ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div class="teacher-slider__controls">
                    <span class="teacher-slider__count" data-slider-count aria-hidden="true">01 / <?php echo esc_html(str_pad((string) count($teacherSlides), 2, '0', STR_PAD_LEFT)); ?></span>
                    <div class="teacher-slider__buttons"><button type="button" class="teacher-slider__arrow teacher-slider__arrow--prev" data-slider-prev aria-label="Предыдущие педагоги" aria-controls="teacher-photo-track"><?php echo global_english_icon('arrow'); ?></button><button type="button" class="teacher-slider__arrow" data-slider-next aria-label="Следующие педагоги" aria-controls="teacher-photo-track"><?php echo global_english_icon('arrow'); ?></button></div>
                </div>
                <p id="teacher-slider-status" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
            </div>
            <article class="director-contact" data-reveal>
                <span class="director-contact__wordmark" aria-hidden="true">GLOBAL ENGLISH</span>
                <div class="director-contact__identity">
                    <div class="director-contact__topline">
                        <?php $directorPhoto = global_english_client_image((string) $config['director_photo']); ?>
                        <div class="director-contact__avatar<?php echo $directorPhoto !== '' ? ' director-contact__avatar--photo' : ''; ?>">
                            <?php if ($directorPhoto !== '') : ?><img src="<?php echo esc_url($directorPhoto); ?>" alt="Борисова Глория Гариевна" width="240" height="240" loading="lazy">
                            <?php else : ?><span aria-hidden="true">ГБ</span><?php endif; ?>
                        </div>
                        <p>Личный контакт<br><strong>с руководителем</strong></p>
                    </div>
                    <p class="eyebrow">ДАВАЙТЕ ЗНАКОМИТЬСЯ</p>
                    <h3>Борисова<br>Глория Гариевна</h3>
                    <p class="director-contact__role">Руководитель Школы Global English</p>
                    <div class="director-contact__experience"><strong>14<span>+</span></strong><p>Опыт работы с детьми<br><b>более 14 лет</b></p></div>
                </div>
                <div class="director-contact__panel">
                    <span class="director-contact__quote" aria-hidden="true"><?php echo global_english_icon('quote'); ?></span>
                    <p class="director-contact__lead">Вы можете обратиться ко мне по любым вопросам.</p>
                    <p class="director-contact__caption">Напишите напрямую руководителю школы.</p>
                    <a class="button button--primary director-contact__button" href="<?php echo esc_url(global_english_director_url()); ?>" target="_blank" rel="noopener noreferrer"><?php echo global_english_icon('telegram'); ?> Написать Глории <?php echo global_english_icon('arrow'); ?></a>
                    <a class="director-contact__handle" href="<?php echo esc_url(global_english_director_url()); ?>" target="_blank" rel="noopener noreferrer">@gloriabuava_english</a>
                </div>
            </article>
        </div>
    </section>

    <section class="section reviews" id="reviews" aria-labelledby="reviews-title">
        <div class="container">
            <div class="section-intro" data-reveal><div><p class="eyebrow">ВАЖНО КАЖДОЕ МНЕНИЕ</p><h2 id="reviews-title">Отзывы</h2></div><p>Мы собираем обратную связь,<br>чтобы становиться лучше для вас.</p></div>
            <?php if (!empty($config['reviews'])) : ?><div class="review-grid"><?php foreach ($config['reviews'] as $review) : ?><figure class="review-card"><?php echo global_english_icon('quote'); ?><blockquote><?php echo esc_html((string) $review['text']); ?></blockquote><figcaption><?php echo esc_html((string) $review['author']); ?></figcaption></figure><?php endforeach; ?></div>
            <?php else : ?><div class="review-empty" data-reveal><div class="review-empty__mark"><?php echo global_english_icon('quote'); ?></div><div><h3>Ваша обратная связь<br>помогает нам расти</h3><p>Отзывы будут опубликованы после добавления материалов от школы.</p></div><a class="text-link" href="<?php echo esc_url(global_english_director_url()); ?>" target="_blank" rel="noopener noreferrer">Поделиться впечатлениями <?php echo global_english_icon('arrow'); ?></a></div><?php endif; ?>
        </div>
    </section>

    <section class="section prices" id="prices" aria-labelledby="prices-title">
        <div class="container price-layout">
            <div><p class="eyebrow">ВКЛАД В БОЛЬШОЙ МИР</p><h2 id="prices-title">Стоимость наших занятий</h2><ul class="price-points"><?php foreach ($pricePoints as $point) : ?><li><?php echo global_english_icon('check'); ?><span><?php echo esc_html($point); ?></span></li><?php endforeach; ?></ul><p class="price-note">Условия оплаты материнским капиталом и получения налогового вычета уточняйте у администратора.</p></div>
            <div class="price-card"><span class="price-card__icon"><?php echo global_english_icon('gift'); ?></span><p class="eyebrow">ПЕРВЫЙ ШАГ — БЕСПЛАТНО</p><h3>Начнём<br>со знакомства?</h3><p>Приходите на пробное занятие<br>по английскому или китайскому.</p><a class="button button--primary" href="#contacts" data-enrollment-modal-trigger aria-haspopup="dialog" aria-controls="enrollment-modal">Записаться на пробное занятие <?php echo global_english_icon('arrow'); ?></a>
            <?php $priceUrl = global_english_document_url('price'); if ($priceUrl !== '') : ?><a class="text-link" href="<?php echo esc_url($priceUrl); ?>" target="_blank" rel="noopener">Посмотреть прайс-лист <?php echo global_english_icon('arrow'); ?></a><?php else : ?><div class="price-disclosure" data-price-disclosure data-state="closed"><button class="price-disclosure__toggle" type="button" aria-expanded="false" aria-controls="price-disclosure-content"><span>Посмотреть прайс-лист</span> <?php echo global_english_icon('chevron'); ?></button><div class="price-disclosure__content" id="price-disclosure-content" data-disclosure-content><div class="price-disclosure__inner" data-disclosure-inner><p>Файл прайс-листа ещё не добавлен. Уточните стоимость по телефону <a href="tel:<?php echo esc_attr(global_english_contact_phone()); ?>">+7 (960) 064-31-41</a>.</p></div></div></div><?php endif; ?>
            </div>
        </div>
    </section>

    <section class="branches-section" id="branches" aria-labelledby="branches-title">
        <div class="container">
            <div class="branches-section__intro" data-reveal><h2 id="branches-title">Наши филиалы</h2><p>Мы работаем в четырёх городах</p></div>
            <ul class="branch-grid">
                <li class="branch-card" id="branch-kazan" data-reveal><span class="branch-card__icon"><?php echo global_english_icon('pin'); ?></span><h3>Казань</h3></li>
                <li class="branch-card" id="branch-nizhnekamsk" data-reveal><span class="branch-card__icon"><?php echo global_english_icon('pin'); ?></span><h3>Нижнекамск</h3></li>
                <li class="branch-card" id="branch-cheboksary" data-reveal><span class="branch-card__icon"><?php echo global_english_icon('pin'); ?></span><h3>Чебоксары</h3></li>
                <li class="branch-card" id="branch-ekaterinburg" data-reveal><span class="branch-card__icon"><?php echo global_english_icon('pin'); ?></span><h3>Екатеринбург</h3></li>
            </ul>
        </div>
    </section>

    <section class="contact-section" id="contacts" aria-labelledby="contact-title">
        <div class="container contact-panel">
            <div class="contact-panel__copy"><p class="eyebrow">ПРИВЕТ, GLOBAL ENGLISH!</p><h2 id="contact-title">Новый язык.<br>Новые открытия.<br><span>Начнём?</span></h2><p>Оставьте заявку на бесплатное пробное занятие. Мы свяжемся с вами в ближайшее время.</p><a class="contact-phone" href="tel:<?php echo esc_attr(global_english_contact_phone()); ?>"><?php echo global_english_icon('phone'); ?> +7 (960) 064-31-41</a><span class="contact-panel__languages" aria-hidden="true">Hello! <i>你好!</i></span></div>
            <div class="contact-form-card"><h3>Записаться на пробное занятие</h3><?php $formSource = 'inline'; include __DIR__ . '/template-parts/trial-form.php'; ?></div>
        </div>
    </section>
</main>

<div class="enrollment-modal" id="enrollment-modal" data-enrollment-modal data-state="closed" aria-hidden="true" inert>
    <div class="enrollment-modal__backdrop" data-modal-backdrop></div>
    <section class="enrollment-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="enrollment-modal-title" aria-describedby="enrollment-modal-description" data-modal-dialog tabindex="-1">
        <button class="enrollment-modal__close" type="button" aria-label="Закрыть форму записи" data-modal-close><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
        <div class="enrollment-modal__header"><p class="eyebrow">ДАВАЙТЕ ЗНАКОМИТЬСЯ</p><h2 id="enrollment-modal-title">Первое занятие —<br><span>бесплатно</span></h2><p id="enrollment-modal-description">Оставьте контакты — мы свяжемся с вами в ближайшее время.</p></div>
        <?php $formSource = 'modal'; include __DIR__ . '/template-parts/trial-form.php'; ?>
    </section>
</div>
<?php get_footer(); ?>
