<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
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

    public function test_staff_can_update_order_status(): void
    {
        Mail::fake();

        $staff = $this->createUserWithRole('staff', 'staff-orders@example.com');
        $customer = $this->createUserWithRole('user', 'order-customer@example.com');
        $order = $this->createOrderForUser($customer, 'pending');

        Sanctum::actingAs($staff);

        $this->putJson("/api/orders/{$order->order_id}", [
            'order_status' => 'processing',
        ])
            ->assertOk()
            ->assertJsonPath('order_id', $order->order_id)
            ->assertJsonPath('order_status', 'processing');

        $this->assertDatabaseHas('orders', [
            'order_id' => $order->order_id,
            'order_status' => 'processing',
        ]);
    }

    public function test_customer_cannot_update_order_status(): void
    {
        $customer = $this->createUserWithRole('user', 'blocked-order-customer@example.com');
        $order = $this->createOrderForUser($customer, 'pending');

        Sanctum::actingAs($customer);

        $this->putJson("/api/orders/{$order->order_id}", [
            'order_status' => 'delivered',
        ])->assertForbidden();

        $this->assertDatabaseHas('orders', [
            'order_id' => $order->order_id,
            'order_status' => 'pending',
        ]);
    }

    public function test_staff_can_access_analytics_and_logs(): void
    {
        $staff = $this->createUserWithRole('staff', 'staff-analytics@example.com');

        Sanctum::actingAs($staff);

        $this->getJson('/api/analytics')
            ->assertOk();

        $this->getJson('/api/logs')
            ->assertOk();
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

    private function createOrderForUser(User $user, string $status): Order
    {
        $order = new Order();
        $order->order_id = 'ORD-STAFF-' . strtoupper(substr(md5($user->email), 0, 6));
        $order->user_id = $user->id;
        $order->order_date = Carbon::now();
        $order->total_amount = 1250;
        $order->order_status = $status;
        $order->delivery_method = 'pickup';
        $order->address = 'Store pickup';
        $order->save();

        return $order;
    }
}
