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
        Schema::table('pos_items', function (Blueprint $table) {
            if (Schema::hasColumn('pos_items', 'catalog_product_id') && !Schema::hasColumn('pos_items', 'source_product_id')) {
                $table->renameColumn('catalog_product_id', 'source_product_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_items', function (Blueprint $table) {
            if (Schema::hasColumn('pos_items', 'source_product_id') && !Schema::hasColumn('pos_items', 'catalog_product_id')) {
                $table->renameColumn('source_product_id', 'catalog_product_id');
            }
        });
    }
};
