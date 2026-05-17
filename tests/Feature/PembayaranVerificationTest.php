<?php

namespace Tests\Feature;

use App\Models\Kamar;
use App\Models\Pembayaran;
use App\Models\Penyewa;
use App\Models\Sewa;
use App\Models\Tagihan;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PembayaranVerificationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $penyewaUser;
    private Penyewa $penyewa;
    private Kamar $kamar;
    private Sewa $sewa;
    private Tagihan $tagihan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->penyewaUser = User::factory()->create();
        $this->penyewaUser->assignRole('penyewa');

        $this->penyewa = Penyewa::create([
            'user_id' => $this->penyewaUser->id,
            'nama_lengkap' => 'Penyewa Test',
            'no_ktp' => '3201010101010001',
            'no_hp' => '081234567890',
            'alamat_asal' => 'Jl. Test',
            'status_aktif' => Penyewa::STATUS_AKTIF,
        ]);

        $this->kamar = Kamar::create([
            'nomor_kamar' => 'A1',
            'tipe' => 'standar',
            'harga_bulanan' => 800000,
            'status' => 'terisi',
        ]);

        $this->sewa = Sewa::create([
            'penyewa_id' => $this->penyewa->id,
            'kamar_id' => $this->kamar->id,
            'tgl_mulai' => now()->subMonth()->toDateString(),
            'tgl_selesai' => null,
            'harga_disepakati' => 800000,
            'status' => 'aktif',
        ]);

        $this->tagihan = Tagihan::create([
            'sewa_id' => $this->sewa->id,
            'periode' => now()->startOfMonth()->toDateString(),
            'jumlah' => 800000,
            'tgl_jatuh_tempo' => now()->addDays(5)->toDateString(),
            'status' => Tagihan::STATUS_MENUNGGU_VERIFIKASI,
        ]);
    }

    private function createPendingPembayaran(): Pembayaran
    {
        return Pembayaran::create([
            'tagihan_id' => $this->tagihan->id,
            'tgl_bayar' => now()->toDateString(),
            'jumlah_bayar' => 800000,
            'metode' => 'transfer',
            'bukti_transfer_url' => 'bukti/test.jpg',
            'status_verifikasi' => Pembayaran::STATUS_PENDING,
        ]);
    }

    public function test_approve_marks_tagihan_lunas_when_fully_paid(): void
    {
        $pembayaran = $this->createPendingPembayaran();

        $this->actingAs($this->admin)
            ->patch(route('admin.pembayaran.approve', $pembayaran))
            ->assertRedirect();

        $this->tagihan->refresh();
        $pembayaran->refresh();

        $this->assertEquals(Pembayaran::STATUS_APPROVED, $pembayaran->status_verifikasi);
        $this->assertEquals(Tagihan::STATUS_LUNAS, $this->tagihan->status);
        $this->assertNotNull($pembayaran->verified_at);
        $this->assertEquals($this->admin->id, $pembayaran->diverifikasi_oleh);
    }

    public function test_reject_resets_tagihan_status_and_requires_reason(): void
    {
        $pembayaran = $this->createPendingPembayaran();

        // Tanpa catatan harus error validation.
        $this->actingAs($this->admin)
            ->patch(route('admin.pembayaran.reject', $pembayaran), [])
            ->assertSessionHasErrors('catatan');

        $this->actingAs($this->admin)
            ->patch(route('admin.pembayaran.reject', $pembayaran), [
                'catatan' => 'Nominal tidak sesuai.',
            ])
            ->assertRedirect();

        $this->tagihan->refresh();
        $pembayaran->refresh();

        $this->assertEquals(Pembayaran::STATUS_REJECTED, $pembayaran->status_verifikasi);
        $this->assertContains($this->tagihan->status, [Tagihan::STATUS_BELUM_BAYAR, Tagihan::STATUS_TERLAMBAT]);
        $this->assertEquals('Nominal tidak sesuai.', $pembayaran->catatan);
    }

    public function test_double_verify_is_blocked(): void
    {
        $pembayaran = $this->createPendingPembayaran();

        $this->actingAs($this->admin)
            ->patch(route('admin.pembayaran.approve', $pembayaran))
            ->assertRedirect();

        $this->actingAs($this->admin)
            ->patch(route('admin.pembayaran.approve', $pembayaran))
            ->assertSessionHasErrors('verify');
    }

    public function test_penyewa_cannot_verify_pembayaran(): void
    {
        $pembayaran = $this->createPendingPembayaran();

        $this->actingAs($this->penyewaUser)
            ->patch(route('admin.pembayaran.approve', $pembayaran))
            ->assertForbidden();
    }
}
