<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah field cover_bulan untuk multi-bulan payment.
 * Default 1 = pembayaran ini cover 1 bulan tagihan.
 * Saat admin approve, sistem mark N bulan tagihan ke depan jadi lunas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->unsignedTinyInteger('cover_bulan')->default(1)->after('jumlah_bayar');
        });
    }

    public function down(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->dropColumn('cover_bulan');
        });
    }
};
