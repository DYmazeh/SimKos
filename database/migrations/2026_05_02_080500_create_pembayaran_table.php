<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tagihan_id')->constrained('tagihan')->cascadeOnDelete();
            $table->date('tgl_bayar');
            $table->unsignedBigInteger('jumlah_bayar');
            $table->string('metode', 30)->default('transfer'); // transfer | tunai
            $table->string('bukti_transfer_url')->nullable();
            $table->string('status_verifikasi', 20)->default('pending');
            // pending | approved | rejected
            $table->foreignId('diverifikasi_oleh')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index('tagihan_id');
            $table->index('status_verifikasi');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
