<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function bookings()
    {
        return $this->hasMany(ScheduleBooking::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
