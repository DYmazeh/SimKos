<?php

namespace Tests\Feature;

use App\Models\Kamar;
use App\Models\Komplain;
use App\Models\Penyewa;
use App\Models\Sewa;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KomplainFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $penyewaUser;
    private User $penyewaTanpaSewaUser;
    private Penyewa $penyewa;
    private Penyewa $penyewaTanpaSewa;
    private Kamar $kamar;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        // Penyewa dengan sewa aktif.
        $this->penyewaUser = User::factory()->create();
        $this->penyewaUser->assignRole('penyewa');
        $this->penyewa = Penyewa::create([
            'user_id' => $this->penyewaUser->id,
            'nama_lengkap' => 'Penyewa Aktif',
            'no_ktp' => '3201010101010001',
            'no_hp' => '081234567890',
            'alamat_asal' => 'Jl. A',
            'status_aktif' => Penyewa::STATUS_AKTIF,
        ]);

        $this->kamar = Kamar::create([
            'nomor_kamar' => 'B1',
            'tipe' => 'standar',
            'harga_bulanan' => 800000,
            'status' => 'terisi',
        ]);

        Sewa::create([
            'penyewa_id' => $this->penyewa->id,
            'kamar_id' => $this->kamar->id,
            'tgl_mulai' => now()->subMonth()->toDateString(),
            'tgl_selesai' => null,
            'harga_disepakati' => 800000,
            'status' => 'aktif',
        ]);

        // Penyewa tanpa sewa aktif (boundary case).
        $this->penyewaTanpaSewaUser = User::factory()->create();
        $this->penyewaTanpaSewaUser->assignRole('penyewa');
        $this->penyewaTanpaSewa = Penyewa::create([
            'user_id' => $this->penyewaTanpaSewaUser->id,
            'nama_lengkap' => 'Penyewa Idle',
            'no_ktp' => '3201010101010002',
            'no_hp' => '081234567891',
            'alamat_asal' => 'Jl. B',
            'status_aktif' => Penyewa::STATUS_AKTIF,
        ]);
    }

    public function test_penyewa_dengan_sewa_aktif_bisa_create_komplen(): void
    {
        $this->actingAs($this->penyewaUser)
            ->post(route('penyewa.komplen.store'), [
                'judul' => 'Kran bocor',
                'deskripsi' => 'Kran kamar mandi bocor sejak pagi.',
            ])
            ->assertRedirect(route('penyewa.komplen.index'));

        $this->assertDatabaseHas('komplain', [
            'penyewa_id' => $this->penyewa->id,
            'kamar_id' => $this->kamar->id,
            'judul' => 'Kran bocor',
            'status' => Komplain::STATUS_MENUNGGU,
        ]);
    }

    public function test_penyewa_tanpa_sewa_aktif_ditolak(): void
    {
        $this->actingAs($this->penyewaTanpaSewaUser)
            ->get(route('penyewa.komplen.create'))
            ->assertForbidden();

        $this->actingAs($this->penyewaTanpaSewaUser)
            ->post(route('penyewa.komplen.store'), [
                'judul' => 'Judul valid panjang',
                'deskripsi' => 'Deskripsi valid panjang minimal sepuluh karakter.',
            ])
            ->assertForbidden();
    }

    public function test_admin_bisa_update_status_komplen(): void
    {
        $komplain = Komplain::create([
            'kamar_id' => $this->kamar->id,
            'penyewa_id' => $this->penyewa->id,
            'judul' => 'AC mati',
            'deskripsi' => 'AC tidak dingin.',
            'status' => Komplain::STATUS_MENUNGGU,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.komplain.update-status', $komplain), [
                'status' => Komplain::STATUS_SELESAI,
            ])
            ->assertRedirect();

        $komplain->refresh();
        $this->assertEquals(Komplain::STATUS_SELESAI, $komplain->status);
        $this->assertEquals($this->admin->id, $komplain->resolved_by_admin_id);
        $this->assertNotNull($komplain->resolved_at);
    }

    public function test_penyewa_tidak_bisa_update_status_komplen(): void
    {
        $komplain = Komplain::create([
            'kamar_id' => $this->kamar->id,
            'penyewa_id' => $this->penyewa->id,
            'judul' => 'WiFi lemot',
            'deskripsi' => 'Sinyal hilang.',
            'status' => Komplain::STATUS_MENUNGGU,
        ]);

        $this->actingAs($this->penyewaUser)
            ->patch(route('admin.komplain.update-status', $komplain), [
                'status' => Komplain::STATUS_SELESAI,
            ])
            ->assertForbidden();
    }
}
