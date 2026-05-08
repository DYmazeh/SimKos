<?php

namespace App\Services;

use App\Models\Notifikasi;
use App\Models\User;

class NotifikasiService
{
    /**
     * Buat notifikasi untuk satu user.
     */
    public static function create(
        int $userId,
        string $judul,
        string $pesan,
        string $tipe,
        ?string $urlReferensi = null
    ): Notifikasi {
        return Notifikasi::create([
            'user_id' => $userId,
            'judul' => $judul,
            'pesan' => $pesan,
            'tipe' => $tipe,
            'url_referensi' => $urlReferensi,
        ]);
    }

    /**
     * Kirim notifikasi ke semua user dengan role tertentu.
     */
    public static function notifyRole(
        string $role,
        string $judul,
        string $pesan,
        string $tipe,
        ?string $urlReferensi = null
    ): void {
        $users = User::role($role)->pluck('id');

        foreach ($users as $userId) {
            self::create($userId, $judul, $pesan, $tipe, $urlReferensi);
        }
    }

    /**
     * FR-029: Penyewa upload bukti → notif ke semua admin
     */
    public static function notifyBuktiUploaded(string $namaPenyewa, string $kamar, int $tagihanId): void
    {
        self::notifyRole(
            'admin',
            'Bukti Pembayaran Baru',
            "{$namaPenyewa} (Kamar {$kamar}) telah mengunggah bukti pembayaran. Silakan verifikasi.",
            Notifikasi::TIPE_PEMBAYARAN,
            route('admin.pembayaran.index', ['status' => 'pending'])
        );
    }

    /**
     * FR-035: Admin approve/reject → notif ke penyewa
     */
    public static function notifyPembayaranVerified(int $userId, string $status, string $kamar, string $periode): void
    {
        $isApproved = $status === 'approved';

        self::create(
            $userId,
            $isApproved ? 'Pembayaran Disetujui' : 'Pembayaran Ditolak',
            $isApproved
                ? "Pembayaran untuk Kamar {$kamar} periode {$periode} telah dikonfirmasi. Terima kasih!"
                : "Pembayaran untuk Kamar {$kamar} periode {$periode} ditolak. Silakan periksa catatan dan upload ulang.",
            Notifikasi::TIPE_PEMBAYARAN,
            route('penyewa.dashboard')
        );
    }

    /**
     * FR-021: Kontrak mendekati berakhir → notif ke admin
     */
    public static function notifyKontrakExpiring(string $namaPenyewa, string $kamar, string $tglSelesai): void
    {
        self::notifyRole(
            'admin',
            'Kontrak Sewa Segera Berakhir',
            "Kontrak sewa {$namaPenyewa} (Kamar {$kamar}) akan berakhir pada {$tglSelesai}.",
            Notifikasi::TIPE_KONTRAK,
            route('admin.penyewa.index')
        );
    }
}
