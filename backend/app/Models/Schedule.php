<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Schedule extends Model
{
    use HasFactory;

    protected static ?bool $hasOrderableProductsCache = null;

    protected $fillable = [
        'schedule_name',
        'image',
        'schedule_description',
        'location',
        'event_date',
        'isAvailable',
        'isArchived',
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'isAvailable' => 'boolean',
        'isArchived' => 'boolean',
    ];

    protected $appends = ['is_orderable'];

    public function getIsOrderableAttribute(): bool
    {
        if (!$this->isAvailable || $this->isArchived) {
            return false;
        }

        $eventDate = $this->event_date instanceof Carbon
            ? $this->event_date
            : Carbon::parse($this->event_date);

        if ($eventDate->isPast() && !$eventDate->isToday()) {
            return false;
        }

        if (static::$hasOrderableProductsCache === null) {
            static::$hasOrderableProductsCache = DB::table('products')
                ->where('isAvailable', true)
                ->where('isArchived', false)
                ->exists();
        }

        return static::$hasOrderableProductsCache;
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(ScheduleBooking::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
