<?php

namespace App\Http\Controllers\Penyewa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Penyewa\StoreBuktiTransferRequest;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Services\BuktiTransferUploader;
use App\Services\NotifikasiService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class PembayaranController extends Controller
{
    public function __construct(private BuktiTransferUploader $uploader) {}

    /**
     * Form upload bukti transfer untuk satu tagihan.
     */
    public function create(Tagihan $tagihan): Response
    {
        $this->ensureOwned($tagihan);
        $tagihan->load('sewa.kamar');

        return Inertia::render('Penyewa/Pembayaran/Create', [
            'tagihan' => [
                'id' => $tagihan->id,
                'periode' => $tagihan->periode->toDateString(),
                'tgl_jatuh_tempo' => $tagihan->tgl_jatuh_tempo->toDateString(),
                'jumlah' => $tagihan->jumlah,
                'status' => $tagihan->status,
                'kamar_nomor' => $tagihan->sewa->kamar->nomor_kamar ?? '-',
                'tipe' => $tagihan->sewa->kamar->tipe ?? '-',
            ],
            'rekening' => [
                'bank' => config('simkos.rekening_bank'),
                'nomor' => config('simkos.rekening_nomor'),
                'nama' => config('simkos.rekening_nama'),
            ],
        ]);
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

        // FR-029: Notifikasi ke admin bahwa ada bukti bayar baru
        $tagihan->load('sewa.penyewa', 'sewa.kamar');
        $penyewa = $tagihan->sewa?->penyewa;
        if ($penyewa) {
            NotifikasiService::notifyBuktiUploaded(
                $penyewa->nama_lengkap,
                $tagihan->sewa->kamar->nomor_kamar ?? '-',
                $tagihan->id
            );
        }

        return redirect()
            ->route('penyewa.dashboard')
            ->with('success', 'Bukti transfer terkirim. Tunggu verifikasi admin.');
    }

    /**
     * FR-030: Riwayat semua pembayaran penyewa
     */
    public function riwayat(): Response
    {
        $user = Auth::user();
        $penyewa = $user->penyewa;

        $rows = [];
        $pagination = ['current_page' => 1, 'last_page' => 1, 'total' => 0, 'from' => 0, 'to' => 0];

        if ($penyewa) {
            $paginated = Pembayaran::query()
                ->whereHas('tagihan.sewa', fn ($q) => $q->where('penyewa_id', $penyewa->id))
                ->with(['tagihan.sewa.kamar'])
                ->latest('tgl_bayar')
                ->paginate(20);

            $rows = collect($paginated->items())->map(fn ($p) => [
                'id' => $p->id,
                'tgl_bayar' => optional($p->tgl_bayar)->toDateString(),
                'periode' => optional($p->tagihan?->periode)->toDateString(),
                'kamar_nomor' => $p->tagihan?->sewa?->kamar?->nomor_kamar ?? '-',
                'jumlah_bayar' => $p->jumlah_bayar,
                'metode' => $p->metode,
                'status_verifikasi' => $p->status_verifikasi,
                'catatan' => $p->catatan,
            ])->all();

            $pagination = [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
                'from' => $paginated->firstItem() ?? 0,
                'to' => $paginated->lastItem() ?? 0,
            ];
        }

        return Inertia::render('Penyewa/Riwayat', [
            'pembayaran' => $rows,
            'pagination' => $pagination,
        ]);
    }

    /**
     * Download kuitansi PDF untuk pembayaran lunas milik penyewa login.
     */
    public function kuitansi(Pembayaran $pembayaran): HttpResponse
    {
        $pembayaran->load(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar']);

        $penyewa = Auth::user()->penyewa;
        if (! $penyewa || $pembayaran->tagihan?->sewa?->penyewa_id !== $penyewa->id) {
            throw new AccessDeniedHttpException('Bukan kuitansi milik Anda.');
        }

        if ($pembayaran->status_verifikasi !== Pembayaran::STATUS_APPROVED) {
            throw new AccessDeniedHttpException('Kuitansi hanya tersedia untuk pembayaran yang sudah dikonfirmasi.');
        }

        $pdf = Pdf::loadView('penyewa.kuitansi', [
            'pembayaran' => $pembayaran,
            'kos' => [
                'nama' => config('simkos.nama'),
                'alamat' => config('simkos.alamat'),
                'pengelola_nama' => config('simkos.pengelola_nama'),
            ],
        ]);

        $filename = 'kuitansi-'.$pembayaran->id.'-'.$pembayaran->tgl_bayar->format('Y-m').'.pdf';
        return $pdf->download($filename);
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
