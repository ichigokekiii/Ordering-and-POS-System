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
        Schema::create('premade_products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
             $table->string('image');
            $table->string(column: 'description');
            $table->decimal('price', 8, 2);
            $table->boolean('isAvailable')->default(1);
            $table->boolean('isArchive')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('premade_products');
    }
};
