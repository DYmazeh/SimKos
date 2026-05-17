<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreKamarRequest;
use App\Http\Requests\Admin\UpdateKamarRequest;
use App\Models\FotoKamar;
use App\Models\Kamar;
use App\Services\ImageOptimizer;
use App\Services\StorageUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KamarController extends Controller
{
    public function __construct(private ImageOptimizer $optimizer) {}

    public function index(Request $request): Response
    {
        // Auto-sync kamar.status berdasarkan sewa aktif (idempotent, defensive).
        Kamar::query()
            ->where('status', Kamar::STATUS_TERSEDIA)
            ->whereHas('sewaAktif')
            ->update(['status' => Kamar::STATUS_TERISI]);
        Kamar::query()
            ->where('status', Kamar::STATUS_TERISI)
            ->whereDoesntHave('sewaAktif')
            ->update(['status' => Kamar::STATUS_TERSEDIA]);

        $query = Kamar::query()
            ->with([
                'foto' => fn ($q) => $q->orderBy('urutan'),
                'sewaAktif.penyewa:id,nama_lengkap',
            ])
            ->withCount(['komplain as komplen_aktif_count' => fn ($q) => $q->whereNot('status', 'selesai')]);

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        if ($tipe = $request->string('tipe')->toString()) {
            $query->where('tipe', $tipe);
        }
        if ($search = $request->string('q')->toString()) {
            $query->whereRaw('LOWER(nomor_kamar) LIKE ?', ['%'.strtolower($search).'%']);
        }

        $paginated = $query->orderBy('nomor_kamar')->paginate(24)->withQueryString();

        return Inertia::render('Admin/Kamar/Index', [
            'kamar' => collect($paginated->items())->map(fn ($k) => $this->mapKamar($k))->all(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem() ?? 0,
                'to' => $paginated->lastItem() ?? 0,
            ],
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
                'tipe' => $request->string('tipe')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Kamar/Form', [
            'mode' => 'create',
            'kamar' => null,
        ]);
    }

    public function store(StoreKamarRequest $request): RedirectResponse
    {
        $kamar = Kamar::create($request->safe()->except('foto'));

        // Upload foto (kalau ada) — sekaligus saat create supaya tidak perlu redirect ke edit.
        // Foto di-optimize: resize max 1920px + convert ke WebP (~70% lebih kecil dari JPEG).
        if ($request->hasFile('foto')) {
            $files = $request->file('foto');
            $files = is_array($files) ? $files : [$files];
            foreach (array_slice($files, 0, 5) as $i => $file) {
                $path = $this->optimizer->optimizeAndStore($file, 'kamar/'.$kamar->id);
                $kamar->foto()->create(['url' => $path, 'urutan' => $i]);
            }
        }

        return redirect()
            ->route('admin.kamar.show', $kamar)
            ->with('success', 'Kamar berhasil ditambahkan.');
    }

    public function show(Kamar $kamar): Response
    {
        $kamar->load([
            'foto',
            'sewa' => function ($q) {
                $q->with(['penyewa', 'tagihan'])->orderBy('tgl_mulai', 'desc');
            },
            'komplain' => function ($q) {
                $q->with(['penyewa', 'foto']);
            },
        ]);

        return Inertia::render('Admin/Kamar/Show', [
            'kamar' => array_merge($this->mapKamar($kamar), [
                'peraturan' => $kamar->peraturan,
                'deposit' => (int) $kamar->deposit,
                'min_sewa_bulan' => (int) $kamar->min_sewa_bulan,
            ]),
            'riwayatSewa' => $kamar->sewa->map(fn ($s) => [
                'id' => $s->id,
                'penyewa_nama' => $s->penyewa->nama_lengkap ?? '—',
                'periode' => $s->tgl_mulai->translatedFormat('d M Y').' — '.($s->tgl_selesai ? $s->tgl_selesai->translatedFormat('d M Y') : 'Sekarang'),
                'status' => $s->status,
                'jumlah_tagihan' => $s->tagihan->count(),
            ])->values(),
            'komplenList' => $kamar->komplain->map(fn ($k) => [
                'id' => $k->id,
                'penyewa_nama' => $k->penyewa?->nama_lengkap ?? '—',
                'judul' => $k->judul,
                'deskripsi' => $k->deskripsi,
                'status' => $k->status,
                'created_at' => $k->created_at->format('Y-m-d'),
                'resolved_at' => optional($k->resolved_at)->format('Y-m-d'),
                'foto' => $k->foto->map(fn ($f) => [
                    'id' => $f->id,
                    'url' => StorageUrl::for($f->url),
                ])->values(),
            ])->values(),
        ]);
    }

    public function edit(Kamar $kamar): Response
    {
        $kamar->load('foto');

        return Inertia::render('Admin/Kamar/Form', [
            'mode' => 'edit',
            'kamar' => $this->mapKamar($kamar),
        ]);
    }

    public function update(UpdateKamarRequest $request, Kamar $kamar): RedirectResponse
    {
        $kamar->update($request->validated());

        return redirect()
            ->route('admin.kamar.show', $kamar)
            ->with('success', "Kamar {$kamar->nomor_kamar} berhasil diperbarui.");
    }

    public function destroy(Kamar $kamar): RedirectResponse
    {
        if ($kamar->status !== Kamar::STATUS_TERSEDIA || $kamar->sewaAktif()->exists()) {
            return redirect()
                ->route('admin.kamar.index')
                ->withErrors(['delete' => "Kamar {$kamar->nomor_kamar} tidak bisa dihapus — hanya kamar berstatus kosong yang dapat dihapus."]);
        }

        $kamar->delete();

        return redirect()
            ->route('admin.kamar.index')
            ->with('success', "Kamar {$kamar->nomor_kamar} dihapus.");
    }

    public function uploadFoto(Request $request, Kamar $kamar): RedirectResponse
    {
        if ($kamar->foto()->count() >= 5) {
            return back()->withErrors(['foto' => 'Maksimal 5 foto per kamar.']);
        }

        $request->validate([
            'foto' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'foto.max' => 'Ukuran foto maksimal 5MB.',
        ]);

        $path = $this->optimizer->optimizeAndStore($request->file('foto'), 'kamar/'.$kamar->id);

        $kamar->foto()->create([
            'url' => $path,
            'urutan' => $kamar->foto()->count(),
        ]);

        return back()->with('success', 'Foto berhasil diunggah.');
    }

    public function deleteFoto(Kamar $kamar, FotoKamar $fotoKamar): RedirectResponse
    {
        if ($fotoKamar->kamar_id !== $kamar->id) {
            abort(403);
        }

        $fotoKamar->delete();

        return back()->with('success', 'Foto dihapus.');
    }

    /**
     * Map Kamar model → array untuk Inertia props.
     */
    private function mapKamar(Kamar $k): array
    {
        $penghuni = null;
        if ($k->relationLoaded('sewaAktif') && $k->sewaAktif && $k->sewaAktif->penyewa) {
            $sewa = $k->sewaAktif;
            $sisaHari = $sewa->tgl_selesai
                ? max(0, (int) now()->startOfDay()->diffInDays($sewa->tgl_selesai->startOfDay(), false))
                : null;
            $penghuni = [
                'nama' => $sewa->penyewa->nama_lengkap,
                'tgl_selesai' => $sewa->tgl_selesai?->translatedFormat('d M Y'),
                'sisa_hari' => $sisaHari,
            ];
        }

        return [
            'id' => $k->id,
            'nomor_kamar' => $k->nomor_kamar,
            'tipe' => $k->tipe,
            'harga_bulanan' => (int) $k->harga_bulanan,
            'status' => $k->status,
            'deskripsi' => $k->deskripsi,
            'fasilitas' => $k->fasilitas ?? [],
            'luas_m2' => $k->luas_m2,
            'lantai' => $k->lantai,
            'foto' => $k->relationLoaded('foto')
                ? $k->foto->map(fn ($f) => [
                    'id' => $f->id,
                    'url' => StorageUrl::for($f->url),
                ])->values()
                : [],
            'komplen_aktif_count' => (int) ($k->komplen_aktif_count ?? 0),
            'penghuni' => $penghuni,
        ];
    }
}
