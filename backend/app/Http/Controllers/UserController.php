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
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    private function canViewUsers(): bool
    {
        return Auth::check()
            && in_array(Auth::user()->role, ['admin', 'owner', 'staff'], true);
    }

    private function normalizeUserInput(Request $request): void
    {
        $normalizedInput = [];

        if ($request->has('first_name')) {
            $normalizedInput['first_name'] = trim((string) $request->input('first_name'));
        }

        if ($request->has('last_name')) {
            $normalizedInput['last_name'] = trim((string) $request->input('last_name'));
        }

        if ($request->has('email')) {
            $normalizedInput['email'] = trim((string) $request->input('email'));
        }

        if ($request->has('phone_number')) {
            $normalizedInput['phone_number'] = preg_replace('/\D+/', '', (string) $request->input('phone_number'));
        }

        if (!empty($normalizedInput)) {
            $request->merge($normalizedInput);
        }
    }

    // Get all users
    public function index()
    {
        // Staff keep read-only access here; mutating routes remain admin-only.
        if (!$this->canViewUsers()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = User::all();
        return response()->json($users);
    }

    // Public Registration (with OTP)
public function register(Request $request)
    {
        $this->normalizeUserInput($request);

        $validator = Validator::make($request->all(), [
            'first_name'   => ['required', 'string', 'min:2', 'max:50', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'last_name'    => ['required', 'string', 'min:2', 'max:50', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'email'        => 'required|string|email|max:255|unique:users,email',
            'password'     => 'required|string|min:6',
            'phone_number' => ['required', 'string', 'regex:/^\d{11}$/'],
            'terms_accepted' => 'accepted',
            'terms_scope'    => 'required|string|in:customer',
        ], [
            'first_name.regex'   => 'First name can only contain letters and spaces.',
            'last_name.regex'    => 'Last name can only contain letters and spaces.',
            'phone_number.regex' => 'Phone number must be exactly 11 digits.',
            'terms_accepted.accepted' => 'Please review and accept the Customer Terms & Conditions.',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $user = new User();
        $user->first_name = $request->input('first_name');
        $user->last_name = $request->input('last_name');
        $user->email = $request->input('email');
        $user->password = Hash::make($request->input('password'));
        $user->role = 'user';
        $user->status = 'Active';
        $user->phone_number = $request->input('phone_number');
        $user->failed_attempt_count = 0;
        $user->is_locked = false;
        $user->priority = 0;
        $user->consecutive_cancellations = 0;
        $user->save();

        $otpCode = rand(100000, 999999);

        Otp::updateOrCreate(
            ['user_id' => $user->id],
            ['code' => $otpCode, 'expires_at' => Carbon::now()->addMinutes(5)]
        );

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

        $this->normalizeUserInput($request);

        $validator = Validator::make($request->all(), [
            'first_name'   => ['required', 'string', 'min:2', 'max:50', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'last_name'    => ['required', 'string', 'min:2', 'max:50', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'email'        => 'required|string|email|max:255|unique:users,email',
            'password'     => 'required|string|min:6',
            'phone_number' => ['required', 'string', 'regex:/^\d{11}$/'],
            'role'         => 'nullable|string|in:user,staff,admin,owner',
            'status'       => 'nullable|string',
            'terms_accepted' => 'accepted',
            'terms_scope'    => 'required|string|in:customer,internal',
        ], [
            'first_name.regex'   => 'First name can only contain letters and spaces.',
            'last_name.regex'    => 'Last name can only contain letters and spaces.',
            'phone_number.regex' => 'Phone number must be exactly 11 digits.',
            'terms_accepted.accepted' => 'Please review and accept the applicable Terms & Conditions.',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $expectedTermsScope = in_array(Auth::user()->role, ['admin', 'owner', 'staff'], true)
            ? 'internal'
            : 'customer';

        if ($request->input('terms_scope') !== $expectedTermsScope) {
            return response()->json([
                'error' => 'The selected terms do not match the assigned role.'
            ], 400);
        }

        $user = new User();
        $user->first_name = $request->input('first_name');
        $user->last_name = $request->input('last_name');
        $user->email = $request->input('email');
        $user->password = Hash::make($request->input('password'));
        $user->role = $request->input('role', 'user');
        $user->status = $request->input('status', 'active');
        $user->phone_number = $request->input('phone_number');
        $user->is_verified = true;
        $user->failed_attempt_count = 0;
        $user->is_locked = false;
        $user->priority = 0;
        $user->consecutive_cancellations = 0;
        $user->save();

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user
        ], 201);
    }

    // Get one user
    public function show($id)
    {
        if (!$this->canViewUsers()) {
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

        if (Auth::user()->role === 'owner' && $request->filled('role')) {
            return response()->json(['error' => 'Owner cannot change roles'], 403);
        } elseif (Auth::user()->role !== 'admin' && Auth::user()->role !== 'owner') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $this->normalizeUserInput($request);

        // Validate incoming data safely
        $validator = Validator::make($request->all(), [
            'first_name'   => ['sometimes', 'string', 'min:2', 'max:50', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'last_name'    => ['sometimes', 'string', 'min:2', 'max:50', 'regex:/^[a-zA-Z\s\-\']+$/'],
            'phone_number' => ['sometimes', 'string', 'regex:/^\d{11}$/'],
        ], [
            'first_name.regex'   => 'First name can only contain letters and spaces.',
            'last_name.regex'    => 'Last name can only contain letters and spaces.',
            'phone_number.regex' => 'Phone number must be exactly 11 digits.',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        // Handle email change with OTP
        if ($request->filled('email')) {
            if ($request->input('email') !== $user->email) {
                // Email is being changed, require OTP
                if (!$request->filled('email_otp')) {
                    return response()->json(['error' => 'OTP required for email change'], 400);
                }

                // Verify OTP
                $otp = Otp::where('user_id', $user->id)
                         ->where('code', $request->input('email_otp'))
                         ->where('expires_at', '>', Carbon::now())
                         ->first();

                if (!$otp) {
                    return response()->json(['error' => 'Invalid or expired OTP'], 400);
                }

                // Delete the OTP after use
                $otp->delete();

                $user->email = $request->input('email');
                $user->is_verified = true; // Admin-verified change
            }
        }

        // Handle password change with OTP
        if ($request->filled('password')) {
            if (!$request->filled('password_otp')) {
                return response()->json(['error' => 'OTP required for password change'], 400);
            }

            // Verify OTP
            $otp = Otp::where('user_id', $user->id)
                     ->where('code', $request->input('password_otp'))
                     ->where('expires_at', '>', Carbon::now())
                     ->first();

            if (!$otp) {
                return response()->json(['error' => 'Invalid or expired OTP'], 400);
            }

            // Delete the OTP after use
            $otp->delete();

            $user->password = Hash::make($request->input('password'));
        }

        if ($request->filled('first_name')) {
            $user->first_name = $request->input('first_name');
        }

        if ($request->filled('last_name')) {
            $user->last_name = $request->input('last_name');
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
            $isLocked = filter_var($request->input('is_locked'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            $user->is_locked = $isLocked;

            // When admin unlocks the account, reset the failed attempt counters
            if ($isLocked === false) {
                $user->failed_attempt_count = 0;
                $user->last_failed_attempt_at = null;
                $user->priority = 0;
                $user->consecutive_cancellations = 0;
                $user->status = 'Active';
            }
        }

        if ($request->filled('priority')) {
            $user->priority = min(max((int) $request->input('priority'), 0), 3);
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

    // Send email change OTP for admin
    public function sendEmailOtp(Request $request, $id)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $email = $request->input('email');
        if (empty($email)) {
            return response()->json(['error' => 'Email is required'], 400);
        }

        if (User::where('email', $email)->where('id', '!=', $id)->exists()) {
            return response()->json(['error' => 'Email already exists'], 400);
        }

        $otpCode = rand(100000, 999999);

        Otp::updateOrCreate([
            'user_id' => $user->id,
        ], [
            'code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        Mail::to($email)->send(new SendOtpMail($otpCode));

        return response()->json(['message' => 'OTP sent to new email address']);
    }

    // Send password change OTP for admin
    public function sendPasswordOtp(Request $request, $id)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $otpCode = rand(100000, 999999);

        Otp::updateOrCreate([
            'user_id' => $user->id,
        ], [
            'code' => $otpCode,
            'expires_at' => Carbon::now()->addMinutes(5),
        ]);

        Mail::to($user->email)->send(new SendOtpMail($otpCode));

        return response()->json(['message' => 'OTP sent to user email']);
    }
}
