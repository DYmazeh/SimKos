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

        // Auto-sync kamar.status terhadap sewa aktif (idempotent, single source of truth).
        // Status 'maintenance' tidak disentuh — itu manual override admin.
        Kamar::query()
            ->where('status', Kamar::STATUS_TERSEDIA)
            ->whereHas('sewaAktif')
            ->update(['status' => Kamar::STATUS_TERISI]);
        Kamar::query()
            ->where('status', Kamar::STATUS_TERISI)
            ->whereDoesntHave('sewaAktif')
            ->update(['status' => Kamar::STATUS_TERSEDIA]);

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
                'penyewa_nama' => $t->sewa?->penyewa?->nama_lengkap ?? '-',
                'kamar_nomor' => $t->sewa?->kamar?->nomor_kamar ?? '-',
                'periode' => $t->periode->format('Y-m-d'),
                'jumlah' => (int) $t->jumlah,
                'tgl_jatuh_tempo' => $t->tgl_jatuh_tempo->format('Y-m-d'),
                'status' => $t->status,
                'wa_link' => $t->sewa?->penyewa
                    ? WhatsappReminderLink::make($t->sewa->penyewa, $t)
                    : null,
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

        // FR-047: Kamar akan kosong dalam 30 hari ke depan (sewa aktif yang tgl_selesai
        // jatuh di rentang today..today+30).
        $horizon30 = $now->copy()->addDays(30)->toDateString();
        $today = $now->toDateString();
        $kamarAkanKosong = Sewa::query()
            ->with(['kamar:id,nomor_kamar,tipe', 'penyewa:id,nama_lengkap'])
            ->where('status', Sewa::STATUS_AKTIF)
            ->whereNotNull('tgl_selesai')
            ->whereBetween('tgl_selesai', [$today, $horizon30])
            ->orderBy('tgl_selesai')
            ->limit(8)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'kamar_id' => $s->kamar?->id,
                'kamar_nomor' => $s->kamar?->nomor_kamar ?? '—',
                'tipe' => $s->kamar?->tipe ?? '',
                'penyewa_nama' => $s->penyewa?->nama_lengkap ?? '—',
                'tgl_selesai' => $s->tgl_selesai->format('Y-m-d'),
                'sisa_hari' => max(0, (int) $now->copy()->startOfDay()->diffInDays($s->tgl_selesai->startOfDay(), false)),
            ]);

        $kamarAkanKosongTotal = Sewa::query()
            ->where('status', Sewa::STATUS_AKTIF)
            ->whereNotNull('tgl_selesai')
            ->whereBetween('tgl_selesai', [$today, $horizon30])
            ->count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'reminderList' => $reminderList,
            'reminderTotalCount' => $reminderTotalCount,
            'pembayaranTerbaru' => $pembayaranTerbaru,
            'pembayaranPendingCount' => $pembayaranPendingCount,
            'kamarAkanKosong' => $kamarAkanKosong,
            'kamarAkanKosongTotal' => $kamarAkanKosongTotal,
        ]);
    }
}
