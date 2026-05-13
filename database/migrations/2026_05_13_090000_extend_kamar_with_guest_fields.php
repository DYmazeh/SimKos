<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Idempotent: tambah hanya kolom yang belum ada (kalau migration partial sudah dijalankan)
        Schema::table('kamar', function (Blueprint $table) {
            if (! Schema::hasColumn('kamar', 'foto')) {
                $table->json('foto')->nullable()->after('deskripsi');
            }
            if (! Schema::hasColumn('kamar', 'fasilitas')) {
                $table->json('fasilitas')->nullable()->after('deskripsi');
            }
            if (! Schema::hasColumn('kamar', 'peraturan')) {
                $table->text('peraturan')->nullable()->after('deskripsi');
            }
            if (! Schema::hasColumn('kamar', 'deposit')) {
                $table->unsignedBigInteger('deposit')->nullable()->after('deskripsi');
            }
            if (! Schema::hasColumn('kamar', 'min_sewa_bulan')) {
                $table->unsignedSmallInteger('min_sewa_bulan')->default(1)->after('deskripsi');
            }
            if (! Schema::hasColumn('kamar', 'luas_m2')) {
                $table->unsignedSmallInteger('luas_m2')->nullable()->after('deskripsi');
            }
            if (! Schema::hasColumn('kamar', 'lantai')) {
                $table->unsignedSmallInteger('lantai')->nullable()->after('deskripsi');
            }
        });
    }

    public function down(): void
    {
        Schema::table('kamar', function (Blueprint $table) {
            foreach (['foto', 'fasilitas', 'peraturan', 'deposit', 'min_sewa_bulan', 'luas_m2', 'lantai'] as $col) {
                if (Schema::hasColumn('kamar', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
