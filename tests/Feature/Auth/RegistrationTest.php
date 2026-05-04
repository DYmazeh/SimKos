<?php

namespace Tests\Feature\Auth;

use App\Models\Penyewa;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(200);
    }

    public function test_new_users_can_register_as_penyewa(): void
    {
        $response = $this->post('/register', [
            'name' => 'Budi Penyewa',
            'email' => 'budi@example.com',
            'phone' => '08123456789',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'budi@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('penyewa'));
        $this->assertEquals('08123456789', $user->phone);

        // Auto-create Penyewa profile
        $this->assertDatabaseHas('penyewa', [
            'user_id' => $user->id,
            'no_hp' => '08123456789',
            'nama_lengkap' => 'Budi Penyewa',
        ]);
    }

    public function test_register_rejects_invalid_phone_number(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'phone' => '12345',  // invalid
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('phone');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }
}
