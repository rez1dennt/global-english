<?php
declare(strict_types=1);

function global_english_phone_digits(string $phone): string
{
    $digits = preg_replace('/\D+/', '', $phone) ?? '';
    if (str_starts_with($digits, '8')) {
        $digits = '7' . substr($digits, 1);
    } elseif (strlen($digits) === 10 && !str_starts_with($digits, '7') && !str_starts_with(trim($phone), '+')) {
        $digits = '7' . $digits;
    }
    return $digits;
}

function global_english_valid_trial_data(string $name, string $phone, string $consent): bool
{
    $length = preg_match_all('/./us', trim($name));
    return $length !== false && $length >= 2 && $length <= 80
        && preg_match('/^7\d{10}$/', global_english_phone_digits($phone)) === 1
        && $consent === '1';
}
