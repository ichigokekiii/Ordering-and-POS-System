<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // This runs when you execute: php artisan migrate
    public function up(): void
    {
        // Add a 'status' column to the users table
        Schema::table('users', function (Blueprint $table) {
            // Add a string column named 'status' with default value 'Active'
            $table->string('status')->default('Active');
        });
    }

    // This runs when you execute: php artisan migrate:rollback
    public function down(): void
    {
        // Remove the 'status' column from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
