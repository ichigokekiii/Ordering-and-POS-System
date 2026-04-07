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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id('order_item_id');

            $table->string('order_id');
            $table->foreign('order_id')
                ->references('order_id')
                ->on('orders')
                ->cascadeOnDelete();

            // Store the ordered product's source ID directly.
            $table->unsignedBigInteger('product_id');

            // Snapshot of the product name at time of purchase
            $table->string('product_name')->nullable();

            // Groups all flowers belonging to the same custom bouquet.
            // NULL means the item is a plain premade product.
            $table->unsignedInteger('custom_id')->nullable();

            // Groups premade items that belong to the same cart entry.
            // Allows two orders of the same premade with different greeting cards
            // to be stored as separate rows. NULL for custom bouquet rows.
            $table->unsignedInteger('premade_id')->nullable();

            $table->integer('quantity');

            $table->decimal('price_at_purchase', 10, 2);

            // Greeting card message attached to this item. NULL if no card was added.
            $table->text('special_message')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
