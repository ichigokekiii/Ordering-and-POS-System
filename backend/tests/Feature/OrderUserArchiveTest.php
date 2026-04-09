<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderUserArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_orders_and_users_default_to_not_archived(): void
    {
        $user = $this->createUserWithRole('user', 'archive-default-user@example.com');
        $order = $this->createOrderForUser($user);

        $this->assertFalse($user->fresh()->isArchived);
        $this->assertFalse($order->fresh()->isArchived);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'isArchived' => false]);
        $this->assertDatabaseHas('orders', ['order_id' => $order->order_id, 'isArchived' => false]);
    }

    public function test_admin_and_owner_can_archive_and_restore_orders(): void
    {
        $customer = $this->createUserWithRole('user', 'order-archive-customer@example.com');
        $order = $this->createOrderForUser($customer);

        Sanctum::actingAs($this->createUserWithRole('owner', 'order-archive-owner@example.com'));

        $this->putJson("/api/orders/{$order->order_id}", ['isArchived' => true])
            ->assertOk()
            ->assertJsonPath('isArchived', true)
            ->assertJsonPath('order_status', 'pending');

        Sanctum::actingAs($this->createUserWithRole('admin', 'order-archive-admin@example.com'));

        $this->putJson("/api/orders/{$order->order_id}", ['isArchived' => false])
            ->assertOk()
            ->assertJsonPath('isArchived', false);
    }

    public function test_staff_can_update_order_status_but_cannot_archive_orders(): void
    {
        $staff = $this->createUserWithRole('staff', 'staff-order-archive@example.com');
        $customer = $this->createUserWithRole('user', 'staff-order-archive-customer@example.com');
        $order = $this->createOrderForUser($customer);

        Sanctum::actingAs($staff);

        $this->putJson("/api/orders/{$order->order_id}", ['order_status' => 'processing'])
            ->assertOk()
            ->assertJsonPath('order_status', 'processing');

        $this->putJson("/api/orders/{$order->order_id}", ['isArchived' => true])
            ->assertForbidden();

        $this->assertDatabaseHas('orders', [
            'order_id' => $order->order_id,
            'order_status' => 'processing',
            'isArchived' => false,
        ]);
    }

    public function test_admin_can_only_delete_archived_orders(): void
    {
        $customer = $this->createUserWithRole('user', 'delete-order-customer@example.com');
        $order = $this->createOrderForUser($customer);

        Sanctum::actingAs($this->createUserWithRole('admin', 'delete-order-admin@example.com'));

        $this->deleteJson("/api/orders/{$order->order_id}")
            ->assertStatus(409);

        $order->update(['isArchived' => true]);

        $this->deleteJson("/api/orders/{$order->order_id}")
            ->assertOk();

        $this->assertDatabaseMissing('orders', ['order_id' => $order->order_id]);
    }

    public function test_owner_cannot_delete_archived_orders(): void
    {
        $customer = $this->createUserWithRole('user', 'owner-delete-order-customer@example.com');
        $order = $this->createOrderForUser($customer);
        $order->update(['isArchived' => true]);

        Sanctum::actingAs($this->createUserWithRole('owner', 'owner-delete-order-owner@example.com'));

        $this->deleteJson("/api/orders/{$order->order_id}")
            ->assertForbidden();

        $this->assertDatabaseHas('orders', ['order_id' => $order->order_id]);
    }

    public function test_admin_and_owner_can_archive_and_restore_users(): void
    {
        $target = $this->createUserWithRole('user', 'archive-user-target@example.com');

        Sanctum::actingAs($this->createUserWithRole('owner', 'archive-user-owner@example.com'));

        $this->putJson("/api/users/{$target->id}", ['isArchived' => true])
            ->assertOk()
            ->assertJsonPath('isArchived', true)
            ->assertJsonPath('status', 'Active');

        Sanctum::actingAs($this->createUserWithRole('admin', 'archive-user-admin@example.com'));

        $this->putJson("/api/users/{$target->id}", ['isArchived' => false])
            ->assertOk()
            ->assertJsonPath('isArchived', false);
    }

    public function test_owner_can_only_archive_or_restore_users(): void
    {
        $target = $this->createUserWithRole('user', 'owner-user-target@example.com');

        Sanctum::actingAs($this->createUserWithRole('owner', 'owner-user-owner@example.com'));

        $this->putJson("/api/users/{$target->id}", ['first_name' => 'Changed'])
            ->assertForbidden();

        $this->putJson("/api/users/{$target->id}", [
            'first_name' => 'Changed',
            'isArchived' => true,
        ])->assertForbidden();

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'first_name' => 'User',
            'isArchived' => false,
        ]);
    }

    public function test_admin_can_only_delete_archived_users(): void
    {
        $target = $this->createUserWithRole('user', 'delete-user-target@example.com');

        Sanctum::actingAs($this->createUserWithRole('admin', 'delete-user-admin@example.com'));

        $this->deleteJson("/api/users/{$target->id}")
            ->assertStatus(409);

        $target->update(['isArchived' => true]);

        $this->deleteJson("/api/users/{$target->id}")
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_owner_cannot_delete_archived_users(): void
    {
        $target = $this->createUserWithRole('user', 'owner-delete-user-target@example.com');
        $target->update(['isArchived' => true]);

        Sanctum::actingAs($this->createUserWithRole('owner', 'owner-delete-user-owner@example.com'));

        $this->deleteJson("/api/users/{$target->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    private function createUserWithRole(string $role, string $email): User
    {
        return User::create([
            'first_name' => ucfirst($role),
            'last_name' => 'Archive',
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

    private function createOrderForUser(User $user): Order
    {
        $order = new Order();
        $order->order_id = 'ORD-ARCH-' . strtoupper(substr(md5($user->email), 0, 8));
        $order->user_id = $user->id;
        $order->order_date = Carbon::now();
        $order->total_amount = 1250;
        $order->order_status = 'pending';
        $order->delivery_method = 'pickup';
        $order->address = 'Store pickup';
        $order->save();

        return $order;
    }
}
