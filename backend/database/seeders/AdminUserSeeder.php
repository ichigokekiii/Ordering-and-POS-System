<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'petalexpressotp@gmail.com'],
            [
                'password' => Hash::make('PetalExpress123'),
                'role' => 'admin',
                'status' => 'Active',
                'first_name' => 'Petal',
                'last_name' => 'Express',
                'phone_number' => null,
                'failed_attempt_count' => 0,
                'is_locked' => false,
                'priority' => 0,
                'is_verified' => 1,

            ]
        );
    }
}
