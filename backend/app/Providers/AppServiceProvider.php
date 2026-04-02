<?php

namespace App\Providers;

use App\Models\Address;
use App\Models\Content;
use App\Models\CustomProduct;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Otp;
use App\Models\Payment;
use App\Models\PosItem;
use App\Models\PosTransactions;
use App\Models\PremadeProduct;
use App\Models\Schedule;
use App\Models\ScheduleBooking;
use App\Models\User;
use App\Models\Log;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    protected bool $writingLog = false;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $updatingSnapshots = [];
        $deletingSnapshots = [];

        foreach ([
            User::class,
            Address::class,
            Order::class,
            OrderItem::class,
            Payment::class,
            CustomProduct::class,
            PremadeProduct::class,
            Schedule::class,
            ScheduleBooking::class,
            Content::class,
            PosTransactions::class,
            PosItem::class,
            Otp::class,
        ] as $modelClass) {
            $modelClass::created(fn (Model $model) => $this->writeModelLog($model, 'created'));

            $modelClass::updating(function (Model $model) use (&$updatingSnapshots) {
                $updatingSnapshots[spl_object_id($model)] = $model->getOriginal();
            });

            $modelClass::updated(function (Model $model) use (&$updatingSnapshots) {
                $key = spl_object_id($model);
                $changes = $model->getChanges();
                unset($changes['updated_at']);

                if ($changes === []) {
                    unset($updatingSnapshots[$key]);
                    return;
                }

                $oldValues = [];
                $original = $updatingSnapshots[$key] ?? [];

                foreach (array_keys($changes) as $field) {
                    $oldValues[$field] = $original[$field] ?? null;
                }

                $this->writeModelLog($model, 'updated');

                unset($updatingSnapshots[$key]);
            });

            $modelClass::deleting(function (Model $model) use (&$deletingSnapshots) {
                $deletingSnapshots[spl_object_id($model)] = $model->getOriginal();
            });

            $modelClass::deleted(function (Model $model) use (&$deletingSnapshots) {
                $key = spl_object_id($model);

                $this->writeModelLog($model, 'deleted');

                unset($deletingSnapshots[$key]);
            });
        }
    }

    protected function writeModelLog(Model $model, string $actionType, array $extra = []): void
    {
        if ($model instanceof Log || $this->writingLog) {
            return;
        }

        $this->writeLog([
            'event' => $this->buildEvent($model, $actionType),
            'module' => $this->buildModule($model),
        ]);
    }

    protected function writeLog(array $data): void
    {
        if ($this->writingLog) {
            return;
        }

        $request = request();
        $user = Auth::user();
        $this->writingLog = true;

        try {
            Log::create([
                'user_id' => $data['user_id'] ?? ($user->id ?? null),
                'user_name' => $data['user_name'] ?? $this->userName($user),
                'user_role' => $data['user_role'] ?? ($user->role ?? null),
                'event' => $data['event'],
                'module' => $data['module'] ?? null,
                'source' => $data['source'] ?? $this->detectSource($request),
            ]);
        } finally {
            $this->writingLog = false;
        }
    }

    protected function detectSource(?Request $request): string
    {
        $userAgent = $request?->userAgent();

        if (!$userAgent) {
            return 'Backend API';
        }

        $browser = 'Browser';
        $os = 'Unknown OS';

        if (str_contains($userAgent, 'Edg/')) {
            $browser = 'Edge';
        } elseif (str_contains($userAgent, 'OPR/') || str_contains($userAgent, 'Opera')) {
            $browser = 'Opera';
        } elseif (str_contains($userAgent, 'Chrome/') && !str_contains($userAgent, 'Edg/')) {
            $browser = 'Chrome';
        } elseif (str_contains($userAgent, 'Firefox/')) {
            $browser = 'Firefox';
        } elseif (str_contains($userAgent, 'Safari/') && !str_contains($userAgent, 'Chrome/')) {
            $browser = 'Safari';
        }

        if (str_contains($userAgent, 'Windows')) {
            $os = 'Windows';
        } elseif (str_contains($userAgent, 'Mac OS X') || str_contains($userAgent, 'Macintosh')) {
            $os = 'macOS';
        } elseif (str_contains($userAgent, 'Android')) {
            $os = 'Android';
        } elseif (str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad')) {
            $os = 'iOS';
        } elseif (str_contains($userAgent, 'Linux')) {
            $os = 'Linux';
        }

        return $browser . ' (' . $os . ')';
    }

    protected function userName(mixed $user): ?string
    {
        if (!$user) {
            return null;
        }

        $fullName = trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));

        return $fullName !== '' ? $fullName : ($user->email ?? null);
    }

    protected function buildEvent(Model $model, string $actionType): string
    {
        $label = $this->modelLabel($model);

        return match ($actionType) {
            'created' => $label . ' created',
            'updated' => $label . ' updated',
            'deleted' => $label . ' deleted',
            default => $label . ' ' . $actionType,
        };
    }

    protected function buildModule(Model $model): string
    {
        return match ($model->getTable()) {
            'orders', 'order_items', 'payments' => 'Orders',
            'custom_products', 'premade_products', 'products' => 'Products',
            'contents' => 'Content',
            'pos_transactions', 'pos_items' => 'POS',
            'users', 'addresses', 'otps' => 'Users',
            'schedules', 'schedule_bookings' => 'Schedule',
            default => ucfirst(str_replace('_', ' ', $model->getTable())),
        };
    }

    protected function modelLabel(Model $model): string
    {
        foreach (['name', 'schedule_name', 'identifier', 'email', 'product_name', 'payment_id', 'order_id'] as $field) {
            $value = $model->getAttribute($field);

            if (!blank($value)) {
                return (string) $value;
            }
        }

        if ($model instanceof User) {
            $fullName = trim(($model->first_name ?? '') . ' ' . ($model->last_name ?? ''));
            if ($fullName !== '') {
                return $fullName;
            }
        }

        return class_basename($model) . ' #' . $model->getKey();
    }
}
