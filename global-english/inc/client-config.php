<?php
// Add only verified client materials. Paths are theme-relative; URLs must be https.
return [
    'max_url' => '',
    'telegram_url' => '', // Manager contact, separate from the director's Telegram.
    'whatsapp_url' => '',
    'director_photo' => '',
    'teacher_photos' => [],
    'benefit_photos' => [], // Theme-relative photo paths keyed by certificate/book/checklist/globe/party/users/star/video.
    'reviews' => [], // Each record: ['text' => 'Approved quote', 'author' => 'Approved display name'].
];
