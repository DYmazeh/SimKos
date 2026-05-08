<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Services\NotifikasiService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PembayaranController extends Controller
{
    /**
     * Antrian verifikasi: list pembayaran status pending.
     */
    public function index(Request $request): View
    {
        $query = Pembayaran::query()
            ->with(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar']);

        $status = $request->string('status')->toString() ?: 'pending';
        $query->where('status_verifikasi', $status);

        $pembayaran = $query->latest()->paginate(20)->withQueryString();

        return view('admin.pembayaran.index', compact('pembayaran', 'status'));
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
