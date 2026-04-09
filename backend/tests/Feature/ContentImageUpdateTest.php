<?php

namespace Tests\Feature;

use App\Models\Content;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContentImageUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_image_content_can_be_created(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->createAdminUser('content-creator@example.com'));

        $response = $this
            ->withHeader('Accept', 'application/json')
            ->post('/api/contents', [
                'identifier' => 'about_hero_image_1',
                'page' => 'about',
                'type' => 'image',
                'content_image' => UploadedFile::fake()->image('banner.png', 1200, 800),
            ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Content created successfully');

        $createdImagePath = $response->json('content.content_image');

        $this->assertNotNull($createdImagePath);
        $this->assertStringStartsWith('/storage/contents/', $createdImagePath);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $createdImagePath));
    }

    public function test_existing_content_image_can_be_replaced_even_if_audit_logging_fails(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->createAdminUser('content-admin@example.com'));

        Storage::disk('public')->put('contents/old-banner.jpg', 'old-image');

        $content = Content::query()->create([
            'identifier' => 'home_hero_image_1',
            'page' => 'home',
            'type' => 'image',
            'content_image' => '/storage/contents/old-banner.jpg',
            'isArchived' => false,
        ]);

        Schema::drop('logs');

        $response = $this
            ->withHeader('Accept', 'application/json')
            ->post("/api/contents/{$content->id}?_method=PUT", [
                'content_image' => UploadedFile::fake()->image('replacement.png'),
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Content updated successfully');

        $content->refresh();

        $this->assertNotSame('/storage/contents/old-banner.jpg', $content->content_image);
        $this->assertStringStartsWith('/storage/contents/', $content->content_image);
        Storage::disk('public')->assertMissing('contents/old-banner.jpg');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $content->content_image));
    }

    public function test_invalid_image_upload_returns_validation_errors_instead_of_a_server_error(): void
    {
        Sanctum::actingAs($this->createAdminUser('content-validator@example.com'));

        $content = Content::query()->create([
            'identifier' => 'auth_login_image',
            'page' => 'auth',
            'type' => 'image',
            'content_image' => '/storage/contents/current.jpg',
            'isArchived' => false,
        ]);

        $response = $this
            ->withHeader('Accept', 'application/json')
            ->post("/api/contents/{$content->id}?_method=PUT", [
                'content_image' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content_image']);
    }

    private function createAdminUser(string $email): User
    {
        return User::query()->create([
            'first_name' => 'Content',
            'last_name' => 'Admin',
            'email' => $email,
            'password' => Hash::make('password123'),
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
