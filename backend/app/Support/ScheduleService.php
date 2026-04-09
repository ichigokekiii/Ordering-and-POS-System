<?php

namespace App\Support;

use App\Models\Schedule;
use Carbon\Carbon;

class ScheduleService
{
    public static function syncPastSchedules(): void
    {
        Schedule::query()
            ->whereDate('event_date', '<', Carbon::today())
            ->where('isArchived', false)
            ->update([
                'isArchived' => true,
            ]);
    }

    public static function findOrderableSchedule(int $scheduleId): ?Schedule
    {
        self::syncPastSchedules();

        return Schedule::query()
            ->whereKey($scheduleId)
            ->where('isArchived', false)
            ->where('isAvailable', true)
            ->whereDate('event_date', '>=', Carbon::today())
            ->first();
    }

    public static function findBookableSchedule(int $scheduleId): ?Schedule
    {
        self::syncPastSchedules();

        return Schedule::query()
            ->whereKey($scheduleId)
            ->where('isArchived', false)
            ->whereDate('event_date', '>=', Carbon::today())
            ->first();
    }
}
