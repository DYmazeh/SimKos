<?php

namespace App\Console\Commands;

use App\Models\Kamar;
use Illuminate\Console\Command;

/**
 * Sync kamar.status berdasarkan sewa aktif sebagai single source of truth.
 * Idempotent — aman dipanggil berkali-kali. Status 'maintenance' tidak disentuh.
 */
class SyncKamarStatus extends Command
{
    protected $signature = 'kamar:sync-status';

    protected $description = 'Sinkronkan kamar.status berdasarkan sewa aktif (tersedia/terisi).';

    public function handle(): int
    {
        $toTerisi = Kamar::query()
            ->where('status', Kamar::STATUS_TERSEDIA)
            ->whereHas('sewaAktif')
            ->update(['status' => Kamar::STATUS_TERISI]);

        $toTersedia = Kamar::query()
            ->where('status', Kamar::STATUS_TERISI)
            ->whereDoesntHave('sewaAktif')
            ->update(['status' => Kamar::STATUS_TERSEDIA]);

        $this->info("Sync selesai. {$toTerisi} kamar → terisi, {$toTersedia} kamar → tersedia.");

        return self::SUCCESS;
    }
}
