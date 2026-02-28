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
        // Adding the address column after special_message for better organization
        $table->text('address')->nullable()->after('special_message');
    });
}

public function down()
{
    Schema::table('tbl_orders', function (Blueprint $table) {
        // Rollback instruction
        $table->dropColumn('address');
    });
}
};
