<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $umum = [
            ['q' => 'Apakah listrik dan air sudah termasuk?', 'a' => 'Air dan WiFi sepenuhnya termasuk. Listrik flat Rp 75.000 per bulan sudah masuk dalam tagihan, tidak perlu membayar terpisah ke PLN.'],
            ['q' => 'Bagaimana cara membayar bulan pertama?', 'a' => 'Pada saat booking, Anda membayar deposit (1× sewa) dan sewa bulan pertama. Pembayaran dilakukan via transfer bank, bukti diunggah ke dashboard.'],
            ['q' => 'Apa yang terjadi jika saya keluar di tengah bulan?', 'a' => 'Sewa berlaku per bulan penuh dan tidak diprorata. Deposit akan dikembalikan setelah pengecekan kondisi kamar, paling lambat 7 hari setelah check-out.'],
            ['q' => 'Apakah tersedia parkir motor dan mobil?', 'a' => 'Parkir motor tersedia gratis untuk seluruh penghuni. Parkir mobil terbatas, silakan tanyakan ketersediaan ke pengelola.'],
            ['q' => 'Bagaimana sistem laundry?', 'a' => 'Tersedia area cuci-jemur gratis di lantai 1. Mesin cuci koin tersedia dengan biaya Rp 5.000 per cuci.'],
            ['q' => 'Apakah ada batasan check-in?', 'a' => 'Check-in dapat dilakukan 24 jam dengan koordinasi sebelumnya ke pengelola. Pengelola akan menyiapkan kunci dan dokumen.'],
        ];

        $peraturan = [
            ['q' => 'Tamu menginap', 'a' => 'Tamu (saudara/orang tua) diperbolehkan menginap maksimal 2 malam dengan pemberitahuan ke admin. Tamu lawan jenis tidak diperkenankan masuk kamar.'],
            ['q' => 'Jam malam dan akses', 'a' => 'Gerbang depan ditutup pukul 23.00. Penghuni mendapat kartu akses untuk masuk-keluar 24 jam dengan mencatat di log keamanan.'],
            ['q' => 'Pasangan suami-istri', 'a' => 'Kami menerima pasutri dengan menunjukkan dokumen pernikahan yang sah. Sewa kamar VIP direkomendasikan untuk pasutri.'],
            ['q' => 'Hewan peliharaan', 'a' => 'Untuk menjaga kenyamanan bersama, hewan peliharaan tidak diperkenankan tinggal di area kos.'],
            ['q' => 'Merokok', 'a' => 'Dilarang merokok di dalam kamar. Tersedia area khusus merokok di teras belakang.'],
            ['q' => 'Masa minimum sewa', 'a' => 'Minimum sewa 3 bulan untuk tipe Standar, 1 bulan untuk Deluxe dan VIP. Sewa dibayar di muka per bulan.'],
        ];

        foreach ($umum as $i => $f) {
            Faq::updateOrCreate(
                ['pertanyaan' => $f['q']],
                ['jawaban' => $f['a'], 'kategori' => Faq::KATEGORI_UMUM, 'urutan' => $i + 1, 'aktif' => true]
            );
        }
        foreach ($peraturan as $i => $f) {
            Faq::updateOrCreate(
                ['pertanyaan' => $f['q']],
                ['jawaban' => $f['a'], 'kategori' => Faq::KATEGORI_PERATURAN, 'urutan' => $i + 1, 'aktif' => true]
            );
        }
    }
}
