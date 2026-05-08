<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('penyewa', function (Blueprint $table) {
            $table->string('status_aktif', 20)->default('aktif')->after('foto_ktp_url');
            $table->text('catatan')->nullable()->after('status_aktif');
        });
    }

    public function down(): void
    {
        Schema::table('penyewa', function (Blueprint $table) {
            $table->dropColumn(['status_aktif', 'catatan']);
        });
    }
};
