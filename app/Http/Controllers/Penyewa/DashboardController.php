<?php

namespace App\Http\Controllers\Penyewa;

use App\Http\Controllers\Controller;
use App\Models\Tagihan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = Auth::user();
        $penyewa = $user->penyewa()->with(['sewaAktif.kamar'])->first();

        $penyewaData = null;
        if ($penyewa) {
            $penyewaData = [
                'id' => $penyewa->id,
                'nama_lengkap' => $penyewa->nama_lengkap,
                'no_hp' => $penyewa->no_hp,
                'sewa_aktif' => $penyewa->sewaAktif ? [
                    'kamar_nomor' => $penyewa->sewaAktif->kamar->nomor_kamar,
                    'tipe' => $penyewa->sewaAktif->kamar->tipe,
                    'tgl_mulai' => $penyewa->sewaAktif->tgl_mulai->format('Y-m-d'),
                    'harga_disepakati' => (int) $penyewa->sewaAktif->harga_disepakati,
                    'status' => $penyewa->sewaAktif->status,
                ] : null,
            ];
        }

        $tagihan = collect();
        if ($penyewa) {
            $tagihan = Tagihan::query()
                ->whereHas('sewa', fn ($q) => $q->where('penyewa_id', $penyewa->id))
                ->with(['pembayaran' => fn ($q) => $q->latest()])
                ->orderBy('periode', 'desc')
                ->limit(12)
                ->get()
                ->map(fn ($t) => [
                    'id' => $t->id,
                    'periode' => $t->periode->format('Y-m-d'),
                    'jumlah' => (int) $t->jumlah,
                    'tgl_jatuh_tempo' => $t->tgl_jatuh_tempo->format('Y-m-d'),
                    'status' => $t->status,
                    'latest_rejected_catatan' => $t->pembayaran
                        ->where('status_verifikasi', 'rejected')
                        ->sortByDesc('verified_at')
                        ->first()?->catatan,
                ]);
        }

        return Inertia::render('Penyewa/Dashboard', [
            'penyewa' => $penyewaData,
            'tagihan' => $tagihan,
        ]);
    }
}
