<?php
declare(strict_types=1);
$file = dirname(__DIR__) . '/inc/form-validation.php';
if (!is_file($file)) { fwrite(STDERR, "FAIL: shared Unicode-safe form validation is missing\n"); exit(1); }
require $file;
$cases = [
    ['normal Russian name', 'Анна', '+7 (960) 064-31-41', '1', true],
    ['leading eight', 'Ирина', '89600643141', '1', true],
    ['ten-digit phone', 'Иван', '9600643141', '1', true],
    ['one Cyrillic letter', 'Я', '+79600643141', '1', false],
    ['empty name', ' ', '+79600643141', '1', false],
    ['eighty Cyrillic letters', str_repeat('я', 80), '+79600643141', '1', true],
    ['overlong Unicode name', str_repeat('я', 81), '+79600643141', '1', false],
    ['incomplete phone', 'Анна', '+7960064314', '1', false],
    ['overlong phone', 'Анна', '+796006431411', '1', false],
    ['foreign phone', 'Анна', '+441234567890', '1', false],
    ['missing consent', 'Анна', '+79600643141', '', false],
];
foreach ($cases as [$label, $name, $phone, $consent, $expected]) {
    if (global_english_valid_trial_data($name, $phone, $consent) !== $expected) { fwrite(STDERR, "FAIL: $label\n"); exit(1); }
}
echo count($cases) . " form validation cases: PASS\n";
