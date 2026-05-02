<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kamar', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_kamar', 20)->unique();
            $table->string('tipe', 30)->default('standar'); // standar | deluxe | vip
            $table->unsignedBigInteger('harga_bulanan'); // dalam Rupiah
            $table->string('status', 20)->default('tersedia'); // tersedia | terisi | maintenance
            $table->text('deskripsi')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kamar');
    }
};
