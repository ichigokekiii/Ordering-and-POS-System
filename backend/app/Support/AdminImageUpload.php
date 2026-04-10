<?php

namespace App\Support;

class AdminImageUpload
{
    private const APPLICATION_MAX_KILOBYTES = 2048;

    public static function maxKilobytes(): int
    {
        return min(
            self::APPLICATION_MAX_KILOBYTES,
            self::iniBytesToKilobytes((string) ini_get('upload_max_filesize')),
            self::iniBytesToKilobytes((string) ini_get('post_max_size'))
        );
    }

    public static function maxLabel(): string
    {
        $kilobytes = self::maxKilobytes();

        if ($kilobytes >= 1024) {
            $megabytes = $kilobytes / 1024;
            $formatted = fmod($megabytes, 1.0) === 0.0
                ? number_format($megabytes, 0)
                : number_format($megabytes, 1);

            return "{$formatted}MB";
        }

        return "{$kilobytes}KB";
    }

    public static function validationMessages(string $field = 'image'): array
    {
        return [
            "{$field}.uploaded" => 'Image upload failed. Please use an image under ' . self::maxLabel() . '.',
            "{$field}.mimes" => 'Only JPG, JPEG, and PNG files are allowed.',
            "{$field}.max" => 'Image must be ' . self::maxLabel() . ' or smaller.',
        ];
    }

    private static function iniBytesToKilobytes(string $value): int
    {
        $trimmed = trim($value);
        if ($trimmed === '') {
            return self::APPLICATION_MAX_KILOBYTES;
        }

        $unit = strtolower(substr($trimmed, -1));
        $number = (float) $trimmed;

        $bytes = match ($unit) {
            'g' => $number * 1024 * 1024 * 1024,
            'm' => $number * 1024 * 1024,
            'k' => $number * 1024,
            default => (float) $trimmed,
        };

        return max(1, (int) floor($bytes / 1024));
    }
}
