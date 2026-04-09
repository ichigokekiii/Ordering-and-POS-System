<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffUserReadOnlyAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_list_and_view_users(): void
    {
        $staff = $this->createUserWithRole('staff', 'staff-reader@example.com');
        $target = $this->createUserWithRole('user', 'customer@example.com');

        Sanctum::actingAs($staff);

        $this->getJson('/api/users')
            ->assertOk()
            ->assertJsonFragment([
                'id' => $target->id,
                'email' => $target->email,
            ]);

        $this->getJson("/api/users/{$target->id}")
            ->assertOk()
            ->assertJsonFragment([
                'id' => $target->id,
                'email' => $target->email,
            ]);
    }

    public function test_staff_cannot_update_users(): void
    {
        $staff = $this->createUserWithRole('staff', 'staff-editor@example.com');
        $target = $this->createUserWithRole('user', 'target-user@example.com');

        Sanctum::actingAs($staff);

        $this->putJson("/api/users/{$target->id}", [
            'first_name' => 'Changed',
        ])->assertForbidden();

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'first_name' => 'Target',
        ]);
    }

    private function createUserWithRole(string $role, string $email): User
    {
        return User::create([
            'first_name' => $role === 'user' ? 'Target' : ucfirst($role),
            'last_name' => 'Tester',
            'email' => $email,
            'password' => Hash::make('password123'),
            'role' => $role,
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
