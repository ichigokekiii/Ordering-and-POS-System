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
use App\Support\ScheduleService;

class ScheduleController extends Controller
{
    private function canViewAll(Request $request): bool
    {
        $user = $request->user();

        return $user && in_array(strtolower((string) $user->role), ['admin', 'owner', 'staff'], true);
    }

    // GET all schedules
    public function index(Request $request)
    {
        ScheduleService::syncPastSchedules();

        return response()->json(
            Schedule::query()
                ->when(
                    !$this->canViewAll($request),
                    fn ($query) => $query->where('isArchived', false)
                )
                ->orderBy('event_date')
                ->get()
        );
    }

    public function show(Request $request, $id)
    {
        ScheduleService::syncPastSchedules();

        return response()->json(
            Schedule::query()
                ->when(
                    !$this->canViewAll($request),
                    fn ($query) => $query->where('isArchived', false)
                )
                ->findOrFail($id)
        );
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
            'image'                => 'required|image|mimes:jpg,jpeg,png|max:5120',
            'isAvailable'          => 'required|boolean',
            'isArchived'           => 'sometimes|boolean',
        ], [
            'schedule_name.regex'        => 'Event name cannot contain HTML tags (< >).',
            'location.regex'             => 'Location contains invalid symbols.',
            'schedule_description.regex' => 'Description cannot contain HTML tags (< >).',
            'image.required'             => 'Please upload an image for this event.',
            'image.mimes'                => 'Only JPG, JPEG, and PNG files are allowed.',
            'image.max'                  => 'Image must be 5MB or smaller.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $validated['isAvailable'] = $request->boolean('isAvailable');
        $validated['isArchived'] = $request->boolean('isArchived');

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
        ScheduleService::syncPastSchedules();
        $schedule = Schedule::findOrFail($id);

        $validator = Validator::make($request->all(), [
            // Changed regex to only block < and > tags, allowing all other symbols
            'schedule_name'        => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[^<>]*$/'],
            'location'             => ['sometimes', 'required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-.,#]+$/'],
            'schedule_description' => ['nullable', 'string', 'max:1000', 'regex:/^[^<>]*$/'],
            'event_date'           => 'sometimes|required|date|after_or_equal:today', 
            'image'                => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'isAvailable'          => 'sometimes|boolean',
            'isArchived'           => 'sometimes|boolean',
        ], [
            'schedule_name.regex'        => 'Event name cannot contain HTML tags (< >).',
            'location.regex'             => 'Location contains invalid symbols.',
            'schedule_description.regex' => 'Description cannot contain HTML tags (< >).',
            'image.mimes'                => 'Only JPG, JPEG, and PNG files are allowed.',
            'image.max'                  => 'Image must be 5MB or smaller.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        if ($request->has('isAvailable')) {
            $validated['isAvailable'] = $request->boolean('isAvailable');
        }

        if ($request->has('isArchived')) {
            $validated['isArchived'] = $request->boolean('isArchived');
        }

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
        ScheduleService::syncPastSchedules();
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

        $schedule = ScheduleService::findBookableSchedule((int) $id);

        if (!$schedule) {
            return response()->json([
                'message' => 'This event is no longer available for booking.',
            ], 400);
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
