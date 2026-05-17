<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah soft delete ke Kamar — supaya Kamar yang punya riwayat sewa
 * tidak hard-delete data terkait. Bisa di-restore dari audit log.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Idempotent: kalau column sudah dibuat di create_kamar_table (initial schema),
        // skip supaya `migrate:fresh` di environment baru (SQLite test) tidak gagal.
        if (Schema::hasColumn('kamar', 'deleted_at')) {
            return;
        }
        Schema::table('kamar', function (Blueprint $table) {
            $table->softDeletes()->after('updated_at');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('kamar', 'deleted_at')) {
            return;
        }
        Schema::table('kamar', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
