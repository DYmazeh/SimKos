<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lampiran foto untuk komplen. Penyewa bisa attach 1-3 foto bukti masalah
 * (foto AC bocor, foto pintu rusak, dll) supaya admin lebih paham.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foto_komplain', function (Blueprint $table) {
            $table->id();
            $table->foreignId('komplain_id')->constrained('komplain')->cascadeOnDelete();
            $table->string('url');
            $table->timestamps();

            $table->index('komplain_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foto_komplain');
    }
};
