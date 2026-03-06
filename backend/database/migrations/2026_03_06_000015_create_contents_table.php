<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contents', function (Blueprint $table) {
            $table->id();

            $table->string('identifier'); // hero_title, hero_banner
            $table->string('page');       // home, about, contact

            $table->enum('type', ['text', 'image']);

            $table->text('content_text')->nullable();
            $table->string('content_image')->nullable();

            $table->boolean('isArchived')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contents');
    }
};
