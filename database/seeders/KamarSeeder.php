<?php

namespace Database\Seeders;

use App\Models\Kamar;
use Illuminate\Database\Seeder;

class KamarSeeder extends Seeder
{
    public function run(): void
    {
        $kamar = [
            ['nomor_kamar' => 'A1', 'tipe' => 'standar', 'harga_bulanan' => 750_000],
            ['nomor_kamar' => 'A2', 'tipe' => 'standar', 'harga_bulanan' => 750_000],
            ['nomor_kamar' => 'A3', 'tipe' => 'standar', 'harga_bulanan' => 750_000],
            ['nomor_kamar' => 'B1', 'tipe' => 'deluxe', 'harga_bulanan' => 1_200_000],
            ['nomor_kamar' => 'B2', 'tipe' => 'deluxe', 'harga_bulanan' => 1_200_000],
            ['nomor_kamar' => 'C1', 'tipe' => 'vip', 'harga_bulanan' => 1_800_000],
        ];

        foreach ($kamar as $data) {
            Kamar::updateOrCreate(
                ['nomor_kamar' => $data['nomor_kamar']],
                array_merge($data, [
                    'status' => Kamar::STATUS_TERSEDIA,
                    'deskripsi' => 'Kamar '.strtoupper($data['tipe']).' nyaman, '
                        .'sudah termasuk listrik & air.',
                ])
            );
        }
    }
}
