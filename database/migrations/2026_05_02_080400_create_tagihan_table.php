<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tagihan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sewa_id')->constrained('sewa')->cascadeOnDelete();
            $table->date('periode'); // selalu tanggal 1 dari bulan terkait, e.g. 2026-05-01
            $table->unsignedBigInteger('jumlah');
            $table->date('tgl_jatuh_tempo');
            $table->string('status', 25)->default('belum_bayar');
            // belum_bayar | menunggu_verifikasi | lunas | terlambat
            $table->timestamps();

            // 1 sewa hanya boleh punya 1 tagihan per periode (idempotency)
            $table->unique(['sewa_id', 'periode']);
            $table->index(['status', 'tgl_jatuh_tempo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tagihan');
    }
};
