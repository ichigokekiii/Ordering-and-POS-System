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
        Schema::create('payments', function (Blueprint $table) {
            $table->string('payment_id')->primary();

            $table->string('order_id');
            $table->foreign('order_id')
                  ->references('order_id')
                  ->on('orders')
                  ->cascadeOnDelete();

            $table->string('payment_method');

            $table->dateTime('payment_date')->nullable();

            $table->string('payment_status')->default('pending');

            $table->string('reference_number')->nullable();

            $table->string('reference_image_path')->nullable();

            $table->foreignId('confirmed_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
