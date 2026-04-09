<?php

namespace Tests\Feature;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BackendContractRefactorTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_product_creation_syncs_hidden_catalog_record(): void
    {
        Storage::fake('public');

        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post('/api/products', [
            'name' => 'Sunrise Bouquet',
            'description' => 'Front contract should stay the same.',
            'category' => 'Bouquets',
            'type' => 'custom',
            'price' => '999.00',
            'isAvailable' => 1,
            'required_main_count' => 2,
            'required_filler_count' => 4,
            'image' => UploadedFile::fake()->image('bouquet.jpg'),
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'id',
                'name',
                'description',
                'category',
                'type',
                'price',
                'image',
                'isAvailable',
                'isArchived',
                'required_main_count',
                'required_filler_count',
            ]);

        $response->assertJson([
            'isArchived' => false,
        ]);

        $this->assertDatabaseHas('custom_products', [
            'name' => 'Sunrise Bouquet',
            'required_main_count' => 2,
            'required_filler_count' => 4,
        ]);

        $this->assertDatabaseHas('products', [
            'product_source' => 'custom',
            'name' => 'Sunrise Bouquet',
            'category' => 'Bouquets',
        ]);
    }

    public function test_non_bouquet_custom_product_can_be_created_without_builder_counts(): void
    {
        Storage::fake('public');

        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin2@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post('/api/products', [
            'name' => 'Baby Breath',
            'description' => 'Additional flower item.',
            'category' => 'Additional',
            'type' => 'Fillers',
            'price' => '150.00',
            'isAvailable' => 1,
            'image' => UploadedFile::fake()->image('filler.jpg'),
        ]);

        $response->assertCreated();

        $response->assertJson([
            'isArchived' => false,
        ]);

        $this->assertDatabaseHas('custom_products', [
            'name' => 'Baby Breath',
            'required_main_count' => null,
            'required_filler_count' => null,
        ]);
    }

    public function test_schedule_booking_duplicate_is_blocked_without_changing_api(): void
    {
        Mail::fake();

        $schedule = Schedule::create([
            'schedule_name' => 'Mother\'s Day Event',
            'location' => 'Main Branch',
            'event_date' => now()->addDays(3),
            'isAvailable' => true,
        ]);

        $firstResponse = $this->postJson("/api/schedules/{$schedule->id}/book", [
            'email' => 'customer@example.com',
        ]);

        $firstResponse->assertOk()
            ->assertJson([
                'message' => 'Booking successful. Check your email.',
            ]);

        $secondResponse = $this->postJson("/api/schedules/{$schedule->id}/book", [
            'email' => 'customer@example.com',
        ]);

        $secondResponse->assertStatus(400)
            ->assertJson([
                'message' => 'You have already booked this event.',
            ]);

        $this->assertDatabaseCount('schedule_bookings', 1);
    }
}
