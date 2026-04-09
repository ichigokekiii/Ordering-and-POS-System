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
        Schema::create('pos_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pos_id')
                  ->constrained('pos_transactions')
                  ->cascadeOnDelete();

            $table->unsignedBigInteger('product_id')->nullable();
            $table->foreignId('source_product_id')->nullable()->constrained('products')->nullOnDelete();

            $table->string('product_name');

            $table->decimal('price', 10, 2);

            $table->integer('quantity');

            $table->timestamps();

            $table->index(['pos_id', 'source_product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_items');
    }
};
