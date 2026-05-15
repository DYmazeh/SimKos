<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
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

    public function index(Request $request): Response
    {
        // Auto-mark tagihan terlambat
        DB::table('tagihan')
            ->where('status', Tagihan::STATUS_BELUM_BAYAR)
            ->where('tgl_jatuh_tempo', '<', Carbon::today()->toDateString())
            ->update(['status' => Tagihan::STATUS_TERLAMBAT, 'updated_at' => now()]);

        $query = Tagihan::query()->with(['sewa.penyewa', 'sewa.kamar']);

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        $periode = $request->string('periode')->toString() ?: Carbon::now()->format('Y-m');
        try {
            $startMonth = Carbon::createFromFormat('Y-m', $periode)->startOfMonth()->toDateString();
            $query->where('periode', $startMonth);
        } catch (\Exception) {
            $periode = Carbon::now()->format('Y-m');
        }

        $paginator = $query->orderBy('tgl_jatuh_tempo')->paginate(20)->withQueryString();

        // KPI counts untuk periode
        $startOfMonth = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        $kpiQuery = Tagihan::query()->where('periode', $startOfMonth->toDateString());
        $kpi = [
            'total' => $kpiQuery->count(),
            'lunas' => (clone $kpiQuery)->where('status', Tagihan::STATUS_LUNAS)->count(),
            'belum_bayar' => (clone $kpiQuery)->whereIn('status', [Tagihan::STATUS_BELUM_BAYAR, Tagihan::STATUS_TERLAMBAT])->count(),
        ];

        $tagihan = collect($paginator->items())->map(fn ($t) => [
            'id' => $t->id,
            'penyewa_nama' => $t->sewa->penyewa->nama_lengkap ?? '—',
            'kamar_nomor' => $t->sewa->kamar->nomor_kamar ?? '—',
            'jumlah' => (int) $t->jumlah,
            'periode' => $t->periode->format('Y-m-d'),
            'tgl_jatuh_tempo' => $t->tgl_jatuh_tempo->format('Y-m-d'),
            'status' => $t->status,
            'wa_link' => WhatsappReminderLink::make($t->sewa->penyewa, $t),
        ]);

        $periodeOptions = collect(range(0, 11))->map(
            fn ($i) => Carbon::now()->subMonths($i)->format('Y-m')
        )->values();

        return Inertia::render('Admin/Tagihan/Index', [
            'tagihan' => $tagihan,
            'kpi' => $kpi,
            'filters' => [
                'status' => $request->string('status')->toString(),
                'periode' => $periode,
            ],
            'periodeOptions' => $periodeOptions,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
            ],
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
