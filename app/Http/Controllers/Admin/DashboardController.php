<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use App\Models\Pembayaran;
use App\Models\Sewa;
use App\Models\Tagihan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(): View
    {
        // Auto-mark tagihan yang sudah lewat jatuh tempo (idempotent)
        DB::table('tagihan')
            ->where('status', Tagihan::STATUS_BELUM_BAYAR)
            ->where('tgl_jatuh_tempo', '<', Carbon::today()->toDateString())
            ->update(['status' => Tagihan::STATUS_TERLAMBAT, 'updated_at' => now()]);

        $now = Carbon::now();
        $awalBulan = $now->copy()->startOfMonth()->toDateString();
        $akhirBulan = $now->copy()->endOfMonth()->toDateString();
        $reminderHorizon = $now->copy()->addDays(config('simkos.reminder_days', 7))->toDateString();

        $stats = [
            'total_kamar' => Kamar::count(),
            'kamar_terisi' => Kamar::where('status', Kamar::STATUS_TERISI)->count(),
            'kamar_tersedia' => Kamar::where('status', Kamar::STATUS_TERSEDIA)->count(),
            'kamar_maintenance' => Kamar::where('status', Kamar::STATUS_MAINTENANCE)->count(),
            'sewa_aktif' => Sewa::where('status', Sewa::STATUS_AKTIF)->count(),
            'tagihan_jatuh_tempo_horizon' => Tagihan::query()
                ->whereIn('status', [Tagihan::STATUS_BELUM_BAYAR, Tagihan::STATUS_TERLAMBAT])
                ->where('tgl_jatuh_tempo', '<=', $reminderHorizon)
                ->count(),
            'menunggu_verifikasi' => Pembayaran::where('status_verifikasi', Pembayaran::STATUS_PENDING)->count(),
            'pemasukan_bulan_ini' => Pembayaran::query()
                ->where('status_verifikasi', Pembayaran::STATUS_APPROVED)
                ->whereBetween('tgl_bayar', [$awalBulan, $akhirBulan])
                ->sum('jumlah_bayar'),
        ];

        // List tagihan untuk widget reminder
        $reminderList = Tagihan::query()
            ->with(['sewa.penyewa', 'sewa.kamar'])
            ->whereIn('status', [Tagihan::STATUS_BELUM_BAYAR, Tagihan::STATUS_TERLAMBAT])
            ->where('tgl_jatuh_tempo', '<=', $reminderHorizon)
            ->orderBy('tgl_jatuh_tempo')
            ->limit(20)
            ->get();

        // Pembayaran menunggu verifikasi (5 terbaru)
        $verifikasiList = Pembayaran::query()
            ->with(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar'])
            ->where('status_verifikasi', Pembayaran::STATUS_PENDING)
            ->latest()
            ->limit(5)
            ->get();

        // FR-047: Kamar yang akan kosong dalam 30 hari
        $kamarAkanKosong = Sewa::query()
            ->where('status', Sewa::STATUS_AKTIF)
            ->whereNotNull('tgl_selesai')
            ->where('tgl_selesai', '<=', $now->copy()->addDays(30)->toDateString())
            ->with(['penyewa', 'kamar'])
            ->orderBy('tgl_selesai')
            ->get();

        // FR-043: Data pendapatan 12 bulan terakhir untuk chart
        $chartData = $this->buildChartData();

        return view('admin.dashboard', compact(
            'stats', 'reminderList', 'verifikasiList', 'kamarAkanKosong', 'chartData'
        ));
    }

    /**
     * FR-043: Pendapatan bulanan 12 bulan terakhir
     */
    private function buildChartData(): array
    {
        $labels = [];
        $values = [];

        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $labels[] = $month->translatedFormat('M Y');

            $values[] = (int) Pembayaran::query()
                ->where('status_verifikasi', Pembayaran::STATUS_APPROVED)
                ->whereBetween('tgl_bayar', [
                    $month->copy()->startOfMonth()->toDateString(),
                    $month->copy()->endOfMonth()->toDateString(),
                ])
                ->sum('jumlah_bayar');
        }

        return compact('labels', 'values');
    }
}
