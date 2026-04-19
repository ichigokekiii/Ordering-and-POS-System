<?php

namespace App\Support;

use App\Models\DeliveryOption;
use App\Models\DeliveryZone;
use App\Models\OrderStatus;
use App\Models\PaymentStatus;
use App\Models\Role;
use App\Models\UserStatus;
use Illuminate\Support\Collection;

class LookupCatalog
{
    public const CUSTOMER_ROLE_CODE = 'user';
    public const DEFAULT_USER_STATUS = 'active';
    public const DEFAULT_ORDER_STATUS = 'pending';
    public const DEFAULT_PAYMENT_STATUS = 'pending';
    public const DEFAULT_DELIVERY_OPTION = 'pickup';
    public const DEFAULT_DELIVERY_ZONE = 'southern_luzon';

    public static function normalizeRoleCode(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'customer', 'user' => 'user',
            'staff' => 'staff',
            'admin' => 'admin',
            'owner' => 'owner',
            default => self::CUSTOMER_ROLE_CODE,
        };
    }

    public static function normalizeUserStatusCode(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'active' => 'active',
            'inactive', 'disabled', 'locked' => 'inactive',
            default => self::DEFAULT_USER_STATUS,
        };
    }

    public static function normalizeOrderStatusCode(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'pending' => 'pending',
            'processing', 'confirmed' => 'processing',
            'shipped' => 'shipped',
            'delivered', 'completed' => 'delivered',
            'cancelled', 'canceled' => 'cancelled',
            default => self::DEFAULT_ORDER_STATUS,
        };
    }

    public static function normalizePaymentStatusCode(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'pending' => 'pending',
            'confirmed', 'paid', 'success' => 'confirmed',
            'cancelled', 'canceled', 'failed', 'error' => 'cancelled',
            default => self::DEFAULT_PAYMENT_STATUS,
        };
    }

    public static function normalizeDeliveryOptionCode(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'pickup', 'pick_up' => 'pickup',
            'delivery' => 'delivery',
            default => self::DEFAULT_DELIVERY_OPTION,
        };
    }

    public static function normalizeDeliveryZoneCode(?string $value): string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'southern_luzon', 'southern luzon' => 'southern_luzon',
            'other' => 'other',
            default => self::DEFAULT_DELIVERY_ZONE,
        };
    }

    public static function roleIdFor(?string $code): ?int
    {
        return Role::query()
            ->where('code', self::normalizeRoleCode($code))
            ->value('id');
    }

    public static function userStatusIdFor(?string $code): ?int
    {
        return UserStatus::query()
            ->where('code', self::normalizeUserStatusCode($code))
            ->value('id');
    }

    public static function orderStatusIdFor(?string $code): ?int
    {
        return OrderStatus::query()
            ->where('code', self::normalizeOrderStatusCode($code))
            ->value('id');
    }

    public static function paymentStatusIdFor(?string $code): ?int
    {
        return PaymentStatus::query()
            ->where('code', self::normalizePaymentStatusCode($code))
            ->value('id');
    }

    public static function deliveryOptionIdFor(?string $code): ?int
    {
        return DeliveryOption::query()
            ->where('code', self::normalizeDeliveryOptionCode($code))
            ->value('id');
    }

    public static function deliveryZoneIdFor(?string $code): ?int
    {
        return DeliveryZone::query()
            ->where('code', self::normalizeDeliveryZoneCode($code))
            ->value('id');
    }

    public static function orderStatusesForApi(): array
    {
        return OrderStatus::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (OrderStatus $status) => [
                'id' => $status->id,
                'code' => $status->code,
                'label' => $status->label,
                'description' => $status->description,
                'colors' => [
                    'background' => $status->badge_background,
                    'border' => $status->badge_border,
                    'text' => $status->badge_text,
                ],
            ])
            ->all();
    }

    public static function orderStatusMeta(?string $code): array
    {
        $normalizedCode = self::normalizeOrderStatusCode($code);
        $status = OrderStatus::query()->where('code', $normalizedCode)->first();

        if (!$status) {
            return [
                'code' => $normalizedCode,
                'label' => ucfirst($normalizedCode ?: 'Unknown'),
                'description' => null,
                'colors' => [
                    'background' => '#f3f4f6',
                    'border' => '#d1d5db',
                    'text' => '#4b5563',
                ],
            ];
        }

        return [
            'code' => $status->code,
            'label' => $status->label,
            'description' => $status->description,
            'colors' => [
                'background' => $status->badge_background,
                'border' => $status->badge_border,
                'text' => $status->badge_text,
            ],
        ];
    }

    public static function orderStatusLegend(): array
    {
        return self::orderStatusesForApi();
    }

    public static function activeDeliveryZonesForApi(): array
    {
        return DeliveryZone::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (DeliveryZone $zone) => [
                'id' => $zone->id,
                'code' => $zone->code,
                'label' => $zone->label,
                'description' => $zone->description,
                'requires_other_details' => (bool) $zone->requires_other_details,
            ])
            ->all();
    }

    public static function fullCatalog(): array
    {
        return [
            'roles' => self::mapSimpleLookup(Role::query()->orderBy('sort_order')->get()),
            'user_statuses' => self::mapSimpleLookup(UserStatus::query()->orderBy('sort_order')->get()),
            'order_statuses' => self::orderStatusesForApi(),
            'payment_statuses' => self::mapSimpleLookup(PaymentStatus::query()->orderBy('sort_order')->get()),
            'delivery_options' => self::mapSimpleLookup(DeliveryOption::query()->orderBy('sort_order')->get()),
            'delivery_zones' => self::activeDeliveryZonesForApi(),
        ];
    }

    protected static function mapSimpleLookup(Collection $rows): array
    {
        return $rows->map(fn ($row) => [
            'id' => $row->id,
            'code' => $row->code,
            'label' => $row->label,
            'description' => $row->description,
        ])->all();
    }
}
