<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::create('tbl_payments', function (Blueprint $table) {
        $table->id('payment_id');
        $table->unsignedBigInteger('order_id');
        $table->string('payment_method'); // e.g., GCash, Cash
        $table->timestamp('payment_date')->useCurrent();
        $table->string('payment_status')->default('pending'); // e.g., pending, verified, failed
        $table->string('reference_number')->nullable();
        $table->string('reference_image_path')->nullable(); // This will hold your "storage/products/..." image paths
        $table->unsignedBigInteger('confirmed_by')->nullable(); // ID of the admin who verifies the GCash receipt
        $table->timestamps();

        // Optional but recommended: link the order_id to the tbl_orders table
        $table->foreign('order_id')->references('order_id')->on('tbl_orders')->onDelete('cascade');
    });
}

public function down()
{
    Schema::dropIfExists('tbl_payments');
}
};
