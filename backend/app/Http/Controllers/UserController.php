<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Otp;
use App\Mail\SendOtpMail;
use App\Support\LookupCatalog;
use App\Support\ValidationRules;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private function legacyUserStatusLabel(string $code): string
    {
        return $code === 'inactive' ? 'Inactive' : 'Active';
    }

    private function canViewUsers(): bool
    {
        return Auth::check()
            && in_array(Auth::user()->role, ['admin', 'owner', 'staff'], true);
    }

    private function normalizeUserInput(Request $request): void
    {
        $normalizedInput = [];

        if ($request->has('first_name')) {
            $normalizedInput['first_name'] = ValidationRules::normalizeSingleLine((string) $request->input('first_name'), 50);
        }

        if ($request->has('last_name')) {
            $normalizedInput['last_name'] = ValidationRules::normalizeSingleLine((string) $request->input('last_name'), 50);
        }

        if ($request->has('email')) {
            $normalizedInput['email'] = ValidationRules::normalizeSingleLine((string) $request->input('email'), 255);
        }

        if ($request->has('phone_number')) {
            $normalizedInput['phone_number'] = ValidationRules::normalizePhone((string) $request->input('phone_number'));
        }

        if ($request->has('role')) {
            $normalizedInput['role'] = LookupCatalog::normalizeRoleCode((string) $request->input('role'));
        }

        if ($request->has('status')) {
            $normalizedInput['status'] = LookupCatalog::normalizeUserStatusCode((string) $request->input('status'));
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
            'first_name'   => ['required', 'string', 'min:2', 'max:50', 'regex:' . ValidationRules::NAME_REGEX],
            'last_name'    => ['required', 'string', 'min:2', 'max:50', 'regex:' . ValidationRules::NAME_REGEX],
            'email'        => 'required|string|email|max:255|unique:users,email',
            'password'     => ValidationRules::passwordRules(),
            'phone_number' => ['required', 'string', 'regex:' . ValidationRules::PHONE_REGEX],
            'privacy_accepted' => 'accepted',
            'terms_accepted' => 'accepted',
            'terms_scope'    => 'required|string|in:customer',
        ], [
            'first_name.regex'   => 'First name can only contain letters and spaces.',
            'last_name.regex'    => 'Last name can only contain letters and spaces.',
            'password.required'  => 'Password is required.',
            'password.not_regex' => 'Password is required.',
            'password.regex' => 'Password must include at least one uppercase letter and one number.',
            'phone_number.regex' => 'Phone number must be exactly 11 digits.',
            'privacy_accepted.accepted' => 'Please review and acknowledge the Data Privacy Notice.',
            'terms_accepted.accepted' => 'Please review and accept the Customer Terms & Conditions.',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $user = new User();
        $user->first_name = $request->input('first_name');
        $user->last_name = $request->input('last_name');
        $user->email = $request->input('email');
        $user->password = Hash::make($request->input('password'));
        $user->role = LookupCatalog::CUSTOMER_ROLE_CODE;
        $user->role_id = LookupCatalog::roleIdFor(LookupCatalog::CUSTOMER_ROLE_CODE);
        $user->status = 'Active';
        $user->user_status_id = LookupCatalog::userStatusIdFor('active');
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

        $assignedRole = LookupCatalog::normalizeRoleCode($request->input('role', 'user'));
        $expectedTermsScope = in_array($assignedRole, ['admin', 'owner', 'staff'], true)
            ? 'internal'
            : 'customer';
        $requiresPrivacyNotice = $expectedTermsScope === 'customer';

        $validator = Validator::make($request->all(), [
            'first_name'   => ['required', 'string', 'min:2', 'max:50', 'regex:' . ValidationRules::NAME_REGEX],
            'last_name'    => ['required', 'string', 'min:2', 'max:50', 'regex:' . ValidationRules::NAME_REGEX],
            'email'        => 'required|string|email|max:255|unique:users,email',
            'password'     => ValidationRules::passwordRules(),
            'phone_number' => ['required', 'string', 'regex:' . ValidationRules::PHONE_REGEX],
            'role'         => 'nullable|string|in:user,staff,admin,owner',
            'status'       => 'nullable|string|in:active,inactive',
            'privacy_accepted' => $requiresPrivacyNotice ? 'accepted' : 'nullable',
            'terms_accepted' => 'accepted',
            'terms_scope'    => 'required|string|in:customer,internal',
        ], [
            'first_name.regex'   => 'First name can only contain letters and spaces.',
            'last_name.regex'    => 'Last name can only contain letters and spaces.',
            'password.required'  => 'Password is required.',
            'password.not_regex' => 'Password is required.',
            'password.regex' => 'Password must include at least one uppercase letter and one number.',
            'phone_number.regex' => 'Phone number must be exactly 11 digits.',
            'privacy_accepted.accepted' => 'Please review and acknowledge the Data Privacy Notice.',
            'terms_accepted.accepted' => 'Please review and accept the applicable Terms & Conditions.',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        if ($request->input('terms_scope') !== $expectedTermsScope) {
            return $this->fieldErrorResponse('terms_scope', 'The selected terms do not match the assigned role.');
        }

        $user = new User();
        $user->first_name = $request->input('first_name');
        $user->last_name = $request->input('last_name');
        $user->email = $request->input('email');
        $user->password = Hash::make($request->input('password'));
        $user->role = $assignedRole;
        $user->role_id = LookupCatalog::roleIdFor($assignedRole);
        $statusCode = LookupCatalog::normalizeUserStatusCode($request->input('status', 'active'));
        $user->status = $this->legacyUserStatusLabel($statusCode);
        $user->user_status_id = LookupCatalog::userStatusIdFor($statusCode);
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

        $actorRole = Auth::user()->role;

        if (!in_array($actorRole, ['admin', 'owner'], true)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($actorRole === 'owner') {
            $ownerAllowedKeys = ['isArchived'];
            $requestedKeys = array_keys($request->all());
            $hasOnlyOwnerArchiveFields = $request->has('isArchived')
                && empty(array_diff($requestedKeys, $ownerAllowedKeys));

            if (!$hasOnlyOwnerArchiveFields) {
                return response()->json(['error' => 'Owner can only archive or restore users'], 403);
            }
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $this->normalizeUserInput($request);

        // Validate incoming data safely
        $validator = Validator::make($request->all(), [
            'first_name'   => ['sometimes', 'string', 'min:2', 'max:50', 'regex:' . ValidationRules::NAME_REGEX],
            'last_name'    => ['sometimes', 'string', 'min:2', 'max:50', 'regex:' . ValidationRules::NAME_REGEX],
            'email'        => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password'     => ['sometimes', 'string', 'min:' . ValidationRules::PASSWORD_MIN_LENGTH, 'not_regex:/^\s*$/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
            'phone_number' => ['sometimes', 'string', 'regex:' . ValidationRules::PHONE_REGEX],
            'role'         => 'sometimes|string|in:user,staff,admin,owner',
            'status'       => 'sometimes|string|in:active,inactive',
            'priority'     => 'sometimes|integer|min:0|max:3',
            'is_locked'    => 'sometimes|boolean',
            'isArchived'   => 'sometimes|boolean',
        ], [
            'first_name.regex'   => 'First name can only contain letters and spaces.',
            'last_name.regex'    => 'Last name can only contain letters and spaces.',
            'phone_number.regex' => 'Phone number must be exactly 11 digits.',
            'password.regex' => 'Password must include at least one uppercase letter and one number.',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // Handle email change with OTP
        if ($request->filled('email')) {
            if ($request->input('email') !== $user->email) {
                // Email is being changed, require OTP
                if (!$request->filled('email_otp')) {
                    return $this->fieldErrorResponse('email_otp', 'OTP required for email change');
                }

                // Verify OTP
                $otp = Otp::where('user_id', $user->id)
                         ->where('code', $request->input('email_otp'))
                         ->where('expires_at', '>', Carbon::now())
                         ->first();

                if (!$otp) {
                    return $this->fieldErrorResponse('email_otp', 'Invalid or expired OTP');
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
                return $this->fieldErrorResponse('password_otp', 'OTP required for password change');
            }

            // Verify OTP
            $otp = Otp::where('user_id', $user->id)
                     ->where('code', $request->input('password_otp'))
                     ->where('expires_at', '>', Carbon::now())
                     ->first();

            if (!$otp) {
                return $this->fieldErrorResponse('password_otp', 'Invalid or expired OTP');
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
            if ($actorRole === 'owner') {
                return response()->json(['error' => 'Owner cannot change roles'], 403);
            }

            $normalizedRole = LookupCatalog::normalizeRoleCode($request->input('role'));
            $user->role = $normalizedRole;
            $user->role_id = LookupCatalog::roleIdFor($normalizedRole);
        }

        if ($request->filled('status')) {
            $statusCode = LookupCatalog::normalizeUserStatusCode($request->input('status'));
            $user->status = $this->legacyUserStatusLabel($statusCode);
            $user->user_status_id = LookupCatalog::userStatusIdFor($statusCode);
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
                $user->user_status_id = LookupCatalog::userStatusIdFor('active');
            } elseif ($isLocked === true) {
                $user->status = 'Inactive';
                $user->user_status_id = LookupCatalog::userStatusIdFor('inactive');
            }
        }

        if ($request->filled('priority')) {
            $user->priority = min(max((int) $request->input('priority'), 0), 3);
        }

        if ($request->has('isArchived')) {
            $user->isArchived = $request->boolean('isArchived');
        }

        $user->save();

        return response()->json($user);
    }

    // Permanently delete archived user
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

        if (!$user->isArchived) {
            return response()->json([
                'message' => 'Archive this user before deleting them.',
            ], 409);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
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

        $email = ValidationRules::normalizeSingleLine((string) $request->input('email'));
        if (empty($email)) {
            return $this->fieldErrorResponse('email', 'Email is required');
        }

        $emailValidator = Validator::make(['email' => $email], [
            'email' => 'required|email|max:255',
        ]);

        if ($emailValidator->fails()) {
            return $this->validationErrorResponse($emailValidator->errors());
        }

        if (User::where('email', $email)->where('id', '!=', $id)->exists()) {
            return $this->fieldErrorResponse('email', 'Email already exists');
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
