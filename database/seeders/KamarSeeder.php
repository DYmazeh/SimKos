<?php

namespace Database\Seeders;

use App\Models\Kamar;
use Illuminate\Database\Seeder;

class KamarSeeder extends Seeder
{
    public function run(): void
    {
        $kamar = [
            [
                'nomor_kamar' => 'A-101',
                'tipe' => 'standar',
                'harga_bulanan' => 950_000,
                'luas_m2' => 9,
                'lantai' => 1,
                'fasilitas' => ['WiFi', 'Kasur', 'Lemari', 'Kipas'],
                'deskripsi' => 'Kamar standar di lantai 1, dekat ruang bersama dan dapur.',
            ],
            [
                'nomor_kamar' => 'A-105',
                'tipe' => 'standar',
                'harga_bulanan' => 950_000,
                'luas_m2' => 9,
                'lantai' => 1,
                'fasilitas' => ['WiFi', 'Kasur', 'Lemari'],
                'deskripsi' => 'Standar lantai 1 dengan ventilasi baik, dekat pintu keluar.',
            ],
            [
                'nomor_kamar' => 'A-204',
                'tipe' => 'deluxe',
                'harga_bulanan' => 1_450_000,
                'luas_m2' => 12,
                'lantai' => 2,
                'fasilitas' => ['WiFi', 'AC', 'Kasur', 'Meja kerja'],
                'deskripsi' => 'Kamar deluxe dengan AC dan meja kerja, cocok untuk kerja remote.',
            ],
            [
                'nomor_kamar' => 'B-202',
                'tipe' => 'deluxe',
                'harga_bulanan' => 1_450_000,
                'luas_m2' => 12,
                'lantai' => 2,
                'fasilitas' => ['WiFi', 'AC', 'Meja kerja'],
                'deskripsi' => 'Deluxe lantai 2, jendela besar menghadap taman.',
            ],
            [
                'nomor_kamar' => 'B-301',
                'tipe' => 'vip',
                'harga_bulanan' => 1_850_000,
                'luas_m2' => 16,
                'lantai' => 3,
                'fasilitas' => ['WiFi', 'AC', 'KM dalam', 'Balkon'],
                'deskripsi' => 'VIP dengan kamar mandi dalam dan balkon menghadap timur.',
            ],
            [
                'nomor_kamar' => 'B-305',
                'tipe' => 'vip',
                'harga_bulanan' => 1_950_000,
                'luas_m2' => 18,
                'lantai' => 3,
                'fasilitas' => ['WiFi', 'AC', 'KM dalam', 'Balkon'],
                'deskripsi' => 'VIP unit pojok, lebih tenang dengan balkon luas.',
            ],
        ];

        foreach ($kamar as $data) {
            $attrs = array_merge($data, [
                'peraturan' => 'Tidak merokok di dalam kamar. Tamu lawan jenis tidak diperkenankan masuk kamar.',
                'deposit' => $data['harga_bulanan'], // 1× sewa bulanan
                'min_sewa_bulan' => $data['tipe'] === 'standar' ? 3 : 1,
            ]);

            // Pakai withTrashed() supaya seeder idempotent walau ada baris soft-deleted —
            // tanpa ini, default scope skip soft-deleted → updateOrCreate akan INSERT
            // dan tabrak unique constraint nomor_kamar.
            $existing = Kamar::withTrashed()->where('nomor_kamar', $data['nomor_kamar'])->first();

            if ($existing) {
                if ($existing->trashed()) {
                    $existing->restore();
                }
                // Jangan overwrite status kalau kamar sudah terisi/maintenance —
                // operator mungkin sudah punya kontrak aktif di sana.
                if ($existing->status === Kamar::STATUS_TERSEDIA) {
                    $attrs['status'] = Kamar::STATUS_TERSEDIA;
                }
                $existing->update($attrs);
            } else {
                Kamar::create(array_merge($attrs, [
                    'nomor_kamar' => $data['nomor_kamar'],
                    'status' => Kamar::STATUS_TERSEDIA,
                ]));
            }
        }
    }
}
