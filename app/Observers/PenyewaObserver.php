<?php

namespace App\Observers;

use App\Models\Penyewa;
use App\Models\Tagihan;
use Illuminate\Support\Facades\Cache;

/**
 * Observer untuk model Penyewa.
 *
 * Tujuan utama: cegah orphan tagihan (tagihan belum_bayar / terlambat yang
 * penyewa-nya sudah nonaktif/soft-deleted) bocor ke dashboard, reminder list,
 * dan badge sidebar.
 *
 * Strategi: saat penyewa berubah ke nonaktif atau di-soft-delete, batalkan
 * tagihan yang masih outstanding di seluruh riwayat sewa-nya. Tagihan yang
 * sudah `menunggu_verifikasi` atau `lunas` dibiarkan supaya histori pembayaran
 * tetap utuh untuk laporan keuangan.
 */
class PenyewaObserver
{
    public function updated(Penyewa $penyewa): void
    {
        // Hanya bertindak saat status_aktif baru saja transisi ke nonaktif —
        // bukan tiap kali penyewa di-update (nama, no_hp, dll).
        if (
            $penyewa->wasChanged('status_aktif')
            && $penyewa->status_aktif === Penyewa::STATUS_NONAKTIF
        ) {
            $this->cancelPendingTagihan($penyewa);
        }

        $this->bustCache();
    }

    public function deleted(Penyewa $penyewa): void
    {
        // Safety net: kalau penyewa di-soft-delete tanpa lewat deactivate(),
        // tagihan pending tetap dibersihkan supaya badge sidebar tidak ngambang.
        $this->cancelPendingTagihan($penyewa);

        $this->bustCache();
    }

    public function restored(Penyewa $penyewa): void
    {
        $this->bustCache();
    }

    /**
     * Hapus tagihan outstanding (belum_bayar / terlambat) dari semua sewa
     * penyewa ini. Mass-delete via query builder — tidak trigger model events
     * Tagihan, jadi cache invalidation kita handle manual lewat bustCache().
     */
    private function cancelPendingTagihan(Penyewa $penyewa): void
    {
        Tagihan::query()
            ->whereIn('sewa_id', $penyewa->sewa()->pluck('id'))
            ->whereIn('status', [Tagihan::STATUS_BELUM_BAYAR, Tagihan::STATUS_TERLAMBAT])
            ->delete();
    }

    private function bustCache(): void
    {
        Cache::forget('sidebar_counts:admin');
    }
}
