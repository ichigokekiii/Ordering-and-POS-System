<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;

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
}