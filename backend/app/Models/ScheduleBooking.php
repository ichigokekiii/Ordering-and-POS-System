<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleBooking extends Model
{
    protected $fillable = [
        'schedule_id',
        'email',
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

}
