<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use App\Models\Pembayaran;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Services\WhatsappReminderLink;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        // Auto-mark tagihan yang sudah lewat jatuh tempo (idempotent)
        DB::table('tagihan')
            ->where('status', Tagihan::STATUS_BELUM_BAYAR)
            ->where('tgl_jatuh_tempo', '<', Carbon::today()->toDateString())
            ->update(['status' => Tagihan::STATUS_TERLAMBAT, 'updated_at' => now()]);

        $now = Carbon::now();
        $awalBulan = $now->copy()->startOfMonth()->toDateString();
        $akhirBulan = $now->copy()->endOfMonth()->toDateString();
        // H-3 horizon untuk dashboard (lebih ketat dari config reminder_days,
        // sesuai user requirement: tagihan muncul mendesak H-3 sebelum jatuh tempo)
        $reminderHorizon = $now->copy()->addDays(3)->toDateString();

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
            'pemasukan_bulan_ini' => (int) Pembayaran::query()
                ->where('status_verifikasi', Pembayaran::STATUS_APPROVED)
                ->whereBetween('tgl_bayar', [$awalBulan, $akhirBulan])
                ->sum('jumlah_bayar'),
        ];

        // Peringatan Jatuh Tempo: H-3 only, limit 5 most urgent
        $reminderList = Tagihan::query()
            ->with(['sewa.penyewa', 'sewa.kamar'])
            ->whereIn('status', [Tagihan::STATUS_BELUM_BAYAR, Tagihan::STATUS_TERLAMBAT])
            ->where('tgl_jatuh_tempo', '<=', $reminderHorizon)
            ->orderBy('tgl_jatuh_tempo')
            ->limit(5)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'penyewa_nama' => $t->sewa->penyewa->nama_lengkap,
                'kamar_nomor' => $t->sewa->kamar->nomor_kamar,
                'periode' => $t->periode->format('Y-m-d'),
                'jumlah' => (int) $t->jumlah,
                'tgl_jatuh_tempo' => $t->tgl_jatuh_tempo->format('Y-m-d'),
                'status' => $t->status,
                'wa_link' => WhatsappReminderLink::make($t->sewa->penyewa, $t),
            ]);

        $reminderTotalCount = Tagihan::query()
            ->whereIn('status', [Tagihan::STATUS_BELUM_BAYAR, Tagihan::STATUS_TERLAMBAT])
            ->where('tgl_jatuh_tempo', '<=', $reminderHorizon)
            ->count();

        // Pembayaran Terbaru: gabungan semua pembayaran (any status), 5-10 latest
        $pembayaranTerbaru = Pembayaran::query()
            ->with(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar'])
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'tagihan_id' => $p->tagihan_id,
                'penyewa_nama' => $p->tagihan?->sewa?->penyewa?->nama_lengkap ?? '-',
                'kamar_nomor' => $p->tagihan?->sewa?->kamar?->nomor_kamar ?? '-',
                'periode' => $p->tagihan?->periode?->format('Y-m-d'),
                'jumlah_bayar' => (int) $p->jumlah_bayar,
                'tgl_jatuh_tempo' => $p->tagihan?->tgl_jatuh_tempo?->format('Y-m-d'),
                'status_verifikasi' => $p->status_verifikasi,
                'tagihan_status' => $p->tagihan?->status,
            ]);

        $pembayaranPendingCount = Pembayaran::where('status_verifikasi', Pembayaran::STATUS_PENDING)->count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'reminderList' => $reminderList,
            'reminderTotalCount' => $reminderTotalCount,
            'pembayaranTerbaru' => $pembayaranTerbaru,
            'pembayaranPendingCount' => $pembayaranPendingCount,
        ]);
    }
}
