<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('tbl_orders', function (Blueprint $table) {
        $table->string('payment_id')->nullable()->change();
    });
}

public function down()
{
    Schema::table('tbl_orders', function (Blueprint $table) {
        $table->string('payment_id')->nullable(false)->change();
    });
}
};
