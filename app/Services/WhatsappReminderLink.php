<?php

namespace App\Services;

use App\Models\Penyewa;
use App\Models\Tagihan;
use Carbon\Carbon;

class WhatsappReminderLink
{
    /**
     * Buat URL wa.me untuk pengingat tagihan.
     * Return null kalau nomor HP tidak valid (mencegah XSS / link rusak).
     */
    public static function make(Penyewa $penyewa, Tagihan $tagihan): ?string
    {
        $phone = self::normalizePhone($penyewa->no_hp);
        if ($phone === null) {
            return null;
        }

        $kosNama = config('simkos.nama', env('SIMKOS_KOS_NAMA', 'Kos'));
        $kamar = $tagihan->sewa?->kamar?->nomor_kamar ?? '-';
        $periode = Carbon::parse($tagihan->periode)->translatedFormat('F Y');
        $jumlah = number_format($tagihan->jumlah, 0, ',', '.');
        $jatuhTempo = Carbon::parse($tagihan->tgl_jatuh_tempo)->translatedFormat('d F Y');

        $pesan = "Halo {$penyewa->nama_lengkap}, kami dari {$kosNama} mengingatkan tagihan kos kamar {$kamar} periode {$periode} sebesar Rp {$jumlah} jatuh tempo pada {$jatuhTempo}. Mohon segera diselesaikan ya. Terima kasih.";

        return 'https://wa.me/'.$phone.'?text='.rawurlencode($pesan);
    }

    /**
     * Normalize nomor HP Indonesia ke format internasional tanpa "+".
     * "08xxx" -> "628xxx", "+628xxx" -> "628xxx", reject yang aneh.
     */
    public static function normalizePhone(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $raw);
        if ($digits === '' || $digits === null) {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        } elseif (str_starts_with($digits, '8')) {
            $digits = '62'.$digits;
        }

        // Validasi panjang wajar (Indonesia: 10-15 digit termasuk kode negara)
        if (strlen($digits) < 10 || strlen($digits) > 15) {
            return null;
        }

        return $digits;
    }
}
