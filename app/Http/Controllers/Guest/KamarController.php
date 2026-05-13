<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Kamar;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KamarController extends Controller
{
    /**
     * Public list of kamar dengan filter harga + status + tipe.
     */
    public function index(Request $request): Response
    {
        $query = Kamar::query();

        // Filter status (default: hanya tersedia + terisi, exclude maintenance)
        $status = $request->string('status')->toString() ?: 'all';
        if ($status === 'tersedia') {
            $query->where('status', Kamar::STATUS_TERSEDIA);
        } elseif ($status === 'terisi') {
            $query->where('status', Kamar::STATUS_TERISI);
        } else {
            $query->whereIn('status', [Kamar::STATUS_TERSEDIA, Kamar::STATUS_TERISI]);
        }

        // Filter tipe
        if ($tipe = $request->string('tipe')->toString()) {
            if (in_array($tipe, ['standar', 'deluxe', 'vip'])) {
                $query->where('tipe', $tipe);
            }
        }

        // Filter harga: rentang
        if ($minHarga = $request->integer('min_harga')) {
            $query->where('harga_bulanan', '>=', $minHarga);
        }
        if ($maxHarga = $request->integer('max_harga')) {
            $query->where('harga_bulanan', '<=', $maxHarga);
        }

        // Sort
        $sort = $request->string('sort')->toString() ?: 'harga_asc';
        match ($sort) {
            'harga_desc' => $query->orderByDesc('harga_bulanan'),
            'nomor' => $query->orderBy('nomor_kamar'),
            default => $query->orderBy('harga_bulanan'),
        };

        $kamar = $query->get()->map(fn ($k) => [
            'id' => $k->id,
            'nomor_kamar' => $k->nomor_kamar,
            'tipe' => $k->tipe,
            'harga_bulanan' => $k->harga_bulanan,
            'status' => $k->status,
            'luas_m2' => $k->luas_m2,
            'lantai' => $k->lantai,
            'fasilitas' => $k->fasilitas,
            'deskripsi' => $k->deskripsi,
            'deposit' => $k->deposit,
            'min_sewa_bulan' => $k->min_sewa_bulan,
            'foto' => $k->foto,
        ]);

        return Inertia::render('Guest/Kamar/Index', [
            'kamar' => $kamar,
            'filters' => [
                'status' => $status,
                'tipe' => $tipe ?? '',
                'min_harga' => $request->integer('min_harga') ?: null,
                'max_harga' => $request->integer('max_harga') ?: null,
                'sort' => $sort,
            ],
            'profil' => $this->profilKos(),
        ]);
    }

    public function show(Kamar $kamar): Response
    {
        $peraturan = Faq::query()
            ->where('kategori', Faq::KATEGORI_PERATURAN)
            ->where('aktif', true)
            ->orderBy('urutan')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'pertanyaan' => $f->pertanyaan,
                'jawaban' => $f->jawaban,
                'kategori' => $f->kategori,
            ]);

        return Inertia::render('Guest/Kamar/Show', [
            'kamar' => [
                'id' => $kamar->id,
                'nomor_kamar' => $kamar->nomor_kamar,
                'tipe' => $kamar->tipe,
                'harga_bulanan' => $kamar->harga_bulanan,
                'status' => $kamar->status,
                'luas_m2' => $kamar->luas_m2,
                'lantai' => $kamar->lantai,
                'fasilitas' => $kamar->fasilitas,
                'deskripsi' => $kamar->deskripsi,
                'deposit' => $kamar->deposit,
                'min_sewa_bulan' => $kamar->min_sewa_bulan,
                'foto' => $kamar->foto,
                'peraturan' => $kamar->peraturan,
            ],
            'peraturan' => $peraturan,
            'profil' => $this->profilKos(),
        ]);
    }

    private function profilKos(): array
    {
        return [
            'nama' => config('simkos.nama'),
            'alamat' => config('simkos.alamat'),
            'wa_number' => config('simkos.wa_number'),
            'pengelola_nama' => config('simkos.pengelola_nama'),
            'pengelola_sejak' => config('simkos.pengelola_sejak'),
            'pengelola_bio' => config('simkos.pengelola_bio'),
        ];
    }
}
