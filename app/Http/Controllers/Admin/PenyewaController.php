<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePenyewaRequest;
use App\Http\Requests\Admin\UpdatePenyewaRequest;
use App\Models\Kamar;
use App\Models\Penyewa;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class PenyewaController extends Controller
{
    public function index(Request $request): View
    {
        $query = Penyewa::query()->with(['user', 'sewaAktif.kamar']);

        if ($search = $request->string('q')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                  ->orWhere('no_hp', 'ilike', "%{$search}%");
            });
        }

        $penyewa = $query->orderBy('nama_lengkap')->paginate(15)->withQueryString();

        return view('admin.penyewa.index', compact('penyewa'));
    }

    public function create(): View
    {
        $penyewa = new Penyewa();

        return view('admin.penyewa.create', compact('penyewa'));
    }

    public function store(StorePenyewaRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $penyewa = DB::transaction(function () use ($request, $data) {
            $userId = null;

            if ($request->isCreatingAccount()) {
                $user = User::create([
                    'name' => $data['nama_lengkap'],
                    'email' => $data['email'],
                    'phone' => $data['no_hp'],
                    'password' => Hash::make($data['password']),
                    'email_verified_at' => now(), // admin yang bikin → langsung verified
                ]);
                $user->assignRole('penyewa');
                $userId = $user->id;
            }

            return Penyewa::create([
                'user_id' => $userId,
                'nama_lengkap' => $data['nama_lengkap'],
                'no_hp' => $data['no_hp'],
                'no_ktp' => $data['no_ktp'] ?? null,
                'alamat_asal' => $data['alamat_asal'] ?? null,
            ]);
        });

        return redirect()
            ->route('admin.penyewa.show', $penyewa)
            ->with('success', "Penyewa {$penyewa->nama_lengkap} berhasil ditambahkan.");
    }

    public function show(Penyewa $penyewa): View
    {
        $penyewa->load(['user', 'sewa.kamar', 'sewa.tagihan']);

        // Kamar yang tersedia (untuk dropdown assignment)
        $kamarTersedia = Kamar::query()
            ->where('status', Kamar::STATUS_TERSEDIA)
            ->orderBy('nomor_kamar')
            ->get();

        return view('admin.penyewa.show', compact('penyewa', 'kamarTersedia'));
    }

    public function edit(Penyewa $penyewa): View
    {
        return view('admin.penyewa.edit', compact('penyewa'));
    }

    public function update(UpdatePenyewaRequest $request, Penyewa $penyewa): RedirectResponse
    {
        $penyewa->update($request->validated());

        // Sync nama & phone ke user-nya kalau ada akun
        if ($penyewa->user) {
            $penyewa->user->update([
                'name' => $penyewa->nama_lengkap,
                'phone' => $penyewa->no_hp,
            ]);
        }

        return redirect()
            ->route('admin.penyewa.show', $penyewa)
            ->with('success', 'Profil penyewa diperbarui.');
    }

    public function destroy(Penyewa $penyewa): RedirectResponse
    {
        if ($penyewa->sewa()->where('status', 'aktif')->exists()) {
            return back()->withErrors([
                'delete' => 'Tidak bisa hapus: penyewa masih punya sewa aktif. Akhiri dulu.',
            ]);
        }

        $penyewa->delete();

        return redirect()
            ->route('admin.penyewa.index')
            ->with('success', 'Penyewa dihapus.');
    }
}
