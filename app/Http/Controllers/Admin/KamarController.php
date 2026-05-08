<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreKamarRequest;
use App\Http\Requests\Admin\UpdateKamarRequest;
use App\Models\FotoKamar;
use App\Models\Kamar;
use App\Services\BuktiTransferUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class KamarController extends Controller
{
    public function index(Request $request): View
    {
        $query = Kamar::query();

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($tipe = $request->string('tipe')->toString()) {
            $query->where('tipe', $tipe);
        }

        if ($search = $request->string('q')->toString()) {
            $query->whereRaw('LOWER(nomor_kamar) LIKE ?', ['%' . strtolower($search) . '%']);
        }

        $kamar = $query->orderBy('nomor_kamar')->paginate(15)->withQueryString();

        return view('admin.kamar.index', compact('kamar'));
    }

    public function create(): View
    {
        $kamar = new Kamar(['status' => Kamar::STATUS_TERSEDIA, 'tipe' => 'standar']);

        return view('admin.kamar.create', compact('kamar'));
    }

    public function store(StoreKamarRequest $request): RedirectResponse
    {
        Kamar::create($request->validated());

        return redirect()
            ->route('admin.kamar.index')
            ->with('success', 'Kamar berhasil ditambahkan.');
    }

    /**
     * FR-011: Detail kamar + riwayat penyewa
     */
    public function show(Kamar $kamar): View
    {
        $kamar->load(['foto', 'sewa' => function ($q) {
            $q->with(['penyewa', 'tagihan'])
                ->orderBy('tgl_mulai', 'desc');
        }]);

        return view('admin.kamar.show', compact('kamar'));
    }

    public function edit(Kamar $kamar): View
    {
        return view('admin.kamar.edit', compact('kamar'));
    }

    public function update(UpdateKamarRequest $request, Kamar $kamar): RedirectResponse
    {
        $kamar->update($request->validated());

        return redirect()
            ->route('admin.kamar.show', $kamar)
            ->with('success', "Kamar {$kamar->nomor_kamar} berhasil diperbarui.");
    }

    public function destroy(Kamar $kamar): RedirectResponse
    {
        // Cegah delete kamar yang masih punya sewa aktif
        if ($kamar->sewaAktif()->exists()) {
            return redirect()
                ->route('admin.kamar.index')
                ->withErrors(['delete' => "Kamar {$kamar->nomor_kamar} sedang ditempati. Akhiri sewa dulu sebelum hapus."]);
        }

        $kamar->delete();

        return redirect()
            ->route('admin.kamar.index')
            ->with('success', "Kamar {$kamar->nomor_kamar} dihapus.");
    }

    /**
     * FR-013: Upload foto kamar (max 5)
     */
    public function uploadFoto(Request $request, Kamar $kamar): RedirectResponse
    {
        if ($kamar->foto()->count() >= 5) {
            return back()->withErrors(['foto' => 'Maksimal 5 foto per kamar.']);
        }

        $request->validate([
            'foto' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'foto.max' => 'Ukuran foto maksimal 5MB.',
        ]);

        $path = $request->file('foto')->store('kamar/' . $kamar->id, config('filesystems.default'));

        $kamar->foto()->create([
            'url' => $path,
            'urutan' => $kamar->foto()->count(),
        ]);

        return back()->with('success', 'Foto berhasil diunggah.');
    }

    /**
     * FR-013: Hapus foto kamar
     */
    public function deleteFoto(Kamar $kamar, FotoKamar $fotoKamar): RedirectResponse
    {
        if ($fotoKamar->kamar_id !== $kamar->id) {
            abort(403);
        }

        $fotoKamar->delete();

        return back()->with('success', 'Foto dihapus.');
    }
}
