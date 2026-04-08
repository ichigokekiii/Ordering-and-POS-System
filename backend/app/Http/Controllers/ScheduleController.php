<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ScheduleBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendScheduleBookingMail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
        $validator = Validator::make($request->all(), [
            // Changed regex to only block < and > tags, allowing all other symbols
            'schedule_name'        => ['required', 'string', 'max:255', 'regex:/^[^<>]*$/'],
            'location'             => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-.,#]+$/'],
            'schedule_description' => ['nullable', 'string', 'max:1000', 'regex:/^[^<>]*$/'], 
            'event_date'           => 'required|date|after_or_equal:today',
            'image'                => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'isAvailable'          => 'required|in:0,1,true,false'
        ], [
            'schedule_name.regex'        => 'Event name cannot contain HTML tags (< >).',
            'location.regex'             => 'Location contains invalid symbols.',
            'schedule_description.regex' => 'Description cannot contain HTML tags (< >).',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('schedules', 'public');
            $validated['image'] = Storage::url($path);
        }

        $schedule = Schedule::create($validated);

        return response()->json($schedule, 201);
    }

    // UPDATE schedule
    public function update(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);

        $validator = Validator::make($request->all(), [
            // Changed regex to only block < and > tags, allowing all other symbols
            'schedule_name'        => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[^<>]*$/'],
            'location'             => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-.,#]+$/'],
            'schedule_description' => ['nullable', 'string', 'max:1000', 'regex:/^[^<>]*$/'],
            'event_date'           => 'sometimes|required|date|after_or_equal:today', 
            'image'                => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'isAvailable'          => 'sometimes|in:0,1,true,false'
        ], [
            'schedule_name.regex'        => 'Event name cannot contain HTML tags (< >).',
            'location.regex'             => 'Location contains invalid symbols.',
            'schedule_description.regex' => 'Description cannot contain HTML tags (< >).',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('schedules', 'public');
            $validated['image'] = Storage::url($path);
        }

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

    // Email to Calendar
    public function book(Request $request, $id)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $schedule = Schedule::findOrFail($id);

        if (Carbon::parse($schedule->event_date)->lt(Carbon::today())) {
            return response()->json(['message' => 'This event has already passed and cannot be booked.'], 400);
        }

        $existingBooking = ScheduleBooking::where('schedule_id', $schedule->id)
            ->where('email', $request->email)
            ->first();

        if ($existingBooking) {
            return response()->json(['message' => 'You have already booked this event.'], 400);
        }

        ScheduleBooking::firstOrCreate([
            'schedule_id' => $schedule->id,
            'email' => $request->email,
        ]);

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