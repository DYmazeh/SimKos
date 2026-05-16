<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Komplain;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class KomplainController extends Controller
{
    /**
     * Update status komplen (menunggu → diproses → selesai).
     * Saat status diubah ke 'selesai', kirim notifikasi ke penyewa.
     */
    public function updateStatus(Request $request, Komplain $komplain): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([
                Komplain::STATUS_MENUNGGU,
                Komplain::STATUS_DIPROSES,
                Komplain::STATUS_SELESAI,
            ])],
        ]);

        $payload = ['status' => $data['status']];

        if ($data['status'] === Komplain::STATUS_SELESAI) {
            $payload['resolved_by_admin_id'] = Auth::id();
            $payload['resolved_at'] = now();
        } else {
            // Reverse case: kalau dari selesai dibalikin ke status sebelumnya
            $payload['resolved_by_admin_id'] = null;
            $payload['resolved_at'] = null;
        }

        $komplain->update($payload);

        // Notif ke penyewa kalau selesai
        if ($data['status'] === Komplain::STATUS_SELESAI) {
            $userId = $komplain->penyewa?->user_id;
            if ($userId) {
                \App\Services\NotifikasiService::notifyKomplenSelesai(
                    $userId,
                    $komplain->judul,
                );
            }
        }

        return back()->with('success', 'Status komplen diperbarui.');
    }
}
