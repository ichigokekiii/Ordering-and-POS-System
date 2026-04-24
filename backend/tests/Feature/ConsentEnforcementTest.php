<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConsentEnforcementTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_requires_privacy_acceptance_and_succeeds_with_all_required_consents(): void
    {
        Mail::fake();

        $missingPrivacyResponse = $this->postJson('/api/register', [
            'first_name' => 'Privacy',
            'last_name' => 'Customer',
            'email' => 'privacy-register@example.com',
            'password' => 'Secure123',
            'phone_number' => '09123456789',
            'terms_accepted' => true,
            'terms_scope' => 'customer',
        ]);

        $missingPrivacyResponse->assertStatus(422)
            ->assertJsonPath('errors.privacy_accepted.0', 'Please review and acknowledge the Data Privacy Notice.');

        $successResponse = $this->postJson('/api/register', [
            'first_name' => 'Privacy',
            'last_name' => 'Customer',
            'email' => 'privacy-register-success@example.com',
            'password' => 'Secure123',
            'phone_number' => '09123456789',
            'privacy_accepted' => true,
            'terms_accepted' => true,
            'terms_scope' => 'customer',
        ]);

        $successResponse->assertStatus(201)
            ->assertJsonPath('email', 'privacy-register-success@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'privacy-register-success@example.com',
            'role' => 'user',
        ]);
    }

    public function test_admin_customer_creation_requires_privacy_acceptance(): void
    {
        Sanctum::actingAs($this->createAdmin('consent-admin@example.com'));

        $response = $this->postJson('/api/users', [
            'first_name' => 'Customer',
            'last_name' => 'Account',
            'email' => 'customer-no-privacy@example.com',
            'password' => 'Secure123',
            'phone_number' => '09123456789',
            'role' => 'user',
            'status' => 'active',
            'terms_accepted' => true,
            'terms_scope' => 'customer',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.privacy_accepted.0', 'Please review and acknowledge the Data Privacy Notice.');
    }

    public function test_admin_internal_user_creation_does_not_require_privacy_acceptance(): void
    {
        Sanctum::actingAs($this->createAdmin('consent-admin-internal@example.com'));

        $response = $this->postJson('/api/users', [
            'first_name' => 'Staff',
            'last_name' => 'Account',
            'email' => 'staff-no-privacy@example.com',
            'password' => 'Secure123',
            'phone_number' => '09123456789',
            'role' => 'staff',
            'status' => 'active',
            'terms_accepted' => true,
            'terms_scope' => 'internal',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'staff');
    }

    public function test_admin_customer_creation_requires_matching_terms_scope(): void
    {
        Sanctum::actingAs($this->createAdmin('consent-admin-scope@example.com'));

        $mismatchResponse = $this->postJson('/api/users', [
            'first_name' => 'Scoped',
            'last_name' => 'Customer',
            'email' => 'customer-mismatch-scope@example.com',
            'password' => 'Secure123',
            'phone_number' => '09123456789',
            'role' => 'user',
            'status' => 'active',
            'privacy_accepted' => true,
            'terms_accepted' => true,
            'terms_scope' => 'internal',
        ]);

        $mismatchResponse->assertStatus(422)
            ->assertJsonPath('errors.terms_scope.0', 'The selected terms do not match the assigned role.');

        $successResponse = $this->postJson('/api/users', [
            'first_name' => 'Scoped',
            'last_name' => 'Customer',
            'email' => 'customer-matching-scope@example.com',
            'password' => 'Secure123',
            'phone_number' => '09123456789',
            'role' => 'user',
            'status' => 'active',
            'privacy_accepted' => true,
            'terms_accepted' => true,
            'terms_scope' => 'customer',
        ]);

        $successResponse->assertStatus(201)
            ->assertJsonPath('user.email', 'customer-matching-scope@example.com');
    }

    private function createAdmin(string $email): User
    {
        return User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => $email,
            'password' => Hash::make('Secure123'),
            'role' => 'admin',
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
