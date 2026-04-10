<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Otp;
use App\Mail\SendOtpMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'profile_picture' => $user->profile_picture,
            'role' => $user->role,
        ];
    }

    private function deleteProfilePicture(?string $profilePicture): void
    {
        if (!$profilePicture) {
            return;
        }

        Storage::disk('public')->delete(str_replace('/storage/', '', $profilePicture));
    }

    /**
     * Get authenticated user's profile with addresses
     */
    public function profile()
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        $user->load([
            'addresses',
            'orders' => function ($query) {
                $query->with('schedule')->orderBy('created_at', 'desc');
            }
        ]);

        $orders = $user->orders->map(function ($order) {
            $orderArray = $order->toArray();
            $orderArray['event_date'] = $order->schedule?->event_date;
            $orderArray['schedule_name'] = $order->schedule?->schedule_name;
            $orderArray['schedule'] = $order->schedule;

            return $orderArray;
        });

        return response()->json([
            ...$this->formatUser($user),
            'addresses' => $user->addresses,
            'orders' => $orders,
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
            return $this->fieldErrorResponse('email', 'New email must be different from current email');
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

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
            return $this->fieldErrorResponse('email', 'Use email change flow with OTP to update email');
        }

        $validator = Validator::make($request->all(), [
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

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $validated = $validator->validated();

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
                ...$this->formatUser($user),
                'addresses' => $user->load('addresses')->addresses
            ]
        ]);
    }

    public function updatePhoto(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'profile_picture' => 'required|image|mimes:jpg,jpeg,png,gif|max:5120',
        ], [
            'profile_picture.required' => 'Please select an image to upload.',
            'profile_picture.image' => 'The selected file must be an image.',
            'profile_picture.mimes' => 'Only JPG, JPEG, PNG, and GIF files are allowed.',
            'profile_picture.max' => 'Image must be 5MB or smaller.',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $this->deleteProfilePicture($user->profile_picture);

        $path = $request->file('profile_picture')->store('profile-pictures', 'public');

        $user->profile_picture = Storage::url($path);
        $user->save();

        return response()->json([
            'message' => 'Profile photo updated successfully',
            'user' => [
                ...$this->formatUser($user),
                'addresses' => $user->load('addresses')->addresses,
            ],
        ]);
    }

    /**
     * Verify OTP and change email
     */
    public function verifyEmailChangeOtp(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'otp' => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        if ($request->email === $user->email) {
            return $this->fieldErrorResponse('email', 'New email must be different from current email');
        }

        $otp = Otp::where('user_id', $user->id)
            ->where('code', $request->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            return $this->fieldErrorResponse('otp', 'Invalid or expired OTP');
        }

        $user->email = $request->email;
        $user->save();

        $otp->delete();

        return response()->json(['message' => 'Email updated successfully', 'email' => $user->email]);
    }

    /**
     * Request OTP for password change
     */
/**
 * Request OTP for password change
 */
public function requestPasswordChangeOtp(Request $request)
{
    /** @var User $user */
    $user = Auth::user();

    // ADD VALIDATION FOR CURRENT PASSWORD
    $validator = Validator::make($request->all(), [
        'current_password' => 'required|string',
    ], [
        'current_password.required' => 'Current password is required.',
    ]);

    if ($validator->fails()) {
        return $this->validationErrorResponse($validator->errors());
    }

    // VERIFY CURRENT PASSWORD BEFORE SENDING OTP
    if (!Hash::check($request->current_password, $user->password)) {
        return $this->fieldErrorResponse('current_password', 'Current password is incorrect');
    }

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

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'otp' => 'required|digits:6',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->fieldErrorResponse('current_password', 'Current password is incorrect');
        }

        if (Hash::check($request->new_password, $user->password)) {
            return $this->fieldErrorResponse('new_password', 'New password must be different from current password');
        }

        $otp = Otp::where('user_id', $user->id)
            ->where('code', $request->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            return $this->fieldErrorResponse('otp', 'Invalid or expired OTP');
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

        $this->deleteProfilePicture($user->profile_picture);
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }
}
