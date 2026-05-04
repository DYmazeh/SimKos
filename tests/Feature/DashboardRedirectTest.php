<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardRedirectTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_redirected_to_admin_dashboard(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertRedirect(route('admin.dashboard'));
    }

    public function test_penyewa_redirected_to_penyewa_dashboard(): void
    {
        $penyewa = User::factory()->create();
        $penyewa->assignRole('penyewa');

        $this->actingAs($penyewa)
            ->get('/dashboard')
            ->assertRedirect(route('penyewa.dashboard'));
    }

    public function test_penyewa_cannot_access_admin_dashboard(): void
    {
        $penyewa = User::factory()->create();
        $penyewa->assignRole('penyewa');

        $this->actingAs($penyewa)
            ->get('/admin/dashboard')
            ->assertForbidden();
    }

    public function test_admin_cannot_access_penyewa_dashboard(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get('/penyewa/dashboard')
            ->assertForbidden();
    }

    public function test_guest_redirected_to_login(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->get('/penyewa/dashboard')->assertRedirect('/login');
    }
}
