<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_orders', function (Blueprint $table) {
            $table->string('order_id', 50)->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('payment_id', 50)->nullable();
            $table->date('order_date');
            $table->decimal('total_amount', 10, 2);
            $table->string('order_status')->default('pending');
            $table->text('special_message')->nullable();
            $table->string('address');
            $table->string('delivery_method');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('tbl_payments', function (Blueprint $table) {
            $table->string('payment_id', 50)->primary();
            $table->string('order_id', 50);
            $table->string('payment_method');
            $table->date('payment_date');
            $table->string('payment_status')->default('pending');
            $table->string('reference_number');
            $table->string('reference_image_path')->nullable();
            $table->string('confirmed_by')->nullable();
            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('tbl_orders')->onDelete('cascade');
        });

        // Add FK from tbl_orders.payment_id to tbl_payments.payment_id
        // Done after tbl_payments exists
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->foreign('payment_id')->references('payment_id')->on('tbl_payments')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropForeign(['payment_id']);
        });

        Schema::dropIfExists('tbl_payments');
        Schema::dropIfExists('tbl_orders');
    }
};