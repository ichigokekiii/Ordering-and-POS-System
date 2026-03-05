<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Otp;
use App\Mail\SendOtpMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // Get all users
    public function index()
    {
        // Only admin and owner can view users
        if (!Auth::check() || !in_array(Auth::user()->role, ['admin', 'owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = User::all();
        return response()->json($users);
    }

    // Public Registration (with OTP)
    public function register(Request $request)
    {
        $firstName = $request->input('first_name');
        $lastName = $request->input('last_name');
        $email = $request->input('email');
        $password = $request->input('password');
        $phoneNumber = $request->input('phone_number');

        if (empty($email)) {
            return response()->json(['error' => 'Email is required'], 400);
        }

        if (empty($password) || strlen($password) < 6) {
            return response()->json(['error' => 'Password must be at least 6 characters'], 400);
        }

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
        $user->role = 'user';
        $user->status = 'Active';
        $user->phone_number = $phoneNumber;
        $user->failed_attempt_count = 0;
        $user->last_failed_attempt_at = null;
        $user->is_locked = false;
        $user->priority = 0;
        $user->save();

        $otpCode = rand(100000, 999999);

        Otp::create([
            'user_id' => $user->id,
            'code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        Mail::to($user->email)->send(new SendOtpMail($otpCode));

        return response()->json([
            'message' => 'User registered successfully. OTP sent to email.',
            'email' => $user->email
        ], 201);
    }

    // Admin Create User (NO OTP)
    public function store(Request $request)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $firstName = $request->input('first_name');
        $lastName = $request->input('last_name');
        $email = $request->input('email');
        $password = $request->input('password');
        $role = $request->input('role', 'user');
        $status = $request->input('status', 'active');
        $phoneNumber = $request->input('phone_number');

        if (empty($email)) {
            return response()->json(['error' => 'Email is required'], 400);
        }

        if (empty($password) || strlen($password) < 6) {
            return response()->json(['error' => 'Password must be at least 6 characters'], 400);
        }

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
        $user->is_verified = true; // Admin-created users bypass OTP
        $user->failed_attempt_count = 0;
        $user->last_failed_attempt_at = null;
        $user->is_locked = false;
        $user->priority = 0;
        $user->save();

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user
        ], 201);
    }

    // Get one user
    public function show($id)
    {
        // Only admin and owner can view user details
        if (!Auth::check() || !in_array(Auth::user()->role, ['admin', 'owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    // Update user
    public function update(Request $request, $id)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Admin can update everything
        // Owner can update basic info but NOT role
        if (Auth::user()->role === 'owner') {
            if ($request->filled('role')) {
                return response()->json(['error' => 'Owner cannot change roles'], 403);
            }
        } elseif (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

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
        // Only admin can delete users
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User archived successfully']);
    }
}