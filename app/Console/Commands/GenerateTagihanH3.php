<?php

namespace App\Console\Commands;

use App\Models\Sewa;
use App\Models\Tagihan;
use App\Services\TagihanGenerator;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * Generate tagihan H-3 sebelum tanggal jatuh tempo bulan ini.
 *
 * Aturan:
 * - Tagihan muncul untuk admin H-3 sebelum tanggal jatuh tempo (config: simkos.jatuh_tempo_tanggal).
 * - Idempotent: kalau tagihan untuk (sewa_id, periode) sudah ada, lewati.
 * - Multi-bulan: kalau penyewa sudah bayar duluan dengan cover_bulan yang mencakup
 *   periode ini, tidak perlu generate (karena tagihan langsung dibuat dengan status lunas
 *   saat approve pembayaran multi-bulan).
 *
 * Jadwal: daily di tengah malam (00:01) — cek apakah today >= due_date - 3 days.
 */
class GenerateTagihanH3 extends Command
{
    protected $signature = 'tagihan:generate-h3 {--force : Force generate untuk bulan ini terlepas H-3 check}';
    protected $description = 'Generate tagihan H-3 sebelum jatuh tempo untuk semua sewa aktif';

    public function handle(TagihanGenerator $generator): int
    {
        $today = Carbon::today();
        $jatuhTempoTanggal = (int) config('simkos.jatuh_tempo_tanggal', 5);

        // Periode = bulan ini (tagihan untuk Mei = periode 2026-05-01)
        $periode = $today->copy()->startOfMonth();
        $dueDate = $periode->copy()->addDays($jatuhTempoTanggal - 1);

        // H-3 check: hanya generate kalau today >= due_date - 3 days
        if (! $this->option('force') && $today->lt($dueDate->copy()->subDays(3))) {
            $this->info("Belum H-3 untuk periode {$periode->format('Y-m')}. Today: {$today->toDateString()}, Due: {$dueDate->toDateString()}. Skipped.");
            return self::SUCCESS;
        }

        $created = $generator->generateForPeriode($periode);

        $this->info("Generated {$created->count()} tagihan baru untuk periode {$periode->translatedFormat('F Y')}.");

        return self::SUCCESS;
    }
}
