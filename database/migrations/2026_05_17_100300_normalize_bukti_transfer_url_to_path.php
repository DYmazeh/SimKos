<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Normalisasi kolom `pembayaran.bukti_transfer_url` dari format full URL
 * (legacy) ke relative path supaya konsisten dengan refactor
 * BuktiTransferUploader. Ekstrak segmen path setelah nama bucket /
 * direktori "bukti-transfer/" — kalau gak match dibiarin apa adanya.
 *
 * Contoh:
 *   "https://x.supabase.co/storage/v1/s3/simkos-uploads/bukti-transfer/file.jpg"
 *   → "bukti-transfer/file.jpg"
 *
 *   "http://localhost:8000/storage/bukti-transfer/file.jpg"
 *   → "bukti-transfer/file.jpg"
 */
return new class extends Migration
{
    public function up(): void
    {
        $rows = DB::table('pembayaran')
            ->whereNotNull('bukti_transfer_url')
            ->where('bukti_transfer_url', 'like', '%bukti-transfer/%')
            ->where(function ($q) {
                $q->where('bukti_transfer_url', 'like', 'http://%')
                    ->orWhere('bukti_transfer_url', 'like', 'https://%');
            })
            ->get(['id', 'bukti_transfer_url']);

        foreach ($rows as $row) {
            if (preg_match('#(bukti-transfer/[^?#]+)#', $row->bukti_transfer_url, $m)) {
                DB::table('pembayaran')
                    ->where('id', $row->id)
                    ->update(['bukti_transfer_url' => $m[1]]);
            }
        }
    }

    public function down(): void
    {
        // No-op — gak praktis rebuild URL lama tanpa tahu disk yang dipakai
        // saat data dibuat. Restore dari backup kalau perlu rollback.
    }
};
