<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Name;

class NameController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate input
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // 2. Save to database
        $name = Name::create([
            'name' => $request->name,
        ]);

        // 3. Return response
        return response()->json([
            'message' => 'Name saved successfully',
            'data' => $name,
        ], 201);
    }
}
