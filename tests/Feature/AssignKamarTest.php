<?php

namespace Tests\Feature;

use App\Models\Kamar;
use App\Models\Penyewa;
use App\Models\Sewa;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AssignKamarTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    private function penyewa(array $overrides = []): Penyewa
    {
        return Penyewa::create(array_merge([
            'nama_lengkap' => 'Budi Test',
            'no_hp' => '08120000000',
        ], $overrides));
    }

    private function kamar(string $status = Kamar::STATUS_TERSEDIA, array $overrides = []): Kamar
    {
        return Kamar::create(array_merge([
            'nomor_kamar' => 'A1',
            'tipe' => 'standar',
            'harga_bulanan' => 800000,
            'status' => $status,
        ], $overrides));
    }

    private function sewaAktif(Penyewa $penyewa, Kamar $kamar): Sewa
    {
        return Sewa::create([
            'penyewa_id' => $penyewa->id,
            'kamar_id' => $kamar->id,
            'tgl_mulai' => '2026-01-01',
            'harga_disepakati' => 800000,
            'status' => Sewa::STATUS_AKTIF,
        ]);
    }

    public function test_admin_can_assign_kamar_to_penyewa_without_room(): void
    {
        $penyewa = $this->penyewa();
        $kamar = $this->kamar();

        $this->actingAs($this->admin)
            ->post(route('admin.penyewa.sewa.store', $penyewa), [
                'kamar_id' => $kamar->id,
                'tgl_mulai' => '2026-06-04',
            ])
            ->assertRedirect(route('admin.penyewa.show', $penyewa));

        $sewa = Sewa::where('penyewa_id', $penyewa->id)->firstOrFail();

        $this->assertDatabaseHas('sewa', [
            'id' => $sewa->id,
            'kamar_id' => $kamar->id,
            'status' => Sewa::STATUS_AKTIF,
            'harga_disepakati' => 800000, // default mengikuti harga kamar
        ]);
        $this->assertDatabaseHas('kamar', [
            'id' => $kamar->id,
            'status' => Kamar::STATUS_TERISI,
        ]);
        // setoran awal: tagihan pertama ikut tergenerate
        $this->assertDatabaseHas('tagihan', ['sewa_id' => $sewa->id]);
    }

    public function test_assign_uses_harga_override_when_provided(): void
    {
        $penyewa = $this->penyewa();
        $kamar = $this->kamar();

        $this->actingAs($this->admin)
            ->post(route('admin.penyewa.sewa.store', $penyewa), [
                'kamar_id' => $kamar->id,
                'tgl_mulai' => '2026-06-04',
                'harga_disepakati' => 750000,
            ]);

        $this->assertDatabaseHas('sewa', [
            'penyewa_id' => $penyewa->id,
            'harga_disepakati' => 750000,
        ]);
    }

    public function test_assign_stores_tgl_selesai_when_provided(): void
    {
        $penyewa = $this->penyewa();
        $kamar = $this->kamar();

        $this->actingAs($this->admin)
            ->post(route('admin.penyewa.sewa.store', $penyewa), [
                'kamar_id' => $kamar->id,
                'tgl_mulai' => '2026-06-04',
                'tgl_selesai' => '2026-12-04',
            ]);

        $sewa = Sewa::where('penyewa_id', $penyewa->id)->firstOrFail();
        $this->assertEquals('2026-12-04', $sewa->tgl_selesai?->toDateString());
    }

    public function test_assign_rejects_tgl_selesai_before_tgl_mulai(): void
    {
        $penyewa = $this->penyewa();
        $kamar = $this->kamar();

        $this->actingAs($this->admin)
            ->post(route('admin.penyewa.sewa.store', $penyewa), [
                'kamar_id' => $kamar->id,
                'tgl_mulai' => '2026-06-04',
                'tgl_selesai' => '2026-06-01',
            ])
            ->assertSessionHasErrors('tgl_selesai');

        $this->assertDatabaseMissing('sewa', ['penyewa_id' => $penyewa->id]);
    }

    public function test_cannot_assign_penyewa_that_already_has_active_sewa(): void
    {
        $penyewa = $this->penyewa();
        $this->sewaAktif($penyewa, $this->kamar(Kamar::STATUS_TERISI, ['nomor_kamar' => 'A1']));
        $kamarBaru = $this->kamar(Kamar::STATUS_TERSEDIA, ['nomor_kamar' => 'A2']);

        $this->actingAs($this->admin)
            ->post(route('admin.penyewa.sewa.store', $penyewa), [
                'kamar_id' => $kamarBaru->id,
                'tgl_mulai' => '2026-06-04',
            ])
            ->assertSessionHasErrors('assign');

        $this->assertDatabaseHas('kamar', [
            'id' => $kamarBaru->id,
            'status' => Kamar::STATUS_TERSEDIA,
        ]);
        $this->assertEquals(1, Sewa::where('penyewa_id', $penyewa->id)->count());
    }

    public function test_cannot_assign_to_unavailable_kamar(): void
    {
        $penyewa = $this->penyewa();
        $kamar = $this->kamar(Kamar::STATUS_MAINTENANCE);

        $this->actingAs($this->admin)
            ->post(route('admin.penyewa.sewa.store', $penyewa), [
                'kamar_id' => $kamar->id,
                'tgl_mulai' => '2026-06-04',
            ])
            ->assertSessionHasErrors('assign');

        $this->assertDatabaseMissing('sewa', ['penyewa_id' => $penyewa->id]);
    }

    public function test_kamar_show_only_lists_penyewa_without_room(): void
    {
        $tanpaKamar = $this->penyewa(['nama_lengkap' => 'Tanpa Kamar', 'no_hp' => '0811']);
        $punyaKamar = $this->penyewa(['nama_lengkap' => 'Punya Kamar', 'no_hp' => '0812']);
        $this->sewaAktif($punyaKamar, $this->kamar(Kamar::STATUS_TERISI, ['nomor_kamar' => 'B1']));

        $nonaktif = $this->penyewa([
            'nama_lengkap' => 'Nonaktif',
            'no_hp' => '0813',
            'status_aktif' => Penyewa::STATUS_NONAKTIF,
        ]);

        $kamarKosong = $this->kamar(Kamar::STATUS_TERSEDIA, ['nomor_kamar' => 'B2']);

        $this->actingAs($this->admin)
            ->get(route('admin.kamar.show', $kamarKosong))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Kamar/Show')
                ->has('penyewaTanpaKamar', 1)
                ->where('penyewaTanpaKamar.0.nama_lengkap', 'Tanpa Kamar')
            );
    }
}
