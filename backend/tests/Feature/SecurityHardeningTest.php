<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_requires_a_valid_otp(): void
    {
        $user = $this->createUser('secure-reset@example.com');

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'otp' => '123456',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertStatus(400);

        Otp::query()->create([
            'user_id' => $user->id,
            'code' => '654321',
            'expires_at' => now()->addMinutes(5),
        ]);

        $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'otp' => '654321',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
        $this->assertDatabaseMissing('otps', [
            'user_id' => $user->id,
            'code' => '654321',
        ]);
    }

    public function test_customer_cannot_view_another_customers_orders(): void
    {
        $owner = $this->createUser('owner-orders@example.com');
        $intruder = $this->createUser('intruder-orders@example.com');
        $order = $this->createOrderForUser($owner);

        Sanctum::actingAs($intruder);

        $this->getJson("/api/orders/user/{$owner->id}")
            ->assertForbidden();

        $this->getJson("/api/orders/{$order->order_id}")
            ->assertForbidden();
    }

    public function test_customer_cannot_access_staff_analytics_or_logs(): void
    {
        $customer = $this->createUser('customer-metrics@example.com');

        Sanctum::actingAs($customer);

        $this->getJson('/api/analytics')
            ->assertForbidden();

        $this->getJson('/api/logs')
            ->assertForbidden();
    }

    public function test_server_errors_do_not_expose_raw_exception_messages(): void
    {
        Schema::drop('contents');

        $response = $this->getJson('/api/contents');

        $response->assertStatus(500)
            ->assertJson([
                'message' => 'Failed to fetch content',
            ])
            ->assertJsonMissingPath('error');
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

    private function createOrderForUser(User $user): Order
    {
        $order = new Order();
        $order->order_id = 'ORD-SEC-' . strtoupper(substr(md5($user->email), 0, 6));
        $order->user_id = $user->id;
        $order->order_date = Carbon::now();
        $order->total_amount = 999;
        $order->order_status = 'pending';
        $order->delivery_method = 'pickup';
        $order->address = 'Store pickup';
        $order->save();

        return $order;
    }
}
