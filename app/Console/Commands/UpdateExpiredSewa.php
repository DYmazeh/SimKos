<?php

namespace App\Console\Commands;

use App\Models\Sewa;
use App\Models\Kamar;
use App\Services\NotifikasiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateExpiredSewa extends Command
{
    protected $signature = 'sewa:update-expired';

    protected $description = 'Akhiri sewa yang tgl_selesai sudah lewat, dan beri notif kontrak mendekati berakhir (default 3 hari, override via SIMKOS_REMINDER_DAYS)';

    public function handle(): int
    {
        $today = Carbon::today()->toDateString();

        // --- FR-012: Auto update status kamar saat kontrak berakhir ---
        $expiredSewa = Sewa::query()
            ->where('status', Sewa::STATUS_AKTIF)
            ->whereNotNull('tgl_selesai')
            ->where('tgl_selesai', '<', $today)
            ->with(['kamar', 'penyewa'])
            ->get();

        foreach ($expiredSewa as $sewa) {
            DB::transaction(function () use ($sewa) {
                $sewa->update(['status' => Sewa::STATUS_SELESAI]);

                if ($sewa->kamar) {
                    $sewa->kamar->update(['status' => Kamar::STATUS_TERSEDIA]);
                }
            });

            $this->info("Sewa #{$sewa->id} (Kamar {$sewa->kamar?->nomor_kamar}) diakhiri otomatis.");
        }

        // --- FR-021: Notif kontrak mendekati berakhir (default 3 hari per SRS BAB 3) ---
        $reminderDays = (int) config('simkos.reminder_days', 3);
        $horizon = Carbon::today()->addDays($reminderDays)->toDateString();

        $expiringSewa = Sewa::query()
            ->where('status', Sewa::STATUS_AKTIF)
            ->whereNotNull('tgl_selesai')
            ->whereBetween('tgl_selesai', [$today, $horizon])
            ->with(['penyewa', 'kamar'])
            ->get();

        foreach ($expiringSewa as $sewa) {
            if ($sewa->penyewa && $sewa->kamar) {
                NotifikasiService::notifyKontrakExpiring(
                    $sewa->penyewa->nama_lengkap,
                    $sewa->kamar->nomor_kamar,
                    Carbon::parse($sewa->tgl_selesai)->translatedFormat('d F Y')
                );
                $this->info("Notif kontrak expiring: {$sewa->penyewa->nama_lengkap} (Kamar {$sewa->kamar->nomor_kamar})");
            }
        }

        $this->info("Selesai. {$expiredSewa->count()} sewa diakhiri, {$expiringSewa->count()} reminder dikirim.");

        return self::SUCCESS;
    }
}
