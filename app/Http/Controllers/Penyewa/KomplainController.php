<?php

namespace App\Http\Controllers\Penyewa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Penyewa\StoreKomplainRequest;
use App\Models\Komplain;
use App\Services\ImageOptimizer;
use App\Services\NotifikasiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class KomplainController extends Controller
{
    public function __construct(private ImageOptimizer $optimizer) {}

    /**
     * Daftar komplen milik penyewa yang sedang login.
     */
    public function index(): Response
    {
        $penyewa = Auth::user()->penyewa;

        $items = [];
        $pagination = ['current_page' => 1, 'last_page' => 1, 'total' => 0, 'from' => 0, 'to' => 0];

        if ($penyewa) {
            $paginated = $penyewa->komplain()
                ->with(['kamar', 'foto'])
                ->latest('created_at')
                ->paginate(20)
                ->withQueryString();

            $items = collect($paginated->items())->map(fn ($k) => [
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
            ])->all();

            $pagination = [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem() ?? 0,
                'to' => $paginated->lastItem() ?? 0,
            ];
        }

        return Inertia::render('Penyewa/Komplen/Index', [
            'komplen' => $items,
            'pagination' => $pagination,
        ]);
    }

    /**
     * Form submit komplen baru.
     */
    public function create(): Response
    {
        $this->authorize('create', Komplain::class);

        $kamar = Auth::user()->penyewa->sewaAktif->kamar;

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
        $this->authorize('create', Komplain::class);

        $penyewa = Auth::user()->penyewa;
        $kamar = $penyewa->sewaAktif->kamar;

        $komplain = Komplain::create([
            'kamar_id' => $kamar->id,
            'penyewa_id' => $penyewa->id,
            'judul' => $request->input('judul'),
            'deskripsi' => $request->input('deskripsi'),
            'status' => Komplain::STATUS_MENUNGGU,
        ]);

        // Upload foto bukti (max 3 per StoreKomplainRequest validation).
        // Foto di-optimize ke WebP supaya hemat storage.
        if ($request->hasFile('foto')) {
            foreach ($request->file('foto') as $file) {
                $path = $this->optimizer->optimizeAndStore($file, 'komplain/'.$komplain->id);
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
