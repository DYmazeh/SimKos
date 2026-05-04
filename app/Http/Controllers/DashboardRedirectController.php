<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class DashboardRedirectController extends Controller
{
    /**
     * Redirect ke dashboard sesuai role user setelah login.
     */
    public function __invoke(): RedirectResponse
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->hasRole('penyewa')) {
            return redirect()->route('penyewa.dashboard');
        }

        // User tanpa role (edge case) — kick logout
        Auth::logout();

        return redirect()->route('login')->withErrors([
            'email' => 'Akun Anda belum memiliki role. Hubungi administrator.',
        ]);
    }
}
