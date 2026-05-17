<?php

namespace Database\Seeders;

use App\Models\Sewa;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

/**
 * Seeder demo: buat 1 tagihan untuk setiap sewa aktif dengan periode bulan ini
 * dan jatuh tempo dekat (today + 5 hari) supaya UI penyewa langsung punya
 * tagihan yang bisa diuji-bayar tanpa nunggu scheduler.
 *
 * Idempotent — firstOrCreate pakai unique (sewa_id, periode).
 */
class TagihanSeeder extends Seeder
{
    public function run(): void
    {
        $periode = Carbon::today()->startOfMonth()->toDateString(); // Y-m-01
        $jatuhTempo = Carbon::today()->addDays(5)->toDateString();

        Sewa::query()
            ->where('status', Sewa::STATUS_AKTIF)
            ->get()
            ->each(function (Sewa $sewa) use ($periode, $jatuhTempo) {
                Tagihan::firstOrCreate(
                    ['sewa_id' => $sewa->id, 'periode' => $periode],
                    [
                        'jumlah' => $sewa->harga_disepakati,
                        'tgl_jatuh_tempo' => $jatuhTempo,
                        'status' => Tagihan::STATUS_BELUM_BAYAR,
                    ]
                );
            });
    }
}
