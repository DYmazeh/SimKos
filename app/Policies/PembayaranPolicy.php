<?php

namespace App\Policies;

use App\Models\Pembayaran;
use App\Models\User;

class PembayaranPolicy
{
    /**
     * Admin can view any; penyewa can view their own.
     */
    public function view(User $user, Pembayaran $pembayaran): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('penyewa')) {
            $penyewa = $user->penyewa;
            return $penyewa && $pembayaran->tagihan?->sewa?->penyewa_id === $penyewa->id;
        }

        return false;
    }

    /**
     * Hanya penyewa pemilik yang boleh download kuitansi (untuk approved).
     */
    public function downloadKuitansi(User $user, Pembayaran $pembayaran): bool
    {
        if ($pembayaran->status_verifikasi !== Pembayaran::STATUS_APPROVED) {
            return false;
        }
        return $this->view($user, $pembayaran);
    }

    /**
     * Hanya admin yang boleh approve / reject.
     */
    public function verify(User $user, Pembayaran $pembayaran): bool
    {
        return $user->hasRole('admin')
            && $pembayaran->status_verifikasi === Pembayaran::STATUS_PENDING;
    }
}
