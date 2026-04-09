<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Products;

class Schedule extends Model
{
    use HasFactory;

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
        'isAvailable' => 'boolean',
        'isArchived' => 'boolean',
    ];

    protected $appends = ['is_orderable'];

    public function getIsOrderableAttribute(): bool
{
    \Log::info('getIsOrderableAttribute called', [
        'id' => $this->id,
        'isAvailable' => $this->isAvailable,
        'isArchived' => $this->isArchived,
    ]);

    if (!$this->isAvailable) return false;
    if ($this->isArchived) return false;

    $exists = \DB::table('products')
                 ->where('isAvailable', 1)
                 ->where('isArchived', 0)
                 ->exists();

    \Log::info('products check', ['exists' => $exists]);

    return $exists;
}

    public function bookings()
    {
        return $this->hasMany(ScheduleBooking::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}