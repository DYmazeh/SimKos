<?php

namespace App\Policies;

use App\Models\Tagihan;
use App\Models\User;

class TagihanPolicy
{
    /**
     * Admin can view everything.
     * Penyewa can only view their own tagihan.
     */
    public function view(User $user, Tagihan $tagihan): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('penyewa')) {
            $penyewa = $user->penyewa;
            return $penyewa && $tagihan->sewa?->penyewa_id === $penyewa->id;
        }

        return false;
    }

    /**
     * Hanya penyewa pemilik tagihan yang boleh upload bukti.
     */
    public function pay(User $user, Tagihan $tagihan): bool
    {
        if (! $user->hasRole('penyewa')) {
            return false;
        }
        $penyewa = $user->penyewa;
        return $penyewa && $tagihan->sewa?->penyewa_id === $penyewa->id;
    }

    /**
     * Hanya admin yang boleh generate / manage tagihan.
     */
    public function manage(User $user): bool
    {
        return $user->hasRole('admin');
    }
}
