<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Services\NotifikasiService;
use App\Services\StorageUrl;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PembayaranController extends Controller
{
    /**
     * Antrian verifikasi: list pembayaran status pending.
     */
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString() ?: 'pending';
        $search = $request->string('q')->toString();

        $query = Pembayaran::query()
            ->with(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar'])
            ->where('status_verifikasi', $status);

        if ($search) {
            $query->whereHas('tagihan.sewa.penyewa',
                fn ($q) => $q->whereRaw('LOWER(nama_lengkap) LIKE ?', ['%'.strtolower($search).'%']));
        }

        $paginator = $query->latest()->paginate(20)->withQueryString();

        $kpi = [
            'pending' => Pembayaran::where('status_verifikasi', Pembayaran::STATUS_PENDING)->count(),
            'approved' => Pembayaran::where('status_verifikasi', Pembayaran::STATUS_APPROVED)->count(),
            'rejected' => Pembayaran::where('status_verifikasi', Pembayaran::STATUS_REJECTED)->count(),
        ];

        $pembayaran = collect($paginator->items())->map(fn (Pembayaran $p) => [
            'id' => $p->id,
            'tagihan_id' => $p->tagihan_id,
            'penyewa_nama' => $p->tagihan->sewa->penyewa->nama_lengkap ?? '—',
            'penyewa_id' => $p->tagihan->sewa->penyewa->id ?? null,
            'kamar_nomor' => $p->tagihan->sewa->kamar->nomor_kamar ?? '—',
            'periode' => $p->tagihan->periode->format('Y-m-d'),
            'jumlah_bayar' => (int) $p->jumlah_bayar,
            'tgl_bayar' => $p->created_at->format('Y-m-d H:i:s'),  // pakai created_at = tgl upload
            'metode' => $p->metode,
            'status_verifikasi' => $p->status_verifikasi,
            'bukti_transfer_url' => StorageUrl::for($p->bukti_transfer_url),
        ]);

        return Inertia::render('Admin/Pembayaran/Index', [
            'pembayaran' => $pembayaran,
            'kpi' => $kpi,
            'filters' => ['status' => $status, 'q' => $search],
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
     * Detail satu pembayaran untuk verifikasi (Konfirmasi Pembayaran > Detail).
     */
    public function show(Pembayaran $pembayaran): Response
    {
        $pembayaran->load(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar', 'verifikator']);
        $tagihan = $pembayaran->tagihan;
        $kamar = $tagihan?->sewa?->kamar;
        $penyewa = $tagihan?->sewa?->penyewa;

        return Inertia::render('Admin/Pembayaran/Show', [
            'pembayaran' => [
                'id' => $pembayaran->id,
                'kode_transaksi' => '#TRX-'.$pembayaran->created_at->format('Ymd').'-'.str_pad((string) $pembayaran->id, 3, '0', STR_PAD_LEFT),
                'penyewa_nama' => $penyewa?->nama_lengkap ?? '—',
                'kamar_nomor' => $kamar?->nomor_kamar ?? '—',
                'kamar_lantai' => $kamar?->lantai,
                'periode' => $tagihan?->periode?->format('Y-m-d'),
                'jumlah_bayar' => (int) $pembayaran->jumlah_bayar,
                'tgl_jatuh_tempo' => $tagihan?->tgl_jatuh_tempo?->format('Y-m-d'),
                'tgl_upload' => $pembayaran->created_at->format('Y-m-d H:i'),
                'metode' => $pembayaran->metode,
                'status_verifikasi' => $pembayaran->status_verifikasi,
                'bukti_transfer_url' => StorageUrl::for($pembayaran->bukti_transfer_url),
                'catatan' => $pembayaran->catatan,
                'verified_at' => $pembayaran->verified_at?->format('Y-m-d H:i'),
                'verifikator_nama' => $pembayaran->verifikator?->name,
            ],
        ]);
    }

    public function approve(Request $request, Pembayaran $pembayaran): RedirectResponse
    {
        if ($pembayaran->status_verifikasi !== Pembayaran::STATUS_PENDING) {
            return back()->withErrors(['verify' => 'Pembayaran ini sudah diverifikasi sebelumnya.']);
        }

        DB::transaction(function () use ($pembayaran, $request) {
            $pembayaran->update([
                'status_verifikasi' => Pembayaran::STATUS_APPROVED,
                'diverifikasi_oleh' => $request->user()->id,
                'verified_at' => now(),
            ]);

            $tagihan = $pembayaran->tagihan;
            // Total pembayaran approved untuk tagihan ini
            $totalApproved = $tagihan->pembayaran()
                ->where('status_verifikasi', Pembayaran::STATUS_APPROVED)
                ->sum('jumlah_bayar');

            if ($totalApproved >= $tagihan->jumlah) {
                $tagihan->update(['status' => Tagihan::STATUS_LUNAS]);
            }
        });

        // FR-035: Notifikasi ke penyewa
        $tagihan = $pembayaran->tagihan->load('sewa.penyewa', 'sewa.kamar');
        $penyewa = $tagihan->sewa?->penyewa;
        if ($penyewa?->user_id) {
            NotifikasiService::notifyPembayaranVerified(
                $penyewa->user_id,
                'approved',
                $tagihan->sewa->kamar->nomor_kamar ?? '-',
                Carbon::parse($tagihan->periode)->translatedFormat('F Y')
            );
        }

        return back()->with('success', 'Pembayaran disetujui & tagihan diperbarui.');
    }

    public function reject(Request $request, Pembayaran $pembayaran): RedirectResponse
    {
        $request->validate([
            'catatan' => ['required', 'string', 'max:500'],
        ], [
            'catatan.required' => 'Mohon isi alasan penolakan supaya penyewa tahu.',
        ]);

        if ($pembayaran->status_verifikasi !== Pembayaran::STATUS_PENDING) {
            return back()->withErrors(['verify' => 'Pembayaran ini sudah diverifikasi sebelumnya.']);
        }

        DB::transaction(function () use ($pembayaran, $request) {
            $pembayaran->update([
                'status_verifikasi' => Pembayaran::STATUS_REJECTED,
                'diverifikasi_oleh' => $request->user()->id,
                'verified_at' => now(),
                'catatan' => $request->input('catatan'),
            ]);

            // Balikkan status tagihan ke belum_bayar/terlambat
            $tagihan = $pembayaran->tagihan;
            $newStatus = Carbon::parse($tagihan->tgl_jatuh_tempo)->isPast()
                ? Tagihan::STATUS_TERLAMBAT
                : Tagihan::STATUS_BELUM_BAYAR;
            $tagihan->update(['status' => $newStatus]);
        });

        // FR-035: Notifikasi ke penyewa
        $tagihan = $pembayaran->tagihan->load('sewa.penyewa', 'sewa.kamar');
        $penyewa = $tagihan->sewa?->penyewa;
        if ($penyewa?->user_id) {
            NotifikasiService::notifyPembayaranVerified(
                $penyewa->user_id,
                'rejected',
                $tagihan->sewa->kamar->nomor_kamar ?? '-',
                Carbon::parse($tagihan->periode)->translatedFormat('F Y')
            );
        }

        return back()->with('success', 'Pembayaran ditolak. Penyewa diminta upload ulang.');
    }

    /**
     * FR-036: Download bukti pembayaran untuk arsip
     */
    public function download(Pembayaran $pembayaran): StreamedResponse
    {
        if (!$pembayaran->bukti_transfer_url) {
            abort(404, 'Bukti pembayaran tidak ditemukan.');
        }

        $disk = config('filesystems.default');

        return Storage::disk($disk)->download(
            $pembayaran->bukti_transfer_url,
            'bukti-bayar-' . $pembayaran->id . '.' . pathinfo($pembayaran->bukti_transfer_url, PATHINFO_EXTENSION)
        );
    }
}
