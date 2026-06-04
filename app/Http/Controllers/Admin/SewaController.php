<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSewaRequest;
use App\Models\Kamar;
use App\Models\Penyewa;
use App\Models\Sewa;
use App\Services\AssignKamarService;
use Carbon\Carbon;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SewaController extends Controller
{
    public function __construct(private AssignKamarService $service) {}

    /**
     * Tugaskan penyewa ke kamar (buat sewa baru).
     */
    public function store(StoreSewaRequest $request, Penyewa $penyewa): RedirectResponse
    {
        $data = $request->validated();
        $kamar = Kamar::findOrFail($data['kamar_id']);

        try {
            $this->service->assign(
                penyewa: $penyewa,
                kamar: $kamar,
                tglMulai: Carbon::parse($data['tgl_mulai']),
                tglSelesai: isset($data['tgl_selesai']) ? Carbon::parse($data['tgl_selesai']) : null,
                hargaDisepakati: $data['harga_disepakati'] ?? null,
            );
        } catch (DomainException $e) {
            return back()->withErrors(['assign' => $e->getMessage()])->withInput();
        }

        return redirect()
            ->route('admin.penyewa.show', $penyewa)
            ->with('success', "Penyewa berhasil ditugaskan ke kamar {$kamar->nomor_kamar}.");
    }

    /**
     * Akhiri sewa.
     */
    public function end(Request $request, Sewa $sewa): RedirectResponse
    {
        $request->validate([
            'tgl_selesai' => ['nullable', 'date'],
        ]);

        try {
            $this->service->endSewa(
                $sewa,
                $request->input('tgl_selesai') ? Carbon::parse($request->input('tgl_selesai')) : null
            );
        } catch (DomainException $e) {
            return back()->withErrors(['end' => $e->getMessage()]);
        }

        return redirect()
            ->route('admin.penyewa.show', $sewa->penyewa_id)
            ->with('success', 'Sewa berhasil diakhiri. Kamar kembali tersedia.');
    }
}
