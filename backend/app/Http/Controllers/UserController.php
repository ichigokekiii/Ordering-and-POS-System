<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    // Register (for /api/register route)
    public function register(Request $request)
    {
        return $this->store($request);
    }

    // Create new user
    public function store(Request $request)
    {
        $firstName = $request->input('first_name');
        $lastName = $request->input('last_name');

        $email = $request->input('email');
        $password = $request->input('password');
        $role = 'user';
        $status = $request->input('status', 'active');
        $phoneNumber = $request->input('phone_number');

        // Basic validation
        if (empty($email)) {
            return response()->json(['error' => 'Email is required'], 400);
        }

        if (empty($password) || strlen($password) < 6) {
            return response()->json(['error' => 'Password must be at least 6 characters'], 400);
        }

        // Check duplicate email
        if (User::where('email', $email)->exists()) {
            return response()->json(['error' => 'Email already exists'], 400);
        }

        if (empty($firstName) || empty($lastName)) {
            return response()->json(['error' => 'First name and last name are required'], 400);
        }

        $user = new User();

        $user->first_name = $firstName;
        $user->last_name = $lastName;

        $user->email = $email;
        $user->password = Hash::make($password);
        $user->role = $role;
        $user->status = $status;
        $user->phone_number = $phoneNumber;

        // Security defaults
        $user->failed_attempt_count = 0;
        $user->last_failed_attempt_at = null;
        $user->is_locked = false;
        $user->priority = 0;

        $user->save();

        return response()->json($user, 201);
    }

    // Get one user
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    // Update user
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if ($request->filled('first_name')) {
            $user->first_name = $request->input('first_name');
        }

        if ($request->filled('last_name')) {
            $user->last_name = $request->input('last_name');
        }

        if ($request->filled('name')) {
            $user->name = $request->input('name');
        }

        if ($request->filled('email')) {
            $user->email = $request->input('email');
        }

        if ($request->filled('role')) {
            $user->role = $request->input('role');
        }

        if ($request->filled('status')) {
            $user->status = $request->input('status');
        }

        if ($request->filled('phone_number')) {
            $user->phone_number = $request->input('phone_number');
        }

        if ($request->filled('is_locked')) {
            $user->is_locked = $request->input('is_locked');
        }

        if ($request->filled('priority')) {
            $user->priority = $request->input('priority');
        }

        $user->save();

        return response()->json($user);
    }

    // Soft delete user
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User archived successfully']);
    }
}
