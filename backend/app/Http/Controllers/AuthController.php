<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Otp;
use App\Models\Log;
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
            $this->writeLog('login_failed', 'users', null, 'Failed login attempt for unknown email', [
                'user_name' => $request->email,
            ]);

            return response()->json([
                'message' => 'Invalid credentials.'
            ], 401);
        }

        // ── PERMANENT LOCK CHECK ──────────────────────────────────────────────
        if ($user->is_locked) {
            $this->writeUserLog('login_blocked', $user, 'Login blocked because the account is locked');

            return response()->json([
                'message' => 'Your account has been locked due to too many failed login attempts. Please contact an administrator to unlock it.',
                'locked' => true,
            ], 423);
        }

        // ── TEMPORARY COOLDOWN CHECK ──────────────────────────────────────────
        // A cooldown is active after the 3rd fail (2 min) and 6th fail (5 min)
        $count = $user->failed_attempt_count ?? 0;

        if ($count > 0 && $user->last_failed_attempt_at) {
            $cooldownMinutes = null;

            if ($count === 3) {
                $cooldownMinutes = 2;
            } elseif ($count === 6) {
                $cooldownMinutes = 5;
            }

            if ($cooldownMinutes !== null) {
                $unlockAt = $user->last_failed_attempt_at->addMinutes($cooldownMinutes);
                if (now()->lt($unlockAt)) {
                    $remainingSeconds = (int) now()->diffInSeconds($unlockAt);

                    $this->writeUserLog('login_cooldown', $user, 'Login blocked by cooldown after repeated failed attempts');

                    return response()->json([
                        'message' => 'Too many failed attempts. Please wait before trying again.',
                        'cooldown' => true,
                        'remaining_seconds' => $remainingSeconds,
                    ], 429);
                }
            }
        }

        // ── PASSWORD CHECK ────────────────────────────────────────────────────
        if (!Hash::check($request->password, $user->password)) {
            $newCount = $count + 1;
            $user->failed_attempt_count = $newCount;
            $user->last_failed_attempt_at = now();

            // Permanent lock after 9th failure (3 cooldown rounds of 3)
            if ($newCount >= 9) {
                $user->is_locked = true;
                $user->save();

                $this->writeUserLog('login_failed', $user, 'Failed login attempt triggered a permanent account lock');

                return response()->json([
                    'message' => 'Your account has been permanently locked due to too many failed login attempts. Please contact an administrator.',
                    'locked' => true,
                ], 423);
            }

            $user->save();

            $this->writeUserLog('login_failed', $user, 'Failed login attempt');

            // Trigger a cooldown after the 3rd and 6th failure
            if ($newCount === 3) {
                return response()->json([
                    'message' => 'Too many failed attempts.',
                    'cooldown' => true,
                    'remaining_seconds' => 120,
                ], 429);
            }

            if ($newCount === 6) {
                return response()->json([
                    'message' => 'Too many failed attempts.',
                    'cooldown' => true,
                    'remaining_seconds' => 300,
                ], 429);
            }

            // Show attempts-remaining warning
            $attemptsLeft = ($newCount < 3) ? (3 - $newCount) : (6 - $newCount);
            return response()->json([
                'message' => 'Invalid credentials.',
                'attempts_left' => $attemptsLeft,
            ], 401);
        }

        // ── BLOCK LOGIN IF NOT VERIFIED ───────────────────────────────────────
        if (!$user->is_verified) {
            $this->writeUserLog('login_blocked', $user, 'Login blocked because the account is not verified');

            return response()->json([
                'message' => 'Please verify your account first.'
            ], 403);
        }

        // ── SUCCESS: reset lockout counters ───────────────────────────────────
        $user->failed_attempt_count = 0;
        $user->last_failed_attempt_at = null;
        $user->save();

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->writeUserLog('login_success', $user, 'Successful login');

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
            ],
            'token' => $token
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

        // Auto-login after verification
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->writeUserLog('account_verified', $user, 'Account verified successfully');

        return response()->json([
            'message' => 'Account verified successfully',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
            ],
            'token' => $token
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

        Otp::where('user_id', $user->id)->delete();

        $otpCode = rand(100000, 999999);

        Otp::create([
            'user_id' => $user->id,
            'code' => $otpCode,
            'expires_at' => now()->addMinutes(5),
        ]);

        Mail::to($user->email)->send(new SendOtpMail($otpCode));

        $this->writeUserLog('otp_resent', $user, 'OTP resent for account verification');

        return response()->json(['message' => 'OTP resent successfully']);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        // Delete all Sanctum tokens so the user is fully logged out
        $user->tokens()->delete();

        $this->writeUserLog('logout', $user, 'Logout completed');

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email not found'
            ], 404);
        }

        $this->sendOtp($user);

        $this->writeUserLog('password_reset_requested', $user, 'Password reset requested');

        return response()->json([
            'message' => 'OTP sent successfully'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        $this->writeUserLog('password_reset_completed', $user, 'Password reset completed');

        return response()->json([
            'message' => 'Password reset successful'
        ]);
    }

    private function sendOtp($user)
    {
        Otp::where('user_id', $user->id)->delete();

        $otpCode = rand(100000, 999999);

        Otp::create([
            'user_id' => $user->id,
            'code' => $otpCode,
            'expires_at' => now()->addMinutes(5),
        ]);

        Mail::to($user->email)->send(new SendOtpMail($otpCode));
    }

    private function writeUserLog(string $actionType, User $user, string $description): void
    {
        $this->writeLog($this->formatAuthEvent($actionType), 'Users', [
            'user_id' => $user->id,
            'user_name' => trim($user->first_name . ' ' . $user->last_name) ?: $user->email,
            'user_role' => $user->role,
        ]);
    }

    private function writeLog(string $event, string $module, array $extra = []): void
    {
        $request = request();

        Log::create([
            'user_id' => $extra['user_id'] ?? null,
            'user_name' => $extra['user_name'] ?? null,
            'user_role' => $extra['user_role'] ?? null,
            'event' => $event,
            'module' => $module,
            'source' => $extra['source'] ?? $this->detectSource($request),
        ]);
    }

    private function formatAuthEvent(string $actionType): string
    {
        return match ($actionType) {
            'login_failed' => 'Failed login attempt',
            'login_blocked' => 'Login blocked',
            'login_cooldown' => 'Login cooldown triggered',
            'login_success' => 'Successful login',
            'logout' => 'Logout',
            'account_verified' => 'Account verified',
            'otp_resent' => 'OTP resent',
            'password_reset_requested' => 'Password reset requested',
            'password_reset_completed' => 'Password reset completed',
            default => ucwords(str_replace('_', ' ', $actionType)),
        };
    }

    private function detectSource(?Request $request): string
    {
        $userAgent = $request?->userAgent();

        if (!$userAgent) {
            return 'Backend API';
        }

        $browser = 'Browser';
        $os = 'Unknown OS';

        if (str_contains($userAgent, 'Edg/')) {
            $browser = 'Edge';
        } elseif (str_contains($userAgent, 'OPR/') || str_contains($userAgent, 'Opera')) {
            $browser = 'Opera';
        } elseif (str_contains($userAgent, 'Chrome/') && !str_contains($userAgent, 'Edg/')) {
            $browser = 'Chrome';
        } elseif (str_contains($userAgent, 'Firefox/')) {
            $browser = 'Firefox';
        } elseif (str_contains($userAgent, 'Safari/') && !str_contains($userAgent, 'Chrome/')) {
            $browser = 'Safari';
        }

        if (str_contains($userAgent, 'Windows')) {
            $os = 'Windows';
        } elseif (str_contains($userAgent, 'Mac OS X') || str_contains($userAgent, 'Macintosh')) {
            $os = 'macOS';
        } elseif (str_contains($userAgent, 'Android')) {
            $os = 'Android';
        } elseif (str_contains($userAgent, 'iPhone') || str_contains($userAgent, 'iPad')) {
            $os = 'iOS';
        } elseif (str_contains($userAgent, 'Linux')) {
            $os = 'Linux';
        }

        return $browser . ' (' . $os . ')';
    }
}
