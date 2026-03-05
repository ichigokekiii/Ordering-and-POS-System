<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $user->load('addresses');

        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'addresses' => $user->addresses
        ]);
    }

    /**
     * Request OTP when user wants to change email
     */
    public function requestEmailChangeOtp(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
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

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,

            'addresses' => 'sometimes|array|max:3',
            'addresses.*.house_number' => 'required|string|max:20',
            'addresses.*.street' => 'required|string|max:255',
            'addresses.*.barangay' => 'required|string|max:255',
            'addresses.*.city' => 'required|string|max:255',
            'addresses.*.zip_code' => 'required|string|max:10',
        ]);

        $user->update([
            'first_name' => $validated['first_name'] ?? $user->first_name,
            'last_name' => $validated['last_name'] ?? $user->last_name,
            'phone_number' => $validated['phone_number'] ?? $user->phone_number,
            'email' => $validated['email'] ?? $user->email,
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
            'user' => $user->load('addresses')
        ]);
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
