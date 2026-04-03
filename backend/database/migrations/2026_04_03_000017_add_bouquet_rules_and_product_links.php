<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_products', function (Blueprint $table) {
            if (Schema::hasColumn('custom_products', 'catalog_product_id') && !Schema::hasColumn('custom_products', 'product_id')) {
                $table->renameColumn('catalog_product_id', 'product_id');
            }

            if (!Schema::hasColumn('custom_products', 'required_main_count')) {
                $table->unsignedInteger('required_main_count')->nullable()->after('isAvailable');
            }

            if (!Schema::hasColumn('custom_products', 'required_filler_count')) {
                $table->unsignedInteger('required_filler_count')->nullable()->after('required_main_count');
            }
        });

        Schema::table('premade_products', function (Blueprint $table) {
            if (Schema::hasColumn('premade_products', 'catalog_product_id') && !Schema::hasColumn('premade_products', 'product_id')) {
                $table->renameColumn('catalog_product_id', 'product_id');
            }
        });

        DB::table('custom_products')
            ->where('category', 'Bouquets')
            ->whereNull('required_main_count')
            ->update([
                'required_main_count' => 1,
                'required_filler_count' => 2,
            ]);

        DB::table('custom_products')
            ->where('category', '!=', 'Bouquets')
            ->update([
                'required_main_count' => null,
                'required_filler_count' => null,
            ]);
    }

    public function down(): void
    {
        Schema::table('premade_products', function (Blueprint $table) {
            if (Schema::hasColumn('premade_products', 'product_id') && !Schema::hasColumn('premade_products', 'catalog_product_id')) {
                $table->renameColumn('product_id', 'catalog_product_id');
            }
        });

        Schema::table('custom_products', function (Blueprint $table) {
            if (Schema::hasColumn('custom_products', 'required_filler_count')) {
                $table->dropColumn('required_filler_count');
            }

            if (Schema::hasColumn('custom_products', 'required_main_count')) {
                $table->dropColumn('required_main_count');
            }

            if (Schema::hasColumn('custom_products', 'product_id') && !Schema::hasColumn('custom_products', 'catalog_product_id')) {
                $table->renameColumn('product_id', 'catalog_product_id');
            }
        });
    }
};
