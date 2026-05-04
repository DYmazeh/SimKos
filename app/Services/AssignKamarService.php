<?php

namespace App\Services;

use App\Models\Kamar;
use App\Models\Penyewa;
use App\Models\Sewa;
use Carbon\Carbon;
use DomainException;
use Illuminate\Support\Facades\DB;

class AssignKamarService
{
    /**
     * Tugaskan penyewa ke kamar (buat record Sewa, update status kamar).
     * Atomik via DB transaction.
     *
     * @throws DomainException kalau penyewa sudah punya sewa aktif atau kamar tidak tersedia
     */
    public function assign(
        Penyewa $penyewa,
        Kamar $kamar,
        Carbon $tglMulai,
        ?int $hargaDisepakati = null,
    ): Sewa {
        return DB::transaction(function () use ($penyewa, $kamar, $tglMulai, $hargaDisepakati) {
            // Lock baris penyewa & kamar selama transaksi
            $penyewa = Penyewa::query()->lockForUpdate()->findOrFail($penyewa->id);
            $kamar = Kamar::query()->lockForUpdate()->findOrFail($kamar->id);

            if ($penyewa->sewa()->where('status', Sewa::STATUS_AKTIF)->exists()) {
                throw new DomainException('Penyewa ini sudah punya sewa aktif. Akhiri dulu sebelum assign kamar baru.');
            }

            if ($kamar->status !== Kamar::STATUS_TERSEDIA) {
                throw new DomainException("Kamar {$kamar->nomor_kamar} tidak tersedia (status: {$kamar->status}).");
            }

            $sewa = Sewa::create([
                'penyewa_id' => $penyewa->id,
                'kamar_id' => $kamar->id,
                'tgl_mulai' => $tglMulai->toDateString(),
                'harga_disepakati' => $hargaDisepakati ?? $kamar->harga_bulanan,
                'status' => Sewa::STATUS_AKTIF,
            ]);

            $kamar->update(['status' => Kamar::STATUS_TERISI]);

            return $sewa->fresh(['kamar', 'penyewa']);
        });
    }

    /**
     * Akhiri sewa: set sewa.status = selesai, kamar kembali tersedia.
     */
    public function endSewa(Sewa $sewa, ?Carbon $tglSelesai = null): Sewa
    {
        return DB::transaction(function () use ($sewa, $tglSelesai) {
            $sewa = Sewa::query()->lockForUpdate()->findOrFail($sewa->id);

            if ($sewa->status !== Sewa::STATUS_AKTIF) {
                throw new DomainException('Sewa ini sudah tidak aktif.');
            }

            $sewa->update([
                'status' => Sewa::STATUS_SELESAI,
                'tgl_selesai' => ($tglSelesai ?? Carbon::today())->toDateString(),
            ]);

            // Cek apakah kamar masih punya sewa aktif lain (defensive — seharusnya tidak)
            $kamar = $sewa->kamar()->first();
            if ($kamar && ! $kamar->sewa()->where('status', Sewa::STATUS_AKTIF)->exists()) {
                $kamar->update(['status' => Kamar::STATUS_TERSEDIA]);
            }

            return $sewa->fresh(['kamar', 'penyewa']);
        });
    }
}
