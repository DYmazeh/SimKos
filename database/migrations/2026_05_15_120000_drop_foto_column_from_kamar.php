<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kolom 'foto' JSON pada tabel 'kamar' konflik dengan relasi Kamar::foto()
 * (HasMany ke FotoKamar). Eloquent prefer attribute → relasi tertimpa null →
 * "Call to a member function map() on null". Foto kamar sudah dihandle via
 * tabel foto_kamar, jadi kolom ini redundan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kamar', function (Blueprint $table) {
            if (Schema::hasColumn('kamar', 'foto')) {
                $table->dropColumn('foto');
            }
        });
    }

    public function down(): void
    {
        Schema::table('kamar', function (Blueprint $table) {
            if (! Schema::hasColumn('kamar', 'foto')) {
                $table->json('foto')->nullable()->after('deskripsi');
            }
        });
    }
};
