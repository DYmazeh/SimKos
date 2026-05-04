<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreKamarRequest;
use App\Http\Requests\Admin\UpdateKamarRequest;
use App\Models\Kamar;
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

        if ($search = $request->string('q')->toString()) {
            $query->where('nomor_kamar', 'ilike', "%{$search}%");
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

    public function edit(Kamar $kamar): View
    {
        return view('admin.kamar.edit', compact('kamar'));
    }

    public function update(UpdateKamarRequest $request, Kamar $kamar): RedirectResponse
    {
        $kamar->update($request->validated());

        return redirect()
            ->route('admin.kamar.index')
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
}
