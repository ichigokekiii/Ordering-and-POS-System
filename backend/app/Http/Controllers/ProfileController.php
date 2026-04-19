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
use App\Support\ValidationRules;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    private function rehashPasswordIfNeeded(User $user, string $plainPassword): void
    {
        if (Hash::check($plainPassword, $user->password) && Hash::needsRehash($user->password)) {
            $user->forceFill([
                'password' => Hash::make($plainPassword),
            ])->save();
        }
    }

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

        $request->merge([
            'email' => ValidationRules::normalizeSingleLine((string) $request->input('email'), 255),
        ]);

        if ($request->email === $user->email) {
            return $this->fieldErrorResponse('email', 'New email must be different from current email');
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:users,email',
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

        $normalizedAddresses = collect($request->input('addresses', []))
            ->map(function ($address) {
                return [
                    'house_number' => ValidationRules::normalizeSingleLine($address['house_number'] ?? null, 20),
                    'street' => ValidationRules::normalizeSingleLine($address['street'] ?? null, 255),
                    'barangay' => ValidationRules::normalizeSingleLine($address['barangay'] ?? null, 255),
                    'city' => ValidationRules::normalizeSingleLine($address['city'] ?? null, 255),
                    'zip_code' => ValidationRules::normalizeSingleLine($address['zip_code'] ?? null, 10),
                ];
            })
            ->all();

        $normalizedInput = [];

        if ($request->has('first_name')) {
            $normalizedInput['first_name'] = ValidationRules::normalizeSingleLine((string) $request->input('first_name'), 50);
        }

        if ($request->has('last_name')) {
            $normalizedInput['last_name'] = ValidationRules::normalizeSingleLine((string) $request->input('last_name'), 50);
        }

        if ($request->has('phone_number')) {
            $normalizedInput['phone_number'] = ValidationRules::normalizePhone((string) $request->input('phone_number'));
        }

        if ($request->has('addresses')) {
            $normalizedInput['addresses'] = $normalizedAddresses;
        }

        if (!empty($normalizedInput)) {
            $request->merge($normalizedInput);
        }

        if ($request->has('email')) {
            return $this->fieldErrorResponse('email', 'Use email change flow with OTP to update email');
        }

        $validator = Validator::make($request->all(), [
            'first_name' => ['sometimes', 'string', 'min:2', 'max:50', 'regex:' . ValidationRules::NAME_REGEX],
            'last_name' => ['sometimes', 'string', 'min:2', 'max:50', 'regex:' . ValidationRules::NAME_REGEX],
            'phone_number' => ['nullable', 'string', 'regex:' . ValidationRules::PHONE_REGEX],

            'addresses' => 'sometimes|array|max:3',
            'addresses.*.house_number' => ['required','string','max:20','regex:' . ValidationRules::NON_NEGATIVE_INTEGER_REGEX],
            'addresses.*.street' => ['required','string','max:255','regex:' . ValidationRules::ADDRESS_TEXT_REGEX],
            'addresses.*.barangay' => ['required','string','max:255','regex:' . ValidationRules::ADDRESS_TEXT_REGEX],
            'addresses.*.city' => ['required','string','max:255','regex:' . ValidationRules::CITY_REGEX],
            'addresses.*.zip_code' => 'required|digits:4',
        ], [
            'first_name.regex' => 'First name can only contain letters, spaces, apostrophes, and hyphens.',
            'last_name.regex' => 'Last name can only contain letters, spaces, apostrophes, and hyphens.',
            'phone_number.regex' => 'Phone number must be exactly 11 digits.',
            'addresses.*.street.regex' => 'Street contains invalid characters.',
            'addresses.*.barangay.regex' => 'Barangay contains invalid characters.',
            'addresses.*.city.regex' => 'City can only contain letters, spaces, apostrophes, and hyphens.',
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

        $request->merge([
            'email' => ValidationRules::normalizeSingleLine((string) $request->input('email'), 255),
        ]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:users,email',
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

    $this->rehashPasswordIfNeeded($user, (string) $request->current_password);

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
            'new_password' => ValidationRules::passwordRules(true),
        ], [
            'new_password.regex' => 'New password must include at least one uppercase letter and one number.',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->fieldErrorResponse('current_password', 'Current password is incorrect');
        }

        $this->rehashPasswordIfNeeded($user, (string) $request->current_password);

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
