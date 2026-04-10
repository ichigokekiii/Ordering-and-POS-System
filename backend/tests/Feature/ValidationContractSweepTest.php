<?php

namespace Tests\Feature;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ValidationContractSweepTest extends TestCase
{
    use RefreshDatabase;

    public function test_schedule_booking_requires_a_valid_email_with_validation_errors(): void
    {
        $schedule = Schedule::query()->create([
            'schedule_name' => 'Weekend Pop-up',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(7),
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $response = $this->postJson("/api/schedules/{$schedule->id}/book", [
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The given data was invalid.',
            ])
            ->assertJsonValidationErrors(['email']);
    }

    public function test_feedback_rejects_blank_or_too_long_messages(): void
    {
        $user = $this->createUser('feedback-sweep@example.com');

        Sanctum::actingAs($user);

        $blankResponse = $this->postJson('/api/feedbacks', [
            'feedback_rating' => 5,
            'feedback_text' => '   ',
        ]);

        $blankResponse->assertStatus(422)
            ->assertJsonPath('errors.feedback_text.0', 'Feedback is required.');

        $tooLongResponse = $this->postJson('/api/feedbacks', [
            'feedback_rating' => 5,
            'feedback_text' => str_repeat('A', 501),
        ]);

        $tooLongResponse->assertStatus(422)
            ->assertJsonPath('errors.feedback_text.0', 'Feedback must not exceed 500 characters.');
    }

    public function test_profile_email_verification_maps_invalid_otp_to_the_otp_field(): void
    {
        $user = $this->createUser('profile-sweep@example.com');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/profile/email-verify', [
            'email' => 'updated-profile@example.com',
            'otp' => '123456',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Invalid or expired OTP',
            ])
            ->assertJsonPath('errors.otp.0', 'Invalid or expired OTP');
    }

    public function test_profile_photo_rejects_invalid_uploads_with_validation_shape(): void
    {
        Storage::fake('public');

        $user = $this->createUser('photo-sweep@example.com');

        Sanctum::actingAs($user);

        $response = $this->post('/api/profile/photo', [
            'profile_picture' => UploadedFile::fake()->create('profile.pdf', 50, 'application/pdf'),
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The given data was invalid.',
            ])
            ->assertJsonValidationErrors(['profile_picture']);
    }

    public function test_order_creation_returns_field_errors_for_invalid_checkout_inputs(): void
    {
        Storage::fake('public');

        $user = $this->createUser('checkout-sweep@example.com');
        $schedule = Schedule::query()->create([
            'schedule_name' => 'Holiday Pop-up',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(9),
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/orders', [
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'address' => 'short',
            'delivery_method' => 'delivery',
            'payment_method' => str_repeat('G', 51),
            'reference_number' => 'BAD#',
            'total_amount' => 1200,
            'special_message' => str_repeat('B', 151),
            'terms_accepted' => true,
            'terms_scope' => 'customer',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The given data was invalid.',
            ])
            ->assertJsonValidationErrors([
                'address',
                'payment_method',
                'reference_number',
                'reference_image',
                'special_message',
            ]);
    }

    private function createUser(string $email): User
    {
        return User::query()->create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => $email,
            'password' => Hash::make('secret123'),
            'role' => 'user',
            'status' => 'Active',
            'phone_number' => '09123456789',
            'failed_attempt_count' => 0,
            'is_locked' => false,
            'priority' => 0,
            'is_verified' => true,
            'consecutive_cancellations' => 0,
        ]);
    }
}
