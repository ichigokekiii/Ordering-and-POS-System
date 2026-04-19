<?php

namespace App\Support;

class ValidationRules
{
    public const PASSWORD_MIN_LENGTH = 8;
    public const MONEY_REGEX = '/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/';
    public const POSITIVE_INTEGER_REGEX = '/^[1-9]\d*$/';
    public const NON_NEGATIVE_INTEGER_REGEX = '/^(?:0|[1-9]\d*)$/';
    public const NAME_REGEX = "/^[a-zA-Z\s\-']+$/";
    public const PHONE_REGEX = '/^\d{11}$/';
    public const ADDRESS_TEXT_REGEX = '/^[a-zA-Z0-9\s\-,\.#+]+$/';
    public const CITY_REGEX = "/^[a-zA-Z\s\-']+$/";

    public static function passwordRules(bool $confirmed = false): array
    {
        $rules = [
            'required',
            'string',
            'min:' . self::PASSWORD_MIN_LENGTH,
            'not_regex:/^\s*$/',
            'regex:/[A-Z]/',
            'regex:/[0-9]/',
        ];

        if ($confirmed) {
            $rules[] = 'confirmed';
        }

        return $rules;
    }

    public static function normalizeSingleLine(?string $value, ?int $maxLength = null): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = preg_replace('/\s+/', ' ', trim($value));

        if ($normalized === null) {
            return null;
        }

        if ($maxLength !== null) {
            return mb_substr($normalized, 0, $maxLength);
        }

        return $normalized;
    }

    public static function normalizeMultiLine(?string $value, ?int $maxLength = null): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) preg_replace("/\r\n|\r/", "\n", $value));

        if ($maxLength !== null) {
            return mb_substr($normalized, 0, $maxLength);
        }

        return $normalized;
    }

    public static function normalizePhone(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return preg_replace('/\D+/', '', $value);
    }

    public static function normalizeMoneyString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = str_replace(',', '', trim((string) $value));

        if (!preg_match(self::MONEY_REGEX, $normalized)) {
            return null;
        }

        return number_format((float) $normalized, 2, '.', '');
    }

    public static function normalizeIntegerString(mixed $value, bool $allowZero = false): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = trim((string) $value);
        $regex = $allowZero ? self::NON_NEGATIVE_INTEGER_REGEX : self::POSITIVE_INTEGER_REGEX;

        if (!preg_match($regex, $normalized)) {
            return null;
        }

        return (string) ((int) $normalized);
    }

    public static function toLegacyFloat(mixed $value): float
    {
        return (float) self::normalizeMoneyString($value);
    }
}
