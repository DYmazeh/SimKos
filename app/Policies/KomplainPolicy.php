<?php

namespace App\Policies;

use App\Models\Komplain;
use App\Models\User;

class KomplainPolicy
{
    /**
     * Admin can view any; penyewa can view their own complaint.
     */
    public function view(User $user, Komplain $komplain): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('penyewa')) {
            $penyewa = $user->penyewa;
            return $penyewa && $komplain->penyewa_id === $penyewa->id;
        }

        return false;
    }

    /**
     * Penyewa boleh create komplen kalau punya sewa aktif.
     */
    public function create(User $user): bool
    {
        if (! $user->hasRole('penyewa')) {
            return false;
        }
        $penyewa = $user->penyewa;
        return $penyewa?->sewaAktif !== null;
    }

    /**
     * Hanya admin yang boleh update status komplen.
     */
    public function updateStatus(User $user, Komplain $komplain): bool
    {
        return $user->hasRole('admin');
    }
}
