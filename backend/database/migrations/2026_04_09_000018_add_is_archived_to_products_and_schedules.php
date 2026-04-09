<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('isArchived')->default(false)->after('isAvailable');
        });

        Schema::table('custom_products', function (Blueprint $table) {
            $table->boolean('isArchived')->default(false)->after('isAvailable');
        });

        Schema::table('premade_products', function (Blueprint $table) {
            $table->boolean('isArchived')->default(false)->after('isAvailable');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->boolean('isArchived')->default(false)->after('isAvailable');
        });

        DB::table('products')->update([
            'isArchived' => DB::raw('CASE WHEN isAvailable = 0 THEN 1 ELSE 0 END'),
        ]);

        DB::table('custom_products')->update([
            'isArchived' => DB::raw('CASE WHEN isAvailable = 0 THEN 1 ELSE 0 END'),
        ]);

        DB::table('premade_products')->update([
            'isArchived' => DB::raw('CASE WHEN isAvailable = 0 THEN 1 ELSE 0 END'),
        ]);

        DB::table('schedules')->update([
            'isArchived' => DB::raw('CASE WHEN isAvailable = 0 THEN 1 ELSE 0 END'),
        ]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('isArchived');
        });

        Schema::table('custom_products', function (Blueprint $table) {
            $table->dropColumn('isArchived');
        });

        Schema::table('premade_products', function (Blueprint $table) {
            $table->dropColumn('isArchived');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('isArchived');
        });
    }
};
