<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Otp;
use App\Mail\SendOtpMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Get authenticated user's profile with addresses
     */
public function profile()
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Load addresses and orders (sorted newest first)
        $user->load([
            'addresses', 
            'orders' => function($query) {
                $query->orderBy('created_at', 'desc');
            }
        ]);

        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'role' => $user->role,
            'addresses' => $user->addresses,
            'orders' => $user->orders // <-- Added orders to the API response
        ]);
    }

    /**
     * Request OTP when user wants to change email
     */
    public function requestEmailChangeOtp(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        if ($request->email === $user->email) {
            return response()->json(['message' => 'New email must be different from current email'], 422);
        }

        $request->validate([
            'email' => 'required|email|unique:users,email',
        ]);

        $otpCode = rand(100000, 999999);

        Otp::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(5),
            ]
        );

        Mail::to($request->email)->send(new SendOtpMail($otpCode));

        return response()->json([
            'message' => 'OTP sent to new email address'
        ]);
    }

    /**
     * Update profile info and addresses
     */
    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        if ($request->has('email')) {
            return response()->json(['message' => 'Use email change flow with OTP to update email'], 422);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone_number' => 'nullable|string|max:20',

            'addresses' => 'sometimes|array|max:3',
            'addresses.*.house_number' => ['required','string','max:20','regex:/^\d+$/'],
            'addresses.*.street' => ['required','string','max:255','regex:/^[a-zA-Z0-9\s\-,\.#+]+$/'],
            'addresses.*.barangay' => ['required','string','max:255','regex:/^[a-zA-Z0-9\s\-,\.#+]+$/'],
            'addresses.*.city' => ['required','string','max:255','regex:/^[a-zA-Z\s\-\']+$/'],
            'addresses.*.zip_code' => 'required|digits:4',
        ]);

        $user->update([
            'first_name' => $validated['first_name'] ?? $user->first_name,
            'last_name' => $validated['last_name'] ?? $user->last_name,
            'phone_number' => $validated['phone_number'] ?? $user->phone_number,
        ]);

        if ($request->has('addresses')) {
            $user->addresses()->delete();

            $addresses = $request->input('addresses', []);

            foreach ($addresses as $address) {
                $user->addresses()->create($address);
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'addresses' => $user->load('addresses')->addresses
            ]
        ]);
    }

    /**
     * Verify OTP and change email
     */
    public function verifyEmailChangeOtp(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'email' => 'required|email|unique:users,email',
            'otp' => 'required|digits:6',
        ]);

        if ($request->email === $user->email) {
            return response()->json(['message' => 'New email must be different from current email'], 422);
        }

        $otp = Otp::where('user_id', $user->id)
            ->where('code', $request->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        $user->email = $request->email;
        $user->save();

        $otp->delete();

        return response()->json(['message' => 'Email updated successfully', 'email' => $user->email]);
    }

    /**
     * Request OTP for password change
     */
    public function requestPasswordChangeOtp(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $otpCode = rand(100000, 999999);

        Otp::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(5),
            ]
        );

        Mail::to($user->email)->send(new SendOtpMail($otpCode));

        return response()->json([
            'message' => 'OTP sent to your email address'
        ]);
    }

    /**
     * Verify OTP and change password
     */
    public function verifyPasswordChangeOtp(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required|string',
            'otp' => 'required|digits:6',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        if (Hash::check($request->new_password, $user->password)) {
            return response()->json(['message' => 'New password must be different from current password'], 422);
        }

        $otp = Otp::where('user_id', $user->id)
            ->where('code', $request->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        $otp->delete();

        return response()->json(['message' => 'Password changed successfully']);
    }

    /**
     * Delete user account
     */
    public function deleteAccount()
    {
        /** @var User $user */
        $user = Auth::user();

        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }
}
