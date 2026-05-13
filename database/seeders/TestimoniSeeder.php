<?php

namespace Database\Seeders;

use App\Models\Testimoni;
use Illuminate\Database\Seeder;

class TestimoniSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'nama_penghuni' => 'Rizky H.',
                'peran' => 'Mahasiswa · 1 tahun',
                'rating' => 5,
                'isi' => 'Pengelolaan jelas. Saya tahu kapan harus bayar, bagaimana caranya, dan bukti pembayaran tersimpan rapi. Tidak ada drama soal tagihan.',
                'urutan' => 1,
            ],
            [
                'nama_penghuni' => 'Anisa N.',
                'peran' => 'Karyawan · 8 bulan',
                'rating' => 5,
                'isi' => 'Notifikasi WhatsApp sangat membantu. Saya sering lupa tanggal, tapi sistemnya selalu mengingatkan tepat waktu.',
                'urutan' => 2,
            ],
            [
                'nama_penghuni' => 'Damar P.',
                'peran' => 'Mahasiswa · 6 bulan',
                'rating' => 4,
                'isi' => 'Lokasi strategis, dekat ke kampus dan warung makan. Kamarnya bersih dan WiFi cepat untuk kuliah online.',
                'urutan' => 3,
            ],
        ];

        foreach ($items as $data) {
            Testimoni::updateOrCreate(
                ['nama_penghuni' => $data['nama_penghuni']],
                array_merge($data, ['aktif' => true])
            );
        }
    }
}
