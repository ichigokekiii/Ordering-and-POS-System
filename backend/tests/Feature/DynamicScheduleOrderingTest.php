<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DynamicScheduleOrderingTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_creation_requires_an_active_future_schedule_and_links_the_order(): void
    {
        Storage::fake('public');

        $user = User::query()->create([
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'user',
            'is_verified' => true,
        ]);

        $schedule = Schedule::query()->create([
            'schedule_name' => 'Mother\'s Day Pop-up',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(12),
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $response = $this->post('/api/orders', [
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'address' => 'Pickup',
            'delivery_method' => 'pickup',
            'payment_method' => 'GCash',
            'reference_number' => 'REF12345',
            'reference_image' => UploadedFile::fake()->image('proof.jpg'),
            'total_amount' => 1200,
            'special_message' => '',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('orders', [
            'schedule_id' => $schedule->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_order_creation_rejects_inactive_schedule(): void
    {
        Storage::fake('public');

        $user = User::query()->create([
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'email' => 'inactive@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'user',
            'is_verified' => true,
        ]);

        $schedule = Schedule::query()->create([
            'schedule_name' => 'Coming Soon Event',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(20),
            'isAvailable' => false,
            'isArchived' => false,
        ]);

        $response = $this->post('/api/orders', [
            'user_id' => $user->id,
            'schedule_id' => $schedule->id,
            'address' => 'Pickup',
            'delivery_method' => 'pickup',
            'payment_method' => 'GCash',
            'reference_number' => 'REF12345',
            'reference_image' => UploadedFile::fake()->image('proof.jpg'),
            'total_amount' => 1200,
            'special_message' => '',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'The selected event is not available for ordering.',
            ]);
    }

    public function test_inactive_future_schedules_can_still_be_booked(): void
    {
        Mail::fake();

        $schedule = Schedule::query()->create([
            'schedule_name' => 'Coming Soon Event',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(14),
            'isAvailable' => false,
            'isArchived' => false,
        ]);

        $response = $this->postJson("/api/schedules/{$schedule->id}/book", [
            'email' => 'customer@example.com',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Booking successful. Check your email.',
            ]);
    }

    public function test_cancellation_uses_linked_schedule_and_escalates_after_two_consecutive_cancellations(): void
    {
        Mail::fake();

        $user = User::query()->create([
            'first_name' => 'Repeat',
            'last_name' => 'Canceller',
            'email' => 'cancel@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'user',
            'is_verified' => true,
        ]);

        $blockingSchedule = Schedule::query()->create([
            'schedule_name' => 'Too Soon Event',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(2),
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $linkedSchedule = Schedule::query()->create([
            'schedule_name' => 'Linked Event',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(10),
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $firstOrder = new Order();
        $firstOrder->order_id = 'ORD-CANCEL-1';
        $firstOrder->user_id = $user->id;
        $firstOrder->schedule_id = $linkedSchedule->id;
        $firstOrder->order_date = now()->toDateTimeString();
        $firstOrder->total_amount = 1000;
        $firstOrder->order_status = 'pending';
        $firstOrder->delivery_method = 'pickup';
        $firstOrder->address = 'Pickup';
        $firstOrder->save();

        $secondOrder = new Order();
        $secondOrder->order_id = 'ORD-CANCEL-2';
        $secondOrder->user_id = $user->id;
        $secondOrder->schedule_id = $linkedSchedule->id;
        $secondOrder->order_date = now()->toDateTimeString();
        $secondOrder->total_amount = 1000;
        $secondOrder->order_status = 'pending';
        $secondOrder->delivery_method = 'pickup';
        $secondOrder->address = 'Pickup';
        $secondOrder->save();

        Sanctum::actingAs($user);

        $firstResponse = $this->postJson('/api/orders/ORD-CANCEL-1/cancel');
        $firstResponse->assertOk()
            ->assertJson([
                'account_disabled' => false,
                'priority' => 0,
                'consecutive_cancellations' => 1,
            ]);

        $secondResponse = $this->postJson('/api/orders/ORD-CANCEL-2/cancel');
        $secondResponse->assertOk()
            ->assertJson([
                'account_disabled' => false,
                'priority' => 1,
                'consecutive_cancellations' => 0,
            ]);

        $this->assertDatabaseHas('orders', [
            'order_id' => 'ORD-CANCEL-1',
            'schedule_id' => $linkedSchedule->id,
            'order_status' => 'Cancelled',
        ]);

        $this->assertDatabaseHas('orders', [
            'order_id' => 'ORD-CANCEL-2',
            'schedule_id' => $linkedSchedule->id,
            'order_status' => 'Cancelled',
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'priority' => 1,
            'consecutive_cancellations' => 0,
        ]);
    }

    public function test_priority_three_lock_returns_fraud_login_message(): void
    {
        Mail::fake();

        $user = User::query()->create([
            'first_name' => 'Flagged',
            'last_name' => 'Buyer',
            'email' => 'flagged@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'user',
            'priority' => 2,
            'consecutive_cancellations' => 1,
            'is_verified' => true,
        ]);

        $schedule = Schedule::query()->create([
            'schedule_name' => 'Fraud Lock Event',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(10),
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $order = new Order();
        $order->order_id = 'ORD-CANCEL-LOCK';
        $order->user_id = $user->id;
        $order->schedule_id = $schedule->id;
        $order->order_date = now()->toDateTimeString();
        $order->total_amount = 1000;
        $order->order_status = 'pending';
        $order->delivery_method = 'pickup';
        $order->address = 'Pickup';
        $order->save();

        Sanctum::actingAs($user);

        $cancelResponse = $this->postJson('/api/orders/ORD-CANCEL-LOCK/cancel');
        $cancelResponse->assertOk()
            ->assertJson([
                'account_disabled' => true,
                'priority' => 3,
            ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'secret123',
        ]);

        $loginResponse->assertStatus(423)
            ->assertJson([
                'message' => 'Your account has been locked and flagged for fraudulent buying behavior. Please contact IT support to restore access.',
                'locked' => true,
            ]);
    }

    public function test_invalid_legacy_priority_does_not_immediately_lock_on_first_cancellation(): void
    {
        Mail::fake();

        $user = User::query()->create([
            'first_name' => 'Legacy',
            'last_name' => 'Priority',
            'email' => 'legacy-priority@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'user',
            'priority' => 10,
            'consecutive_cancellations' => 99,
            'is_verified' => true,
        ]);

        $schedule = Schedule::query()->create([
            'schedule_name' => 'Reset Priority Event',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(10),
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $order = new Order();
        $order->order_id = 'ORD-CANCEL-LEGACY';
        $order->user_id = $user->id;
        $order->schedule_id = $schedule->id;
        $order->order_date = now()->toDateTimeString();
        $order->total_amount = 1000;
        $order->order_status = 'pending';
        $order->delivery_method = 'pickup';
        $order->address = 'Pickup';
        $order->save();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/orders/ORD-CANCEL-LEGACY/cancel');
        $response->assertOk()
            ->assertJson([
                'account_disabled' => false,
                'priority' => 0,
                'consecutive_cancellations' => 1,
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'priority' => 0,
            'consecutive_cancellations' => 1,
            'is_locked' => false,
        ]);
    }
}
