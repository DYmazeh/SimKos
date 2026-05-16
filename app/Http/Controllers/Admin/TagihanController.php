<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Penyewa;
use App\Models\Tagihan;
use App\Services\TagihanGenerator;
use App\Services\WhatsappReminderLink;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TagihanController extends Controller
{
    public function __construct(private TagihanGenerator $generator) {}

    /**
     * Index per-penyewa: 1 row per penyewa dengan summary tagihan aktif + status terburuk.
     */
    public function index(Request $request): Response
    {
        // Auto-mark tagihan terlambat
        DB::table('tagihan')
            ->where('status', Tagihan::STATUS_BELUM_BAYAR)
            ->where('tgl_jatuh_tempo', '<', Carbon::today()->toDateString())
            ->update(['status' => Tagihan::STATUS_TERLAMBAT, 'updated_at' => now()]);

        $search = $request->string('q')->toString();

        $query = Penyewa::query()
            ->whereHas('sewa.tagihan')
            ->with(['sewaAktif.kamar']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nama_lengkap) LIKE ?', ['%'.strtolower($search).'%'])
                  ->orWhereHas('sewa.kamar', fn ($k) => $k->whereRaw('LOWER(nomor_kamar) LIKE ?', ['%'.strtolower($search).'%']));
            });
        }

        $paginator = $query->orderBy('nama_lengkap')->paginate(15)->withQueryString();

        $rows = collect($paginator->items())->map(function (Penyewa $p) {
            $tagihanList = Tagihan::query()
                ->whereHas('sewa', fn ($q) => $q->where('penyewa_id', $p->id))
                ->get();

            $belumLunasTagihan = $tagihanList->whereNotIn('status', [Tagihan::STATUS_LUNAS]);
            $totalBelumLunas = (int) $belumLunasTagihan->sum('jumlah');

            $statusAggregate = 'lunas';
            if ($tagihanList->where('status', Tagihan::STATUS_TERLAMBAT)->count() > 0
                || $tagihanList->where('status', Tagihan::STATUS_BELUM_BAYAR)->count() > 0) {
                $statusAggregate = 'belum_bayar';
            } elseif ($tagihanList->where('status', Tagihan::STATUS_MENUNGGU_VERIFIKASI)->count() > 0) {
                $statusAggregate = 'menunggu_verifikasi';
            }

            // WA link pakai tagihan paling urgent (yg belum lunas pertama)
            $waLink = null;
            $firstUnpaid = $belumLunasTagihan->sortBy('tgl_jatuh_tempo')->first();
            if ($firstUnpaid) {
                $waLink = WhatsappReminderLink::make($p, $firstUnpaid);
            }

            return [
                'id' => $p->id,
                'nama_lengkap' => $p->nama_lengkap,
                'kamar_nomor' => $p->sewaAktif?->kamar?->nomor_kamar ?? '—',
                'total_tagihan' => $tagihanList->count(),
                'total_belum_lunas' => $totalBelumLunas,
                'status' => $statusAggregate,
                'wa_link' => $waLink,
            ];
        });

        // KPI global (semua periode)
        $kpi = [
            'total_penyewa' => Penyewa::whereHas('sewa.tagihan')->count(),
            'lunas_pembayaran' => Pembayaran::where('status_verifikasi', Pembayaran::STATUS_APPROVED)->count(),
            'belum_bayar_tagihan' => Tagihan::whereIn('status', [Tagihan::STATUS_BELUM_BAYAR, Tagihan::STATUS_TERLAMBAT])->count(),
        ];

        return Inertia::render('Admin/Tagihan/Index', [
            'penyewaRows' => $rows,
            'kpi' => $kpi,
            'filters' => [
                'q' => $search,
            ],
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
            ],
        ]);
    }

    /**
     * Detail tagihan per penyewa — list semua tagihan untuk penyewa tertentu.
     */
    public function penyewa(Penyewa $penyewa): Response
    {
        $tagihan = Tagihan::query()
            ->whereHas('sewa', fn ($q) => $q->where('penyewa_id', $penyewa->id))
            ->with(['sewa.kamar', 'pembayaran' => fn ($q) => $q->latest()])
            ->orderBy('periode', 'desc')
            ->get()
            ->map(fn (Tagihan $t) => [
                'id' => $t->id,
                'periode' => $t->periode->format('Y-m-d'),
                'kamar_nomor' => $t->sewa->kamar->nomor_kamar ?? '—',
                'jumlah' => (int) $t->jumlah,
                'tgl_jatuh_tempo' => $t->tgl_jatuh_tempo->format('Y-m-d'),
                'status' => $t->status,
                'pembayaran_count' => $t->pembayaran->count(),
                'wa_link' => WhatsappReminderLink::make($penyewa, $t),
            ]);

        return Inertia::render('Admin/Tagihan/Penyewa', [
            'penyewa' => [
                'id' => $penyewa->id,
                'nama_lengkap' => $penyewa->nama_lengkap,
                'no_hp' => $penyewa->no_hp,
                'kamar_aktif' => $penyewa->sewaAktif?->kamar?->nomor_kamar,
            ],
            'tagihan' => $tagihan,
        ]);
    }

    public function generate(Request $request): RedirectResponse
    {
        $request->validate(['periode' => ['required', 'date_format:Y-m']]);

        $periode = Carbon::createFromFormat('Y-m', $request->input('periode'))->startOfMonth();
        $created = $this->generator->generateForPeriode($periode);

        return redirect()
            ->route('admin.tagihan.index', ['periode' => $periode->format('Y-m')])
            ->with('success', "{$created->count()} tagihan dibuat untuk periode {$periode->translatedFormat('F Y')}.");
    }

    public function show(Tagihan $tagihan): Response
    {
        $tagihan->load(['sewa.penyewa', 'sewa.kamar', 'pembayaran.verifikator']);

        return Inertia::render('Admin/Tagihan/Show', [
            'tagihan' => [
                'id' => $tagihan->id,
                'penyewa_nama' => $tagihan->sewa->penyewa->nama_lengkap,
                'penyewa_id' => $tagihan->sewa->penyewa->id,
                'kamar_nomor' => $tagihan->sewa->kamar->nomor_kamar,
                'jumlah' => (int) $tagihan->jumlah,
                'periode' => $tagihan->periode->format('Y-m-d'),
                'tgl_jatuh_tempo' => $tagihan->tgl_jatuh_tempo->format('Y-m-d'),
                'status' => $tagihan->status,
                'pembayaran' => $tagihan->pembayaran->map(fn (Pembayaran $p) => [
                    'id' => $p->id,
                    'tgl_bayar' => $p->tgl_bayar->format('Y-m-d'),
                    'jumlah_bayar' => (int) $p->jumlah_bayar,
                    'metode' => $p->metode,
                    'bukti_transfer_url' => $p->bukti_transfer_url,
                    'status_verifikasi' => $p->status_verifikasi,
                    'verified_at' => $p->verified_at?->format('Y-m-d H:i'),
                    'verifikator_nama' => $p->verifikator?->name,
                    'catatan' => $p->catatan,
                ])->values(),
            ],
        ]);
    }
}
