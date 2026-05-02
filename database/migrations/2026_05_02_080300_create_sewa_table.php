<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sewa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penyewa_id')->constrained('penyewa')->cascadeOnDelete();
            $table->foreignId('kamar_id')->constrained('kamar')->restrictOnDelete();
            $table->date('tgl_mulai');
            $table->date('tgl_selesai')->nullable();
            $table->unsignedBigInteger('harga_disepakati');
            $table->string('status', 20)->default('aktif'); // aktif | selesai | dibatalkan
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'kamar_id']);
            $table->index('penyewa_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sewa');
    }
};
