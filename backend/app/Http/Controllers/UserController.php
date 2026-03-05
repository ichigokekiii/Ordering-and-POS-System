<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Otp;
use App\Mail\SendOtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class UserController extends Controller
{
    public function profile()
    {
        return response()->json(Auth::user()->load('addresses'));
    }

    public function requestEmailChangeOtp(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $otpCode = rand(100000, 999999);

        Otp::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code' => $otpCode,
                'expires_at' => now()->addMinutes(10)
            ]
        );

        Mail::to($request->email)->send(new SendOtpMail($otpCode));

        return response()->json(['message' => 'OTP sent successfully to ' . $request->email]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $rules = [
            'first_name'   => 'required|string|max:255',
            'last_name'    => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'email'        => 'required|email|unique:users,email,' . $user->id,
            // FIX: Changed 'required' to 'nullable' and 'min:1' to 'min:0' 
            // This allows the user to remove ALL addresses.
            'addresses'    => 'nullable|array|max:3',
            'addresses.*.street'       => 'required|string|regex:/^[a-zA-Z0-9\s\.\,\#\-]+$/|min:5',
            'addresses.*.house_number' => 'required|string|max:20',
            'addresses.*.barangay'     => 'required|string|max:100|regex:/^[a-zA-Z0-9\s\.\,\#\-]+$/|min:5',
            'addresses.*.city'         => 'required|string|max:100|regex:/^[a-zA-Z\s\.\,\-]+$/|min:3',
            'addresses.*.zip_code'     => 'required|numeric|digits:4',
        ];

        if ($request->email !== $user->email) {
            $rules['otp'] = 'required|numeric|digits:6';

            $otpRecord = Otp::where('user_id', $user->id)
                ->where('code', $request->otp)
                ->where('expires_at', '>', now())
                ->first();

            if (!$otpRecord) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => ['otp' => ['Invalid or expired OTP code.']]
                ], 422);
            }
            $otpRecord->delete();
        }

        $validatedData = $request->validate($rules);

        $user->update([
            'first_name'   => $validatedData['first_name'],
            'last_name'    => $validatedData['last_name'],
            'email'        => $validatedData['email'],
            'phone_number' => $validatedData['phone_number'],
        ]);

        // SYNC LOGIC
        // We delete all and only recreate what is currently in the validated array.
        // If the array is empty, the user effectively has 0 addresses now.
        $user->addresses()->delete();

        if (!empty($validatedData['addresses'])) {
            foreach ($validatedData['addresses'] as $addrData) {
                $user->addresses()->create($addrData);
            }
        }

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => $user->load('addresses')
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $user = Auth::user();
        $user->delete();
        return response()->json(['message' => 'Account deleted successfully.']);
    }
}