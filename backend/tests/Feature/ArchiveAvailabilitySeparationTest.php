<?php

namespace Tests\Feature;

use App\Models\CustomProduct;
use App\Models\PremadeProduct;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ArchiveAvailabilitySeparationTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_archived_migration_backfills_existing_unavailable_rows(): void
    {
        Schema::disableForeignKeyConstraints();

        foreach (['products', 'custom_products', 'premade_products', 'schedules'] as $tableName) {
            if (Schema::hasColumn($tableName, 'isArchived')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn('isArchived');
                });
            }
        }

        Schema::enableForeignKeyConstraints();

        DB::table('products')->insert([
            [
                'product_source' => 'custom',
                'source_product_id' => 101,
                'name' => 'Visible Catalog Product',
                'description' => 'Visible',
                'category' => 'Bouquets',
                'type' => 'custom',
                'price' => 100,
                'image' => null,
                'isAvailable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_source' => 'premade',
                'source_product_id' => 202,
                'name' => 'Hidden Catalog Product',
                'description' => 'Hidden',
                'category' => 'Roses',
                'type' => 'premade',
                'price' => 200,
                'image' => null,
                'isAvailable' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('custom_products')->insert([
            [
                'name' => 'Visible Custom Product',
                'image' => null,
                'description' => 'Visible',
                'category' => 'Bouquets',
                'type' => 'Main Flowers',
                'price' => 100,
                'isAvailable' => true,
                'required_main_count' => 1,
                'required_filler_count' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Hidden Custom Product',
                'image' => null,
                'description' => 'Hidden',
                'category' => 'Additional',
                'type' => 'Fillers',
                'price' => 50,
                'isAvailable' => false,
                'required_main_count' => null,
                'required_filler_count' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('premade_products')->insert([
            [
                'name' => 'Visible Premade Product',
                'image' => null,
                'description' => 'Visible',
                'category' => 'Roses',
                'type' => 'Mixed',
                'price' => 300,
                'isAvailable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Hidden Premade Product',
                'image' => null,
                'description' => 'Hidden',
                'category' => 'Tulips',
                'type' => 'Mixed',
                'price' => 350,
                'isAvailable' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('schedules')->insert([
            [
                'schedule_name' => 'Visible Schedule',
                'image' => null,
                'schedule_description' => 'Visible',
                'location' => 'Main Branch',
                'event_date' => now()->addDays(10),
                'isAvailable' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'schedule_name' => 'Hidden Schedule',
                'image' => null,
                'schedule_description' => 'Hidden',
                'location' => 'Second Branch',
                'event_date' => now()->addDays(12),
                'isAvailable' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $migration = require base_path('database/migrations/2026_04_09_000018_add_is_archived_to_products_and_schedules.php');
        $migration->up();

        $this->assertDatabaseHas('products', ['name' => 'Visible Catalog Product', 'isArchived' => false]);
        $this->assertDatabaseHas('products', ['name' => 'Hidden Catalog Product', 'isArchived' => true]);
        $this->assertDatabaseHas('custom_products', ['name' => 'Visible Custom Product', 'isArchived' => false]);
        $this->assertDatabaseHas('custom_products', ['name' => 'Hidden Custom Product', 'isArchived' => true]);
        $this->assertDatabaseHas('premade_products', ['name' => 'Visible Premade Product', 'isArchived' => false]);
        $this->assertDatabaseHas('premade_products', ['name' => 'Hidden Premade Product', 'isArchived' => true]);
        $this->assertDatabaseHas('schedules', ['schedule_name' => 'Visible Schedule', 'isArchived' => false]);
        $this->assertDatabaseHas('schedules', ['schedule_name' => 'Hidden Schedule', 'isArchived' => true]);
    }

    public function test_custom_product_archive_update_does_not_change_availability(): void
    {
        Sanctum::actingAs($this->createAdminUser());

        $product = CustomProduct::create([
            'name' => 'Archive Target',
            'image' => null,
            'description' => 'Custom product',
            'category' => 'Additional',
            'type' => 'Fillers',
            'price' => 120,
            'isAvailable' => false,
            'isArchived' => false,
        ]);

        $response = $this->putJson("/api/products/{$product->id}", [
            'isArchived' => true,
        ]);

        $response->assertOk()
            ->assertJson([
                'isAvailable' => false,
                'isArchived' => true,
            ]);

        $this->assertDatabaseHas('custom_products', [
            'id' => $product->id,
            'isAvailable' => false,
            'isArchived' => true,
        ]);
    }

    public function test_premade_archive_update_does_not_change_availability(): void
    {
        Sanctum::actingAs($this->createAdminUser());

        $premade = PremadeProduct::create([
            'name' => 'Premade Archive Target',
            'image' => null,
            'description' => 'Premade product',
            'category' => 'Roses',
            'type' => 'Mixed',
            'price' => 450,
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $response = $this->putJson("/api/premades/{$premade->id}", [
            'isArchived' => true,
        ]);

        $response->assertOk()
            ->assertJson([
                'isAvailable' => true,
                'isArchived' => true,
            ]);

        $this->assertDatabaseHas('premade_products', [
            'id' => $premade->id,
            'isAvailable' => true,
            'isArchived' => true,
        ]);
    }

    public function test_schedule_archive_update_does_not_change_availability(): void
    {
        Sanctum::actingAs($this->createAdminUser());

        $schedule = Schedule::create([
            'schedule_name' => 'Archiveable Event',
            'location' => 'Main Branch',
            'schedule_description' => 'Schedule item',
            'event_date' => now()->addDays(5),
            'isAvailable' => false,
            'isArchived' => false,
        ]);

        $response = $this->putJson("/api/schedules/{$schedule->id}", [
            'isArchived' => true,
        ]);

        $response->assertOk()
            ->assertJson([
                'isAvailable' => false,
                'isArchived' => true,
            ]);

        $this->assertDatabaseHas('schedules', [
            'id' => $schedule->id,
            'isAvailable' => false,
            'isArchived' => true,
        ]);
    }

    public function test_availability_update_does_not_archive_product_or_schedule(): void
    {
        Sanctum::actingAs($this->createAdminUser());

        $product = CustomProduct::create([
            'name' => 'Availability Target',
            'image' => null,
            'description' => 'Custom product',
            'category' => 'Additional',
            'type' => 'Main Flowers',
            'price' => 150,
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $schedule = Schedule::create([
            'schedule_name' => 'Availability Event',
            'location' => 'Main Branch',
            'schedule_description' => 'Schedule item',
            'event_date' => now()->addDays(8),
            'isAvailable' => true,
            'isArchived' => false,
        ]);

        $this->putJson("/api/products/{$product->id}", [
            'isAvailable' => false,
        ])->assertOk()->assertJson([
            'isAvailable' => false,
            'isArchived' => false,
        ]);

        $this->putJson("/api/schedules/{$schedule->id}", [
            'isAvailable' => false,
        ])->assertOk()->assertJson([
            'isAvailable' => false,
            'isArchived' => false,
        ]);

        $this->assertDatabaseHas('custom_products', [
            'id' => $product->id,
            'isAvailable' => false,
            'isArchived' => false,
        ]);

        $this->assertDatabaseHas('schedules', [
            'id' => $schedule->id,
            'isAvailable' => false,
            'isArchived' => false,
        ]);
    }

    protected function createAdminUser(): User
    {
        return User::query()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => fake()->unique()->safeEmail(),
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'is_verified' => true,
        ]);
    }
}
