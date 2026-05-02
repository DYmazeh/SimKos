<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penyewa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->string('nama_lengkap');
            $table->string('no_ktp', 30)->nullable();
            $table->string('no_hp', 20);
            $table->text('alamat_asal')->nullable();
            $table->string('foto_ktp_url')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penyewa');
    }
};
