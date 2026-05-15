<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePenyewaRequest;
use App\Http\Requests\Admin\UpdatePenyewaRequest;
use App\Models\Kamar;
use App\Models\Penyewa;
use App\Models\Sewa;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PenyewaController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Penyewa::query()->with(['user', 'sewaAktif.kamar']);

        if ($search = $request->string('q')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nama_lengkap) LIKE ?', ['%'.strtolower($search).'%'])
                    ->orWhereRaw('LOWER(no_hp) LIKE ?', ['%'.strtolower($search).'%'])
                    ->orWhere('no_ktp', 'like', "%{$search}%");
            });
        }

        $paginator = $query->orderBy('nama_lengkap')->paginate(15)->withQueryString();

        $penyewa = collect($paginator->items())->map(fn ($p) => [
            'id' => $p->id,
            'nama_lengkap' => $p->nama_lengkap,
            'no_ktp' => $p->no_ktp,
            'no_hp' => $p->no_hp,
            'kamar_aktif' => $p->sewaAktif?->kamar?->nomor_kamar,
            'periode_sewa' => $p->sewaAktif
                ? $p->sewaAktif->tgl_mulai->format('d M Y').' - '.
                  ($p->sewaAktif->tgl_selesai ? $p->sewaAktif->tgl_selesai->format('d M Y') : 'sekarang')
                : null,
            'status_aktif' => $p->status_aktif ?? 'aktif',
            'punya_akun' => $p->user !== null,
        ]);

        return Inertia::render('Admin/Penyewa/Index', [
            'penyewa' => $penyewa,
            'filters' => ['q' => $request->string('q')->toString()],
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem() ?? 0,
                'to' => $paginator->lastItem() ?? 0,
            ],
        ]);
    }

    public function create(): Response
    {
        // Kamar tersedia untuk dropdown kontrak sewa
        $kamarTersedia = Kamar::query()
            ->where('status', Kamar::STATUS_TERSEDIA)
            ->orderBy('nomor_kamar')
            ->get(['id', 'nomor_kamar', 'tipe', 'harga_bulanan']);

        return Inertia::render('Admin/Penyewa/Form', [
            'mode' => 'create',
            'penyewa' => null,
            'kamarTersedia' => $kamarTersedia,
        ]);
    }

    public function store(StorePenyewaRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle foto KTP upload (di luar DB transaction supaya file tidak lock)
        $fotoKtpPath = null;
        if ($request->hasFile('foto_ktp')) {
            $fotoKtpPath = $request->file('foto_ktp')->store('ktp', config('filesystems.default'));
        }

        $penyewa = DB::transaction(function () use ($request, $data, $fotoKtpPath) {
            $userId = null;

            if ($request->isCreatingAccount()) {
                $user = User::create([
                    'name' => $data['nama_lengkap'],
                    'email' => $data['email'],
                    'phone' => $data['no_hp'],
                    'password' => Hash::make($data['password']),
                    'email_verified_at' => now(),
                ]);
                $user->assignRole('penyewa');
                $userId = $user->id;
            }

            $penyewa = Penyewa::create([
                'user_id' => $userId,
                'nama_lengkap' => $data['nama_lengkap'],
                'no_hp' => $data['no_hp'],
                'no_ktp' => $data['no_ktp'] ?? null,
                'alamat_asal' => $data['alamat_asal'] ?? null,
                'catatan' => $data['catatan'] ?? null,
                'foto_ktp_url' => $fotoKtpPath,
            ]);

            // Buat Sewa otomatis kalau kamar dipilih
            if ($request->hasKontrakSewa()) {
                $kamar = Kamar::lockForUpdate()->find($data['kamar_id']);
                if ($kamar && $kamar->status === Kamar::STATUS_TERSEDIA) {
                    Sewa::create([
                        'penyewa_id' => $penyewa->id,
                        'kamar_id' => $kamar->id,
                        'tgl_mulai' => Carbon::parse($data['tgl_mulai'])->toDateString(),
                        'tgl_selesai' => isset($data['tgl_selesai']) ? Carbon::parse($data['tgl_selesai'])->toDateString() : null,
                        'harga_disepakati' => $data['harga_disepakati'] ?? $kamar->harga_bulanan,
                        'status' => Sewa::STATUS_AKTIF,
                    ]);
                    $kamar->update(['status' => Kamar::STATUS_TERISI]);
                }
            }

            return $penyewa;
        });

        $msg = "Penyewa {$penyewa->nama_lengkap} berhasil ditambahkan.";
        if ($request->hasKontrakSewa()) {
            $msg .= ' Kontrak sewa kamar juga dibuat.';
        }

        return redirect()
            ->route('admin.penyewa.show', $penyewa)
            ->with('success', $msg);
    }

    public function show(Penyewa $penyewa): Response
    {
        $penyewa->load(['user', 'sewa.kamar', 'sewa.tagihan']);

        $kamarTersedia = Kamar::query()
            ->where('status', Kamar::STATUS_TERSEDIA)
            ->orderBy('nomor_kamar')
            ->get(['id', 'nomor_kamar', 'tipe', 'harga_bulanan']);

        return Inertia::render('Admin/Penyewa/Show', [
            'penyewa' => [
                'id' => $penyewa->id,
                'nama_lengkap' => $penyewa->nama_lengkap,
                'no_ktp' => $penyewa->no_ktp,
                'no_hp' => $penyewa->no_hp,
                'alamat_asal' => $penyewa->alamat_asal,
                'catatan' => $penyewa->catatan,
                'status_aktif' => $penyewa->status_aktif ?? 'aktif',
                'user' => $penyewa->user ? [
                    'email' => $penyewa->user->email,
                    'verified' => (bool) $penyewa->user->email_verified_at,
                ] : null,
                'sewa' => $penyewa->sewa->map(fn ($s) => [
                    'id' => $s->id,
                    'kamar_nomor' => $s->kamar->nomor_kamar,
                    'tipe' => $s->kamar->tipe,
                    'tgl_mulai' => $s->tgl_mulai->format('Y-m-d'),
                    'tgl_selesai' => $s->tgl_selesai?->format('Y-m-d'),
                    'harga_disepakati' => (int) $s->harga_disepakati,
                    'status' => $s->status,
                    'jumlah_tagihan' => $s->tagihan->count(),
                ])->values(),
            ],
            'kamarTersedia' => $kamarTersedia,
        ]);
    }

    public function edit(Penyewa $penyewa): Response
    {
        return Inertia::render('Admin/Penyewa/Form', [
            'mode' => 'edit',
            'penyewa' => [
                'id' => $penyewa->id,
                'nama_lengkap' => $penyewa->nama_lengkap,
                'no_ktp' => $penyewa->no_ktp,
                'no_hp' => $penyewa->no_hp,
                'alamat_asal' => $penyewa->alamat_asal,
                'catatan' => $penyewa->catatan,
            ],
            'kamarTersedia' => [],
        ]);
    }

    public function update(UpdatePenyewaRequest $request, Penyewa $penyewa): RedirectResponse
    {
        $penyewa->update($request->validated());

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
