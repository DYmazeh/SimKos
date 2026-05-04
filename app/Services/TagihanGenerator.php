<?php

namespace App\Services;

use App\Models\Sewa;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class TagihanGenerator
{
    public function __construct(private int $jatuhTempoTanggal = 5)
    {
        // Default: tagihan jatuh tempo tanggal 5 setiap bulan
    }

    /**
     * Generate tagihan untuk semua sewa aktif pada periode tertentu.
     * Idempotent: jika tagihan untuk (sewa_id, periode) sudah ada, lewati.
     *
     * @return Collection<int, Tagihan> Tagihan yang baru dibuat
     */
    public function generateForPeriode(Carbon $periode): Collection
    {
        // Pakai Carbon (bukan string) supaya Eloquent serialize konsisten dengan model cast 'date'.
        // Penting untuk firstOrCreate match — kalau pakai string, sqlite simpan sebagai datetime
        // dan compare gagal → duplicate insert + unique-constraint fire.
        $periodeStart = $periode->copy()->startOfMonth();
        $jatuhTempo = $periodeStart->copy()->addDays($this->jatuhTempoTanggal - 1);

        $created = collect();

        Sewa::query()
            ->where('status', Sewa::STATUS_AKTIF)
            ->where('tgl_mulai', '<=', $periodeStart->toDateString())
            ->where(function ($q) use ($periodeStart) {
                $q->whereNull('tgl_selesai')
                    ->orWhere('tgl_selesai', '>=', $periodeStart->toDateString());
            })
            ->each(function (Sewa $sewa) use ($periodeStart, $jatuhTempo, $created) {
                $tagihan = Tagihan::firstOrCreate(
                    ['sewa_id' => $sewa->id, 'periode' => $periodeStart],
                    [
                        'jumlah' => $sewa->harga_disepakati,
                        'tgl_jatuh_tempo' => $jatuhTempo,
                        'status' => Tagihan::STATUS_BELUM_BAYAR,
                    ]
                );

                if ($tagihan->wasRecentlyCreated) {
                    $created->push($tagihan);
                }
            });

        return $created;
    }
}
