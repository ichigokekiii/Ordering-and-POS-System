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
        Schema::create('orders', function (Blueprint $table) {
            $table->string('order_id')->primary();

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('payment_id')->nullable();

            $table->dateTime('order_date');

            $table->decimal('total_amount', 10, 2);

            $table->string('order_status')->default('pending');
            $table->text('special_message')->nullable();

            $table->text('address')->nullable();

            $table->string('delivery_method');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
