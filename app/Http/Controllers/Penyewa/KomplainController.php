<?php

namespace App\Http\Controllers\Penyewa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Penyewa\StoreKomplainRequest;
use App\Models\Komplain;
use App\Services\NotifikasiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class KomplainController extends Controller
{
    /**
     * Daftar komplen milik penyewa yang sedang login.
     */
    public function index(): Response
    {
        $penyewa = Auth::user()->penyewa;

        $items = [];
        if ($penyewa) {
            $items = $penyewa->komplain()
                ->with(['kamar', 'foto'])
                ->get()
                ->map(fn ($k) => [
                    'id' => $k->id,
                    'judul' => $k->judul,
                    'deskripsi' => $k->deskripsi,
                    'status' => $k->status,
                    'kamar_nomor' => $k->kamar?->nomor_kamar ?? '-',
                    'created_at' => $k->created_at->toDateString(),
                    'resolved_at' => optional($k->resolved_at)->toDateString(),
                    'foto' => $k->foto->map(fn ($f) => [
                        'id' => $f->id,
                        'url' => Storage::disk(config('filesystems.default'))->url($f->url),
                    ])->values(),
                ])
                ->all();
        }

        return Inertia::render('Penyewa/Komplen/Index', [
            'komplen' => $items,
        ]);
    }

    /**
     * Form submit komplen baru.
     */
    public function create(): Response
    {
        $penyewa = Auth::user()->penyewa;
        $kamar = $penyewa?->sewaAktif?->kamar;

        if (! $penyewa || ! $kamar) {
            throw new AccessDeniedHttpException('Anda belum memiliki sewa kamar aktif. Hubungi pengelola.');
        }

        return Inertia::render('Penyewa/Komplen/Create', [
            'kamar' => [
                'id' => $kamar->id,
                'nomor_kamar' => $kamar->nomor_kamar,
                'tipe' => $kamar->tipe,
            ],
        ]);
    }

    /**
     * Simpan komplen + notif admin.
     */
    public function store(StoreKomplainRequest $request): RedirectResponse
    {
        $penyewa = Auth::user()->penyewa;
        $kamar = $penyewa?->sewaAktif?->kamar;

        if (! $penyewa || ! $kamar) {
            throw new AccessDeniedHttpException('Tidak ada sewa kamar aktif.');
        }

        $komplain = Komplain::create([
            'kamar_id' => $kamar->id,
            'penyewa_id' => $penyewa->id,
            'judul' => $request->input('judul'),
            'deskripsi' => $request->input('deskripsi'),
            'status' => Komplain::STATUS_MENUNGGU,
        ]);

        // Upload foto bukti (max 3 per StoreKomplainRequest validation)
        if ($request->hasFile('foto')) {
            foreach ($request->file('foto') as $file) {
                $path = $file->store('komplain/'.$komplain->id, config('filesystems.default'));
                $komplain->foto()->create(['url' => $path]);
            }
        }

        NotifikasiService::notifyKomplenBaru(
            $penyewa->nama_lengkap,
            $kamar->nomor_kamar,
            $komplain->judul,
        );

        return redirect()
            ->route('penyewa.komplen.index')
            ->with('success', 'Komplen terkirim. Pengelola akan segera menindaklanjuti.');
    }
}
