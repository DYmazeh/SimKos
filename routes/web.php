<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\KamarController as AdminKamarController;
use App\Http\Controllers\Admin\LaporanController as AdminLaporanController;
use App\Http\Controllers\Admin\PembayaranController as AdminPembayaranController;
use App\Http\Controllers\Admin\PenyewaController as AdminPenyewaController;
use App\Http\Controllers\Admin\SewaController as AdminSewaController;
use App\Http\Controllers\Admin\TagihanController as AdminTagihanController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Penyewa\DashboardController as PenyewaDashboardController;
use App\Http\Controllers\Penyewa\PembayaranController as PenyewaPembayaranController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Root: redirect ke dashboard (kalau login) atau ke login page
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

// Generic /dashboard — redirect berdasarkan role user
Route::get('/dashboard', DashboardRedirectController::class)
    ->middleware(['auth'])
    ->name('dashboard');

// === ADMIN ===
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
        Route::resource('kamar', AdminKamarController::class)->except(['show']);
        Route::resource('penyewa', AdminPenyewaController::class);
        Route::post('penyewa/{penyewa}/sewa', [AdminSewaController::class, 'store'])->name('penyewa.sewa.store');
        Route::patch('sewa/{sewa}/end', [AdminSewaController::class, 'end'])->name('sewa.end');

        Route::get('tagihan', [AdminTagihanController::class, 'index'])->name('tagihan.index');
        Route::post('tagihan/generate', [AdminTagihanController::class, 'generate'])->name('tagihan.generate');
        Route::get('tagihan/{tagihan}', [AdminTagihanController::class, 'show'])->name('tagihan.show');

        Route::get('pembayaran', [AdminPembayaranController::class, 'index'])->name('pembayaran.index');
        Route::patch('pembayaran/{pembayaran}/approve', [AdminPembayaranController::class, 'approve'])->name('pembayaran.approve');
        Route::patch('pembayaran/{pembayaran}/reject', [AdminPembayaranController::class, 'reject'])->name('pembayaran.reject');

        Route::get('laporan/keuangan', [AdminLaporanController::class, 'keuangan'])->name('laporan.keuangan');
        Route::get('laporan/penghuni', [AdminLaporanController::class, 'penghuni'])->name('laporan.penghuni');
        Route::get('laporan/pdf/{type}', [AdminLaporanController::class, 'exportPdf'])->name('laporan.pdf');
    });

// === PENYEWA ===
Route::middleware(['auth', 'role:penyewa'])
    ->prefix('penyewa')
    ->name('penyewa.')
    ->group(function () {
        Route::get('/dashboard', PenyewaDashboardController::class)->name('dashboard');
        Route::get('/tagihan/{tagihan}/bayar', [PenyewaPembayaranController::class, 'create'])->name('tagihan.bayar.create');
        Route::post('/tagihan/{tagihan}/bayar', [PenyewaPembayaranController::class, 'store'])->name('tagihan.bayar.store');
    });

// Profile (shared antara admin & penyewa)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
