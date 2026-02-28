<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    Schema::create('tbl_orders', function (Blueprint $table) {
        $table->id('order_id');
        $table->unsignedBigInteger('user_id'); 
        $table->unsignedBigInteger('payment_id')->nullable(); // Nullable because payment happens after the order is created
        $table->timestamp('order_date')->useCurrent();
        $table->decimal('total_amount', 10, 2);
        $table->string('order_status')->default('pending'); // e.g., pending, processing, completed
        $table->text('special_message')->nullable();
        $table->string('delivery_method');
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('tbl_orders');
}
};
