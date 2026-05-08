<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foto_kamar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kamar_id')->constrained('kamar')->cascadeOnDelete();
            $table->string('url');
            $table->unsignedTinyInteger('urutan')->default(0);
            $table->timestamps();

            $table->index('kamar_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foto_kamar');
    }
};
