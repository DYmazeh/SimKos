<?php

namespace Tests\Feature;

use App\Models\Kamar;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KamarCrudTest extends TestCase
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

    public function test_admin_can_view_kamar_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.kamar.index'))
            ->assertOk();
    }

    public function test_admin_can_create_kamar(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.kamar.store'), [
                'nomor_kamar' => 'X1',
                'tipe' => 'standar',
                'harga_bulanan' => 800000,
                'status' => 'tersedia',
                'deskripsi' => 'Kamar test',
            ])
            ->assertRedirect(route('admin.kamar.index'));

        $this->assertDatabaseHas('kamar', [
            'nomor_kamar' => 'X1',
            'harga_bulanan' => 800000,
        ]);
    }

    public function test_admin_cannot_create_kamar_with_duplicate_nomor(): void
    {
        Kamar::create([
            'nomor_kamar' => 'X1',
            'tipe' => 'standar',
            'harga_bulanan' => 800000,
            'status' => 'tersedia',
        ]);

        $this->actingAs($this->admin)
            ->post(route('admin.kamar.store'), [
                'nomor_kamar' => 'X1',
                'tipe' => 'deluxe',
                'harga_bulanan' => 1000000,
                'status' => 'tersedia',
            ])
            ->assertSessionHasErrors('nomor_kamar');
    }

    public function test_admin_can_update_kamar(): void
    {
        $kamar = Kamar::create([
            'nomor_kamar' => 'X2',
            'tipe' => 'standar',
            'harga_bulanan' => 800000,
            'status' => 'tersedia',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.kamar.update', $kamar), [
                'nomor_kamar' => 'X2',
                'tipe' => 'deluxe',
                'harga_bulanan' => 1500000,
                'status' => 'maintenance',
                'deskripsi' => null,
            ])
            ->assertRedirect(route('admin.kamar.index'));

        $kamar->refresh();
        $this->assertEquals('deluxe', $kamar->tipe);
        $this->assertEquals(1500000, $kamar->harga_bulanan);
        $this->assertEquals('maintenance', $kamar->status);
    }

    public function test_admin_can_delete_kamar(): void
    {
        $kamar = Kamar::create([
            'nomor_kamar' => 'X3',
            'tipe' => 'standar',
            'harga_bulanan' => 800000,
            'status' => 'tersedia',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.kamar.destroy', $kamar))
            ->assertRedirect(route('admin.kamar.index'));

        $this->assertSoftDeleted('kamar', ['id' => $kamar->id]);
    }

    public function test_penyewa_cannot_access_kamar_crud(): void
    {
        $penyewa = User::factory()->create();
        $penyewa->assignRole('penyewa');

        $this->actingAs($penyewa)
            ->get(route('admin.kamar.index'))
            ->assertForbidden();
    }
}
