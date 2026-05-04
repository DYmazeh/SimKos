<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Sewa;
use App\Models\Tagihan;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\View\View;

class LaporanController extends Controller
{
    /**
     * Laporan Keuangan: pemasukan & piutang per periode.
     */
    public function keuangan(Request $request): View
    {
        [$start, $end, $periode] = $this->resolvePeriode($request);
        $data = $this->buildKeuangan($start, $end);

        return view('admin.laporan.keuangan', array_merge($data, [
            'periode' => $periode,
        ]));
    }

    /**
     * Rekap Penghuni: list semua sewa aktif/selesai dalam periode.
     */
    public function penghuni(Request $request): View
    {
        [$start, $end, $periode] = $this->resolvePeriode($request);
        $data = $this->buildPenghuni($start, $end);

        return view('admin.laporan.penghuni', array_merge($data, [
            'periode' => $periode,
        ]));
    }

    /**
     * Export PDF — type: 'keuangan' atau 'penghuni'.
     */
    public function exportPdf(Request $request, string $type): Response
    {
        [$start, $end, $periode] = $this->resolvePeriode($request);

        if ($type === 'keuangan') {
            $data = array_merge($this->buildKeuangan($start, $end), ['periode' => $periode]);
            $pdf = Pdf::loadView('admin.laporan.pdf.keuangan', $data)->setPaper('A4', 'portrait');
            $filename = 'laporan-keuangan-'.$periode.'.pdf';
        } elseif ($type === 'penghuni') {
            $data = array_merge($this->buildPenghuni($start, $end), ['periode' => $periode]);
            $pdf = Pdf::loadView('admin.laporan.pdf.penghuni', $data)->setPaper('A4', 'portrait');
            $filename = 'rekap-penghuni-'.$periode.'.pdf';
        } else {
            abort(404);
        }

        return $pdf->download($filename);
    }

    /**
     * Resolve periode dari request — default bulan berjalan.
     *
     * @return array{0: Carbon, 1: Carbon, 2: string}
     */
    private function resolvePeriode(Request $request): array
    {
        $periode = $request->input('periode', now()->format('Y-m'));
        try {
            $start = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        } catch (\Exception) {
            $periode = now()->format('Y-m');
            $start = Carbon::createFromFormat('Y-m', $periode)->startOfMonth();
        }
        $end = $start->copy()->endOfMonth();

        return [$start, $end, $periode];
    }

    private function buildKeuangan(Carbon $start, Carbon $end): array
    {
        // Pemasukan: pembayaran approved dengan tgl_bayar dalam periode
        $pemasukanQuery = Pembayaran::query()
            ->with(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar'])
            ->where('status_verifikasi', Pembayaran::STATUS_APPROVED)
            ->whereBetween('tgl_bayar', [$start->toDateString(), $end->toDateString()])
            ->orderBy('tgl_bayar');

        $pemasukan = $pemasukanQuery->get();
        $totalPemasukan = $pemasukan->sum('jumlah_bayar');

        // Piutang: tagihan dengan periode = bulan terkait, status belum_bayar/terlambat/menunggu
        $piutang = Tagihan::query()
            ->with(['sewa.penyewa', 'sewa.kamar'])
            ->where('periode', $start->toDateString())
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
        // Sewa yang aktif di periode = (tgl_mulai <= end) AND (tgl_selesai null OR tgl_selesai >= start)
        $sewaPeriode = Sewa::query()
            ->with(['penyewa', 'kamar'])
            ->where('tgl_mulai', '<=', $end->toDateString())
            ->where(function ($q) use ($start) {
                $q->whereNull('tgl_selesai')
                    ->orWhere('tgl_selesai', '>=', $start->toDateString());
            })
            ->orderBy('kamar_id')
            ->get();

        $totalAktifSekarang = $sewaPeriode->where('status', Sewa::STATUS_AKTIF)->count();
        $totalSelesaiPeriode = $sewaPeriode->where('status', Sewa::STATUS_SELESAI)->count();

        return compact('sewaPeriode', 'totalAktifSekarang', 'totalSelesaiPeriode');
    }
}
