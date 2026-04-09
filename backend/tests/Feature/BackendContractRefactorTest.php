<?php

namespace Tests\Feature;

use App\Models\Content;
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

    public function test_admin_product_creation_rejects_gif_images(): void
    {
        Storage::fake('public');

        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-product-gif@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post(
            '/api/products',
            [
                'name' => 'GIF Bouquet',
                'description' => 'GIF uploads should be rejected.',
                'category' => 'Bouquets',
                'type' => 'custom',
                'price' => '999.00',
                'isAvailable' => 1,
                'required_main_count' => 2,
                'required_filler_count' => 4,
                'image' => UploadedFile::fake()->image('bouquet.gif'),
            ],
            ['Accept' => 'application/json']
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_admin_premade_creation_rejects_gif_images(): void
    {
        Storage::fake('public');

        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-premade-gif@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post(
            '/api/premades',
            [
                'name' => 'GIF Premade',
                'description' => 'GIF uploads should be rejected.',
                'category' => 'Roses',
                'type' => 'Mixed',
                'price' => '899.00',
                'isAvailable' => 1,
                'image' => UploadedFile::fake()->image('premade.gif'),
            ],
            ['Accept' => 'application/json']
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
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

    public function test_admin_schedule_creation_requires_image(): void
    {
        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-schedule@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post('/api/schedules', [
            'schedule_name' => 'No Image Event',
            'location' => 'Main Branch',
            'schedule_description' => 'Image should be required for new schedules.',
            'event_date' => now()->addDays(7)->toDateString(),
            'isAvailable' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_admin_schedule_creation_rejects_gif_images(): void
    {
        Storage::fake('public');

        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-schedule-gif@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post('/api/schedules', [
            'schedule_name' => 'GIF Event',
            'location' => 'Main Branch',
            'schedule_description' => 'GIF uploads should be rejected.',
            'event_date' => now()->addDays(7)->toDateString(),
            'isAvailable' => 1,
            'image' => UploadedFile::fake()->image('schedule.gif'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_admin_schedule_update_allows_keeping_existing_image_without_uploading_new_one(): void
    {
        Storage::fake('public');

        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-schedule-update@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $schedule = Schedule::create([
            'schedule_name' => 'Existing Event',
            'location' => 'Main Branch',
            'schedule_description' => 'Existing schedule.',
            'event_date' => now()->addDays(8),
            'image' => '/storage/schedules/existing.jpg',
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $response = $this->put("/api/schedules/{$schedule->id}", [
            'schedule_name' => 'Existing Event Updated',
            'location' => 'Main Branch',
            'schedule_description' => 'Still keeping the current image.',
            'event_date' => now()->addDays(9)->toDateString(),
            'isAvailable' => 1,
        ]);

        $response->assertOk()
            ->assertJson([
                'schedule_name' => 'Existing Event Updated',
                'image' => '/storage/schedules/existing.jpg',
            ]);
    }

    public function test_admin_content_image_creation_requires_image_file(): void
    {
        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-content-required@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post(
            '/api/contents',
            [
                'page' => 'home',
                'identifier' => 'hero_image_test',
                'type' => 'image',
            ],
            ['Accept' => 'application/json']
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content_image']);
    }

    public function test_admin_content_image_creation_rejects_gif_images(): void
    {
        Storage::fake('public');

        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-content-gif@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->post(
            '/api/contents',
            [
                'page' => 'home',
                'identifier' => 'hero_image_gif_test',
                'type' => 'image',
                'content_image' => UploadedFile::fake()->image('content.gif'),
            ],
            ['Accept' => 'application/json']
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content_image']);
    }

    public function test_admin_content_image_update_allows_keeping_existing_image_without_uploading_new_one(): void
    {
        $admin = User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin-content-update@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        Sanctum::actingAs($admin);

        $content = Content::query()->create([
            'page' => 'home',
            'identifier' => 'hero_image_existing_test',
            'type' => 'image',
            'content_image' => '/storage/contents/existing.jpg',
            'isArchived' => false,
        ]);

        $response = $this->put("/api/contents/{$content->id}", [
            'identifier' => 'hero_image_existing_test_updated',
            'page' => 'home',
        ]);

        $response->assertOk()
            ->assertJsonPath('content.content_image', '/storage/contents/existing.jpg');
    }
}
