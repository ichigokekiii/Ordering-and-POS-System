<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('email')->unique();
            $table->string('password');

            $table->string('role')->default('customer');
            $table->string('status')->default('active');

            $table->string('first_name');
            $table->string('last_name');

            $table->string('phone_number')->nullable();

            $table->integer('failed_attempt_count')->default(0);
            $table->timestamp('last_failed_attempt_at')->nullable();

            $table->boolean('is_locked')->default(false);
            $table->integer('priority')->default(0);

            $table->boolean('is_verified')->default(false);

            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
