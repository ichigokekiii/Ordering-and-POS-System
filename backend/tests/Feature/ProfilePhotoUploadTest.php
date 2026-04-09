<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfilePhotoUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_upload_a_profile_photo_and_replace_the_old_one(): void
    {
        Storage::fake('public');

        Storage::disk('public')->put('profile-pictures/old-photo.jpg', 'old-photo');

        $user = User::query()->create([
            'first_name' => 'Jamie',
            'last_name' => 'Cruz',
            'email' => 'jamie@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'user',
            'is_verified' => true,
            'profile_picture' => '/storage/profile-pictures/old-photo.jpg',
        ]);

        Sanctum::actingAs($user);

        $response = $this->post('/api/profile/photo', [
            'profile_picture' => UploadedFile::fake()->image('updated-photo.png'),
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'user' => [
                    'profile_picture',
                ],
            ]);

        $user->refresh();

        $this->assertNotSame('/storage/profile-pictures/old-photo.jpg', $user->profile_picture);
        $this->assertStringStartsWith('/storage/profile-pictures/', $response->json('user.profile_picture'));
        Storage::disk('public')->assertMissing('profile-pictures/old-photo.jpg');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $user->profile_picture));
    }
}
