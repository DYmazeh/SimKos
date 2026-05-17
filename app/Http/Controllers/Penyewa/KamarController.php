<?php

namespace App\Http\Controllers\Penyewa;

use App\Http\Controllers\Controller;
use App\Services\StorageUrl;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class KamarController extends Controller
{
    /**
     * Detail kamar yang sedang ditempati penyewa login.
     * Info: foto, fasilitas, peraturan, deposit, kontak pengelola.
     */
    public function show(): Response
    {
        $penyewa = Auth::user()->penyewa()->with([
            'sewaAktif.kamar.foto',
        ])->first();

        $kamar = $penyewa?->sewaAktif?->kamar;

        if (! $kamar) {
            throw new AccessDeniedHttpException('Anda belum memiliki sewa kamar aktif.');
        }

        $sewa = $penyewa->sewaAktif;

        return Inertia::render('Penyewa/Kamar/Show', [
            'kamar' => [
                'id' => $kamar->id,
                'nomor_kamar' => $kamar->nomor_kamar,
                'tipe' => $kamar->tipe,
                'harga_bulanan' => (int) $kamar->harga_bulanan,
                'deskripsi' => $kamar->deskripsi,
                'fasilitas' => $kamar->fasilitas ?? [],
                'luas_m2' => $kamar->luas_m2,
                'lantai' => $kamar->lantai,
                'peraturan' => $kamar->peraturan,
                'deposit' => (int) $kamar->deposit,
                'foto' => $kamar->foto->map(fn ($f) => [
                    'id' => $f->id,
                    'url' => StorageUrl::for($f->url),
                ])->values(),
            ],
            'sewa' => [
                'tgl_mulai' => $sewa->tgl_mulai->format('Y-m-d'),
                'tgl_selesai' => $sewa->tgl_selesai?->format('Y-m-d'),
                'harga_disepakati' => (int) $sewa->harga_disepakati,
            ],
            'pengelola' => [
                'nama' => config('simkos.pengelola_nama'),
                'wa_number' => config('simkos.wa_number'),
            ],
        ]);
    }
}
