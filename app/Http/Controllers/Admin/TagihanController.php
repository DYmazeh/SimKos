<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tagihan;
use App\Services\TagihanGenerator;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class TagihanController extends Controller
{
    public function __construct(private TagihanGenerator $generator) {}

    public function index(Request $request): View
    {
        // Auto-mark tagihan yang sudah lewat tempo jadi 'terlambat' (idempotent)
        DB::table('tagihan')
            ->where('status', Tagihan::STATUS_BELUM_BAYAR)
            ->where('tgl_jatuh_tempo', '<', Carbon::today()->toDateString())
            ->update(['status' => Tagihan::STATUS_TERLAMBAT, 'updated_at' => now()]);

        $query = Tagihan::query()
            ->with(['sewa.penyewa', 'sewa.kamar']);

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($periode = $request->string('periode')->toString()) {
            // Format: YYYY-MM
            try {
                $startMonth = Carbon::createFromFormat('Y-m', $periode)->startOfMonth()->toDateString();
                $query->where('periode', $startMonth);
            } catch (\Exception) {
                // ignore invalid input
            }
        }

        $tagihan = $query->orderBy('tgl_jatuh_tempo')->paginate(20)->withQueryString();

        // Periode untuk dropdown filter (12 bulan terakhir)
        $periodeOptions = collect(range(0, 11))->map(
            fn ($i) => Carbon::now()->subMonths($i)->format('Y-m')
        );

        return view('admin.tagihan.index', compact('tagihan', 'periodeOptions'));
    }

    /**
     * Generate tagihan untuk periode tertentu.
     */
    public function generate(Request $request): RedirectResponse
    {
        $request->validate([
            'periode' => ['required', 'date_format:Y-m'],
        ]);

        $periode = Carbon::createFromFormat('Y-m', $request->input('periode'))->startOfMonth();
        $created = $this->generator->generateForPeriode($periode);

        return redirect()
            ->route('admin.tagihan.index', ['periode' => $periode->format('Y-m')])
            ->with('success', "{$created->count()} tagihan dibuat untuk periode {$periode->translatedFormat('F Y')}.");
    }

    public function show(Tagihan $tagihan): View
    {
        $tagihan->load(['sewa.penyewa', 'sewa.kamar', 'pembayaran.verifikator']);

        return view('admin.tagihan.show', compact('tagihan'));
    }
}
