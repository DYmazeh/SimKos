<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kamar', function (Blueprint $table) {
            $table->text('fasilitas')->nullable()->after('deskripsi');
            $table->decimal('luas_m2', 5, 2)->nullable()->after('fasilitas');
            $table->unsignedTinyInteger('lantai')->nullable()->after('luas_m2');
        });
    }

    public function down(): void
    {
        Schema::table('kamar', function (Blueprint $table) {
            $table->dropColumn(['fasilitas', 'luas_m2', 'lantai']);
        });
    }
};
