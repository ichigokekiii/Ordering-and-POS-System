<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ScheduleBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendScheduleBookingMail;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    // GET all schedules
    public function index()
    {
        return response()->json(Schedule::all());
    }

    // CREATE schedule
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_name' => 'required|string|max:255',
            'image' => 'nullable|string',
            'schedule_description' => 'nullable|string',
            'event_date' => 'required|date',
            'isAvailable' => 'boolean'
        ]);

        $schedule = Schedule::create($validated);

        return response()->json($schedule, 201);
    }

    // UPDATE schedule
    public function update(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);

        $validated = $request->validate([
            'schedule_name' => 'sometimes|required|string|max:255',
            'image' => 'nullable|string',
            'schedule_description' => 'nullable|string',
            'event_date' => 'sometimes|required|date',
            'isAvailable' => 'boolean'
        ]);

        $schedule->update($validated);

        return response()->json($schedule);
    }

    // DELETE schedule
    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();

        return response()->json(['message' => 'Schedule deleted successfully']);
    }

    //Email to Calendar
    public function book(Request $request, $id)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $schedule = Schedule::findOrFail($id);

        // Prevent duplicate booking for same email + schedule
        $existingBooking = ScheduleBooking::where('schedule_id', $schedule->id)
            ->where('email', $request->email)
            ->first();

        if ($existingBooking) {
            return response()->json([
                'message' => 'You have already booked this event.'
            ], 400);
        }

        // Store booking
        ScheduleBooking::create([
            'schedule_id' => $schedule->id,
            'email' => $request->email,
        ]);

        // Generate Google Calendar link
        $start = Carbon::parse($schedule->event_date)->format('Ymd\THis');
        $end = Carbon::parse($schedule->event_date)->addHours(2)->format('Ymd\THis');

        $calendarUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE"
            . "&text=" . urlencode($schedule->schedule_name)
            . "&dates={$start}/{$end}"
            . "&details=" . urlencode($schedule->schedule_description)
            . "&location=" . urlencode($schedule->location);

        Mail::to($request->email)->send(
            new SendScheduleBookingMail($schedule, $calendarUrl)
        );

        return response()->json([
            'message' => 'Booking successful. Check your email.'
        ]);
    }
}