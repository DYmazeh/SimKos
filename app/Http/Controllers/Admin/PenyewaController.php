<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePenyewaRequest;
use App\Http\Requests\Admin\UpdatePenyewaRequest;
use App\Models\Kamar;
use App\Models\Penyewa;
use App\Models\Sewa;
use App\Models\User;
use App\Services\TagihanGenerator;
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
    public function __construct(private TagihanGenerator $tagihanGenerator) {}

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
                    $sewa = Sewa::create([
                        'penyewa_id' => $penyewa->id,
                        'kamar_id' => $kamar->id,
                        'tgl_mulai' => Carbon::parse($data['tgl_mulai'])->toDateString(),
                        'tgl_selesai' => isset($data['tgl_selesai']) ? Carbon::parse($data['tgl_selesai'])->toDateString() : null,
                        'harga_disepakati' => $data['harga_disepakati'] ?? $kamar->harga_bulanan,
                        'status' => Sewa::STATUS_AKTIF,
                    ]);
                    $kamar->update(['status' => Kamar::STATUS_TERISI]);

                    // Setoran awal — auto-generate tagihan bulan pertama (jatuh tempo +3 hari)
                    $this->tagihanGenerator->generateForSewa($sewa);
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
        $data = $request->validated();

        if ($request->hasFile('foto_ktp')) {
            if ($penyewa->foto_ktp_url) {
                Storage::disk(config('filesystems.default'))->delete($penyewa->foto_ktp_url);
            }
            $data['foto_ktp_url'] = $request->file('foto_ktp')->store('ktp', config('filesystems.default'));
        }

        $penyewa->update($data);

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
            return back()->with('error', 'Tidak bisa hapus: penyewa masih punya sewa aktif. Akhiri sewa dulu dari halaman detail penyewa.');
        }

        DB::transaction(function () use ($penyewa) {
            // Hapus tagihan yang belum dibayar terkait penyewa ini
            $penyewa->sewa()->each(function ($sewa) {
                $sewa->tagihan()->where('status', 'belum_bayar')->delete();
            });

            // Hapus user untuk membersihkan notifikasi yang terkait
            if ($penyewa->user) {
                $penyewa->user->delete();
            }

            $penyewa->delete();
        });

        return redirect()
            ->route('admin.penyewa.index')
            ->with('success', 'Penyewa dihapus.');
    }

    /**
     * FR-018: Nonaktifkan penyewa yang sudah keluar dari kos.
     * Mengakhiri sewa aktif (jika ada), set kamar ke tersedia, dan set
     * status_aktif penyewa ke 'nonaktif'. Data tetap ada untuk riwayat.
     */
    public function deactivate(Penyewa $penyewa): RedirectResponse
    {
        if ($penyewa->status_aktif === Penyewa::STATUS_NONAKTIF) {
            return back()->withErrors(['deactivate' => 'Penyewa sudah berstatus nonaktif.']);
        }

        DB::transaction(function () use ($penyewa) {
            $sewaAktif = $penyewa->sewa()->where('status', Sewa::STATUS_AKTIF)->lockForUpdate()->get();
            foreach ($sewaAktif as $sewa) {
                $sewa->update([
                    'status' => Sewa::STATUS_SELESAI,
                    'tgl_selesai' => $sewa->tgl_selesai ?: Carbon::today()->toDateString(),
                ]);
                if ($sewa->kamar) {
                    $sewa->kamar->update(['status' => Kamar::STATUS_TERSEDIA]);
                }
            }

            $penyewa->update(['status_aktif' => Penyewa::STATUS_NONAKTIF]);
        });

        return back()->with('success', "Penyewa {$penyewa->nama_lengkap} telah dinonaktifkan.");
    }

    /**
     * Aktifkan kembali penyewa yang sebelumnya nonaktif (tanpa membuat sewa baru).
     */
    public function reactivate(Penyewa $penyewa): RedirectResponse
    {
        if ($penyewa->status_aktif === Penyewa::STATUS_AKTIF) {
            return back()->withErrors(['reactivate' => 'Penyewa sudah aktif.']);
        }

        $penyewa->update(['status_aktif' => Penyewa::STATUS_AKTIF]);

        return back()->with('success', "Penyewa {$penyewa->nama_lengkap} diaktifkan kembali.");
    }
}
