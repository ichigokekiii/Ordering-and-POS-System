<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    // GET /api/feedbacks
    public function index()
    {
        $feedbacks = Feedback::with('user:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($feedbacks);
    }

    // POST /api/feedbacks
    public function store(Request $request)
    {
        $validated = $request->validate([
            'feedback_rating' => 'required|integer|min:1|max:5',
            'feedback_text'   => 'required|string',
        ]);

        $feedback = Feedback::create([
            'user_id'         => Auth::id(),
            'feedback_rating' => $validated['feedback_rating'],
            'feedback_text'   => $validated['feedback_text'],
        ]);

        return response()->json($feedback, 201);
    }
}