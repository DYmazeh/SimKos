<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Kamar;
use App\Models\Testimoni;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        // Featured kamar: 6 kamar tersedia, urutkan harga termurah → termahal
        $kamarFeatured = Kamar::query()
            ->where('status', Kamar::STATUS_TERSEDIA)
            ->orderBy('harga_bulanan')
            ->limit(6)
            ->get()
            ->map(fn ($k) => $this->mapKamarSummary($k));

        $kamarTersediaCount = Kamar::where('status', Kamar::STATUS_TERSEDIA)->count();
        $minPrice = (int) Kamar::where('status', Kamar::STATUS_TERSEDIA)->min('harga_bulanan');
        $maxPrice = (int) Kamar::where('status', Kamar::STATUS_TERSEDIA)->max('harga_bulanan');

        $testimoni = Testimoni::query()
            ->where('aktif', true)
            ->orderBy('urutan')
            ->limit(6)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'nama_penghuni' => $t->nama_penghuni,
                'peran' => $t->peran,
                'isi' => $t->isi,
                'rating' => $t->rating,
            ]);

        $faqUmum = Faq::query()
            ->where('kategori', Faq::KATEGORI_UMUM)
            ->where('aktif', true)
            ->orderBy('urutan')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'pertanyaan' => $f->pertanyaan,
                'jawaban' => $f->jawaban,
                'kategori' => $f->kategori,
            ]);

        $faqPeraturan = Faq::query()
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

        return Inertia::render('Guest/Home', [
            'kamarFeatured' => $kamarFeatured,
            'kamarTersediaCount' => $kamarTersediaCount,
            'priceRange' => [
                'min' => $minPrice ?: 0,
                'max' => $maxPrice ?: 0,
            ],
            'testimoni' => $testimoni,
            'faqUmum' => $faqUmum,
            'faqPeraturan' => $faqPeraturan,
            'profil' => $this->profilKos(),
        ]);
    }

    private function mapKamarSummary(Kamar $k): array
    {
        return [
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
        ];
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
