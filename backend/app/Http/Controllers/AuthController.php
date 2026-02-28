<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Otp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOtpMail;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid credentials.'
            ], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.'
            ], 401);
        }

        // BLOCK LOGIN IF NOT VERIFIED
        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Please verify your account first.'
            ], 403);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user
        ]);
    }
public function verifyOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'otp' => 'required'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $otp = Otp::where('user_id', $user->id)
              ->where('code', $request->otp)
              ->where('expires_at', '>', now())
              ->first();

    if (!$otp) {
        return response()->json(['message' => 'Invalid or expired OTP'], 400);
    }

    $user->is_verified = true;
    $user->save();

    $otp->delete();

    return response()->json([
        'message' => 'Account verified successfully',
        'user' => $user
    ]);
}

public function resendOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    if ($user->is_verified) {
        return response()->json(['message' => 'Account already verified'], 400);
    }

    // Delete old OTPs
    Otp::where('user_id', $user->id)->delete();

    $otpCode = rand(100000, 999999);

    Otp::create([
        'user_id' => $user->id,
        'code' => $otpCode,
        'expires_at' => now()->addMinutes(5),
    ]);

    Mail::to($user->email)->send(new SendOtpMail($otpCode));

    return response()->json(['message' => 'OTP resent successfully']);
}
}
