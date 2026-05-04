<?php

namespace App\Http\Controllers\Penyewa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Penyewa\StoreBuktiTransferRequest;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Services\BuktiTransferUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class PembayaranController extends Controller
{
    public function __construct(private BuktiTransferUploader $uploader) {}

    /**
     * Form upload bukti transfer untuk satu tagihan.
     */
    public function create(Tagihan $tagihan): View
    {
        $this->ensureOwned($tagihan);

        return view('penyewa.pembayaran.create', compact('tagihan'));
    }

    /**
     * Submit bukti transfer.
     */
    public function store(StoreBuktiTransferRequest $request, Tagihan $tagihan): RedirectResponse
    {
        $this->ensureOwned($tagihan);

        $url = $this->uploader->upload($request->file('bukti'), $tagihan->id);

        DB::transaction(function () use ($request, $tagihan, $url) {
            Pembayaran::create([
                'tagihan_id' => $tagihan->id,
                'tgl_bayar' => $request->input('tgl_bayar'),
                'jumlah_bayar' => $request->input('jumlah_bayar'),
                'metode' => $request->input('metode'),
                'bukti_transfer_url' => $url,
                'catatan' => $request->input('catatan'),
                'status_verifikasi' => Pembayaran::STATUS_PENDING,
            ]);

            // Update status tagihan jadi menunggu verifikasi (kalau sebelumnya belum lunas)
            if ($tagihan->status !== Tagihan::STATUS_LUNAS) {
                $tagihan->update(['status' => Tagihan::STATUS_MENUNGGU_VERIFIKASI]);
            }
        });

        return redirect()
            ->route('penyewa.dashboard')
            ->with('success', 'Bukti transfer terkirim. Tunggu verifikasi admin.');
    }

    /**
     * Pastikan tagihan ini memang milik penyewa yang sedang login.
     */
    private function ensureOwned(Tagihan $tagihan): void
    {
        $penyewa = Auth::user()->penyewa;
        if (! $penyewa || $tagihan->sewa->penyewa_id !== $penyewa->id) {
            throw new AccessDeniedHttpException('Tagihan ini bukan milik Anda.');
        }
    }
}
