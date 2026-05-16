<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel komplain (keluhan dari penyewa terkait kamar yang ditempati).
 * Status workflow: menunggu → diproses → selesai.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('komplain', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kamar_id')->constrained('kamar')->cascadeOnDelete();
            $table->foreignId('penyewa_id')->constrained('penyewa')->cascadeOnDelete();
            $table->string('judul', 200);
            $table->text('deskripsi');
            $table->enum('status', ['menunggu', 'diproses', 'selesai'])->default('menunggu');
            $table->foreignId('resolved_by_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['kamar_id', 'status']);
            $table->index(['penyewa_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('komplain');
    }
};
