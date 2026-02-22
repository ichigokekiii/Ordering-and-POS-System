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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('failed_attempt_count')->default(0)->after('status');
            $table->timestamp('last_failed_attempt_at')->nullable()->after('failed_attempt_count');
            $table->boolean('is_locked')->default(false)->after('last_failed_attempt_at');
            $table->integer('priority')->default(0)->after('is_locked');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'failed_attempt_count',
                'last_failed_attempt_at',
                'is_locked',
                'priority'
            ]);
        });
    }
};
