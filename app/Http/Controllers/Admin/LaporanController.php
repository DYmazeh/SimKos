<?php

namespace App\Http\Controllers\Admin;

use App\Exports\LaporanKeuanganExport;
use App\Exports\LaporanPenghuniExport;
use App\Http\Controllers\Controller;
use App\Models\Kamar;
use App\Models\Pembayaran;
use App\Models\Sewa;
use App\Models\Tagihan;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LaporanController extends Controller
{
    public function keuangan(Request $request): InertiaResponse
    {
        [$start, $end, $periode, $tahun, $mode] = $this->resolvePeriode($request);
        $data = $this->buildKeuangan($start, $end);

        // Chart pendapatan 12 bulan untuk tahun yang dipilih (selalu tahunan).
        $chart = [];
        for ($m = 1; $m <= 12; $m++) {
            $startM = Carbon::create($tahun, $m, 1)->startOfMonth();
            $endM = $startM->copy()->endOfMonth();
            $sum = (int) Pembayaran::query()
                ->where('status_verifikasi', Pembayaran::STATUS_APPROVED)
                ->whereBetween('tgl_bayar', [$startM->toDateString(), $endM->toDateString()])
                ->sum('jumlah_bayar');
            $chart[] = [
                'month' => $startM->translatedFormat('M'),
                'value' => $sum,
                'value_juta' => round($sum / 1_000_000, 1),
            ];
        }

        $bulanFromPeriode = $mode === 'tahunan'
            ? (string) Carbon::now()->month
            : (string) Carbon::createFromFormat('Y-m', $periode)->month;

        return Inertia::render('Admin/Laporan/Keuangan', [
            'kpi' => [
                'total_pendapatan' => (int) $data['totalPemasukan'],
                'kamar_terisi' => Kamar::where('status', Kamar::STATUS_TERISI)->count(),
                'total_kamar' => Kamar::count(),
                'tunggakan_count' => $data['piutang']->count(),
            ],
            'chart' => $chart,
            'pemasukan' => $data['pemasukan']->map(fn ($p) => [
                'id' => $p->id,
                'penyewa_nama' => $p->tagihan->sewa->penyewa->nama_lengkap ?? '—',
                'kamar_nomor' => $p->tagihan->sewa->kamar->nomor_kamar ?? '—',
                'jumlah_bayar' => (int) $p->jumlah_bayar,
                'tgl_bayar' => $p->tgl_bayar->format('Y-m-d'),
                'status' => $p->status_verifikasi,
            ])->values(),
            'filters' => [
                'mode' => $mode,
                'periode' => $periode,
                'tahun' => (string) $tahun,
                'bulan' => $bulanFromPeriode,
            ],
            'tahunOptions' => collect(range(2024, (int) Carbon::now()->format('Y') + 1))->map(fn ($y) => (string) $y)->values(),
        ]);
    }

    public function penghuni(Request $request): InertiaResponse
    {
        [$start, $end, $periode] = $this->resolvePeriode($request);
        $data = $this->buildPenghuni($start, $end);

        return Inertia::render('Admin/Laporan/Penghuni', [
            'penghuni' => $data['sewaPeriode']->map(fn ($s) => [
                'id' => $s->id,
                'penyewa_nama' => $s->penyewa->nama_lengkap,
                'no_hp' => $s->penyewa->no_hp,
                'kamar_nomor' => $s->kamar->nomor_kamar,
                'tgl_mulai' => $s->tgl_mulai->format('Y-m-d'),
                'tgl_selesai' => $s->tgl_selesai?->format('Y-m-d'),
                'status' => $s->status,
            ])->values(),
            'kpi' => [
                'aktif' => $data['totalAktifSekarang'],
                'selesai' => $data['totalSelesaiPeriode'],
            ],
            'filters' => ['periode' => $periode],
        ]);
    }

    public function exportPdf(Request $request, string $type): Response
    {
        [$start, $end, $periode, , $mode] = $this->resolvePeriode($request);

        if ($type === 'keuangan') {
            $data = array_merge($this->buildKeuangan($start, $end), ['periode' => $periode, 'mode' => $mode]);
            $pdf = Pdf::loadView('admin.laporan.pdf.keuangan', $data)->setPaper('A4', 'portrait');
            $filename = 'laporan-keuangan-'.$periode.'.pdf';
        } elseif ($type === 'penghuni') {
            $data = array_merge($this->buildPenghuni($start, $end), ['periode' => $periode, 'mode' => $mode]);
            $pdf = Pdf::loadView('admin.laporan.pdf.penghuni', $data)->setPaper('A4', 'portrait');
            $filename = 'rekap-penghuni-'.$periode.'.pdf';
        } else {
            abort(404);
        }

        return $pdf->download($filename);
    }

    public function exportExcel(Request $request, string $type): BinaryFileResponse
    {
        [$start, $end, $periode] = $this->resolvePeriode($request);

        if ($type === 'keuangan') {
            return Excel::download(
                new LaporanKeuanganExport($start, $end, $periode),
                'laporan-keuangan-'.$periode.'.xlsx'
            );
        } elseif ($type === 'penghuni') {
            return Excel::download(
                new LaporanPenghuniExport($start, $end, $periode),
                'rekap-penghuni-'.$periode.'.xlsx'
            );
        }

        abort(404);
    }

    /**
     * @return array{0: Carbon, 1: Carbon, 2: string, 3: int, 4: 'bulanan'|'tahunan'}
     */
    private function resolvePeriode(Request $request): array
    {
        $mode = $request->input('mode') === 'tahunan' ? 'tahunan' : 'bulanan';
        $tahun = $request->integer('tahun') ?: (int) now()->format('Y');

        if ($mode === 'tahunan') {
            $start = Carbon::create($tahun, 1, 1)->startOfDay();
            $end = Carbon::create($tahun, 12, 31)->endOfDay();
            $periode = (string) $tahun; // filename: laporan-keuangan-2026.pdf
            return [$start, $end, $periode, $tahun, $mode];
        }

        $bulan = $request->integer('bulan');
        if ($bulan && $tahun) {
            $periode = sprintf('%04d-%02d', $tahun, $bulan);
        } else {
            $periode = $request->input('periode', now()->format('Y-m'));
        }

        try {
            $start = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        } catch (\Exception) {
            $periode = now()->format('Y-m');
            $start = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        }
        $end = $start->copy()->endOfMonth();

        return [$start, $end, $periode, (int) $start->format('Y'), $mode];
    }

    private function buildKeuangan(Carbon $start, Carbon $end): array
    {
        $pemasukanQuery = Pembayaran::query()
            ->with(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar'])
            ->where('status_verifikasi', Pembayaran::STATUS_APPROVED)
            ->whereBetween('tgl_bayar', [$start->toDateString(), $end->toDateString()])
            ->orderBy('tgl_bayar');

        $pemasukan = $pemasukanQuery->get();
        $totalPemasukan = $pemasukan->sum('jumlah_bayar');

        $piutang = Tagihan::query()
            ->with(['sewa.penyewa', 'sewa.kamar'])
            ->whereBetween('periode', [$start->toDateString(), $end->toDateString()])
            ->whereIn('status', [
                Tagihan::STATUS_BELUM_BAYAR,
                Tagihan::STATUS_TERLAMBAT,
                Tagihan::STATUS_MENUNGGU_VERIFIKASI,
            ])
            ->orderBy('tgl_jatuh_tempo')
            ->get();
        $totalPiutang = $piutang->sum('jumlah');

        return compact('pemasukan', 'totalPemasukan', 'piutang', 'totalPiutang');
    }

    private function buildPenghuni(Carbon $start, Carbon $end): array
    {
        $sewaPeriode = Sewa::query()
            ->with(['penyewa', 'kamar'])
            ->where('tgl_mulai', '<=', $end->toDateString())
            ->where(function ($q) use ($start) {
                $q->whereNull('tgl_selesai')->orWhere('tgl_selesai', '>=', $start->toDateString());
            })
            ->orderBy('kamar_id')
            ->get();

        $totalAktifSekarang = $sewaPeriode->where('status', Sewa::STATUS_AKTIF)->count();
        $totalSelesaiPeriode = $sewaPeriode->where('status', Sewa::STATUS_SELESAI)->count();

        return compact('sewaPeriode', 'totalAktifSekarang', 'totalSelesaiPeriode');
    }
}
