<?php

namespace Tests\Feature;

use App\Models\Kamar;
use App\Models\Penyewa;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Services\TagihanGenerator;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagihanGeneratorTest extends TestCase
{
    use RefreshDatabase;

    public function test_generates_one_tagihan_per_active_sewa(): void
    {
        $kamar1 = Kamar::create(['nomor_kamar' => 'A1', 'tipe' => 'standar', 'harga_bulanan' => 700000, 'status' => 'terisi']);
        $kamar2 = Kamar::create(['nomor_kamar' => 'A2', 'tipe' => 'standar', 'harga_bulanan' => 700000, 'status' => 'terisi']);
        $penyewa1 = Penyewa::create(['nama_lengkap' => 'A', 'no_hp' => '081111']);
        $penyewa2 = Penyewa::create(['nama_lengkap' => 'B', 'no_hp' => '082222']);

        Sewa::create([
            'penyewa_id' => $penyewa1->id, 'kamar_id' => $kamar1->id,
            'tgl_mulai' => '2026-04-01', 'harga_disepakati' => 700000, 'status' => 'aktif',
        ]);
        Sewa::create([
            'penyewa_id' => $penyewa2->id, 'kamar_id' => $kamar2->id,
            'tgl_mulai' => '2026-04-01', 'harga_disepakati' => 700000, 'status' => 'aktif',
        ]);

        $generator = new TagihanGenerator(jatuhTempoTanggal: 5);
        $created = $generator->generateForPeriode(Carbon::parse('2026-05-15'));

        $this->assertCount(2, $created);
        $this->assertDatabaseCount('tagihan', 2);

        // Verify content via Eloquent (Carbon casting handles date format consistently)
        $tagihan = Tagihan::first();
        $this->assertEquals('2026-05-01', $tagihan->periode->toDateString());
        $this->assertEquals('2026-05-05', $tagihan->tgl_jatuh_tempo->toDateString());
        $this->assertEquals(700000, $tagihan->jumlah);
        $this->assertEquals('belum_bayar', $tagihan->status);
    }

    public function test_is_idempotent_does_not_duplicate(): void
    {
        $kamar = Kamar::create(['nomor_kamar' => 'A1', 'tipe' => 'standar', 'harga_bulanan' => 700000, 'status' => 'terisi']);
        $penyewa = Penyewa::create(['nama_lengkap' => 'A', 'no_hp' => '081111']);
        Sewa::create([
            'penyewa_id' => $penyewa->id, 'kamar_id' => $kamar->id,
            'tgl_mulai' => '2026-04-01', 'harga_disepakati' => 700000, 'status' => 'aktif',
        ]);

        $generator = new TagihanGenerator;
        $first = $generator->generateForPeriode(Carbon::parse('2026-05-01'));
        $second = $generator->generateForPeriode(Carbon::parse('2026-05-01'));

        $this->assertCount(1, $first);
        $this->assertCount(0, $second);  // tidak duplikat
        $this->assertDatabaseCount('tagihan', 1);
    }

    public function test_skips_inactive_sewa(): void
    {
        $kamar = Kamar::create(['nomor_kamar' => 'A1', 'tipe' => 'standar', 'harga_bulanan' => 700000, 'status' => 'tersedia']);
        $penyewa = Penyewa::create(['nama_lengkap' => 'A', 'no_hp' => '081111']);
        Sewa::create([
            'penyewa_id' => $penyewa->id, 'kamar_id' => $kamar->id,
            'tgl_mulai' => '2026-04-01', 'tgl_selesai' => '2026-04-30',
            'harga_disepakati' => 700000, 'status' => 'selesai',
        ]);

        $generator = new TagihanGenerator;
        $created = $generator->generateForPeriode(Carbon::parse('2026-05-01'));

        $this->assertCount(0, $created);
        $this->assertDatabaseCount('tagihan', 0);
    }

    public function test_skips_sewa_that_starts_after_periode(): void
    {
        $kamar = Kamar::create(['nomor_kamar' => 'A1', 'tipe' => 'standar', 'harga_bulanan' => 700000, 'status' => 'terisi']);
        $penyewa = Penyewa::create(['nama_lengkap' => 'A', 'no_hp' => '081111']);
        Sewa::create([
            'penyewa_id' => $penyewa->id, 'kamar_id' => $kamar->id,
            'tgl_mulai' => '2026-06-01', 'harga_disepakati' => 700000, 'status' => 'aktif',
        ]);

        $generator = new TagihanGenerator;
        $created = $generator->generateForPeriode(Carbon::parse('2026-05-01'));

        $this->assertCount(0, $created);
    }

    public function test_uses_harga_disepakati_not_kamar_default(): void
    {
        $kamar = Kamar::create(['nomor_kamar' => 'A1', 'tipe' => 'standar', 'harga_bulanan' => 700000, 'status' => 'terisi']);
        $penyewa = Penyewa::create(['nama_lengkap' => 'A', 'no_hp' => '081111']);
        Sewa::create([
            'penyewa_id' => $penyewa->id, 'kamar_id' => $kamar->id,
            'tgl_mulai' => '2026-04-01', 'harga_disepakati' => 650000, // diskon!
            'status' => 'aktif',
        ]);

        $generator = new TagihanGenerator;
        $generator->generateForPeriode(Carbon::parse('2026-05-01'));

        $this->assertEquals(650000, Tagihan::first()->jumlah);
    }
}
