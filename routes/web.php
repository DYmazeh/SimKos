<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\KamarController as AdminKamarController;
use App\Http\Controllers\Admin\LaporanController as AdminLaporanController;
use App\Http\Controllers\Admin\PembayaranController as AdminPembayaranController;
use App\Http\Controllers\Admin\PenyewaController as AdminPenyewaController;
use App\Http\Controllers\Admin\SewaController as AdminSewaController;
use App\Http\Controllers\Admin\TagihanController as AdminTagihanController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Guest\HomeController as GuestHomeController;
use App\Http\Controllers\Guest\KamarController as GuestKamarController;
use App\Http\Controllers\NotifikasiController;
use App\Http\Controllers\Penyewa\DashboardController as PenyewaDashboardController;
use App\Http\Controllers\Penyewa\PembayaranController as PenyewaPembayaranController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Root: Inertia Guest Home (React) — landing publik
Route::get('/', GuestHomeController::class)->name('home');

// Guest pages publik (browsing kamar tanpa login)
Route::name('guest.')
    ->prefix('kamar')
    ->group(function () {
        Route::get('/', [GuestKamarController::class, 'index'])->name('kamar.index');
        Route::get('/{kamar}', [GuestKamarController::class, 'show'])->name('kamar.show');
    });

// Generic /dashboard — redirect berdasarkan role user
Route::get('/dashboard', DashboardRedirectController::class)
    ->middleware(['auth'])
    ->name('dashboard');

// === ADMIN ===
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
        Route::resource('kamar', AdminKamarController::class); // FR-011: show route included
        Route::post('kamar/{kamar}/foto', [AdminKamarController::class, 'uploadFoto'])->name('kamar.foto.store');
        Route::delete('kamar/{kamar}/foto/{foto_kamar}', [AdminKamarController::class, 'deleteFoto'])->name('kamar.foto.destroy');

        Route::resource('penyewa', AdminPenyewaController::class);
        Route::post('penyewa/{penyewa}/sewa', [AdminSewaController::class, 'store'])->name('penyewa.sewa.store');
        Route::patch('sewa/{sewa}/end', [AdminSewaController::class, 'end'])->name('sewa.end');

        Route::get('tagihan', [AdminTagihanController::class, 'index'])->name('tagihan.index');
        Route::post('tagihan/generate', [AdminTagihanController::class, 'generate'])->name('tagihan.generate');
        Route::get('tagihan/{tagihan}', [AdminTagihanController::class, 'show'])->name('tagihan.show');

        Route::get('pembayaran', [AdminPembayaranController::class, 'index'])->name('pembayaran.index');
        Route::patch('pembayaran/{pembayaran}/approve', [AdminPembayaranController::class, 'approve'])->name('pembayaran.approve');
        Route::patch('pembayaran/{pembayaran}/reject', [AdminPembayaranController::class, 'reject'])->name('pembayaran.reject');
        Route::get('pembayaran/{pembayaran}/download', [AdminPembayaranController::class, 'download'])->name('pembayaran.download');

        Route::get('laporan/keuangan', [AdminLaporanController::class, 'keuangan'])->name('laporan.keuangan');
        Route::get('laporan/penghuni', [AdminLaporanController::class, 'penghuni'])->name('laporan.penghuni');
        Route::get('laporan/pdf/{type}', [AdminLaporanController::class, 'exportPdf'])->name('laporan.pdf');
        Route::get('laporan/excel/{type}', [AdminLaporanController::class, 'exportExcel'])->name('laporan.excel');
    });

// === PENYEWA ===
Route::middleware(['auth', 'verified', 'role:penyewa'])
    ->prefix('penyewa')
    ->name('penyewa.')
    ->group(function () {
        Route::get('/dashboard', PenyewaDashboardController::class)->name('dashboard');
        Route::get('/riwayat', [PenyewaPembayaranController::class, 'riwayat'])->name('riwayat');
        Route::get('/tagihan/{tagihan}/bayar', [PenyewaPembayaranController::class, 'create'])->name('tagihan.bayar.create');
        Route::post('/tagihan/{tagihan}/bayar', [PenyewaPembayaranController::class, 'store'])->name('tagihan.bayar.store');
    });

// Notifikasi (shared antara admin & penyewa)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/notifikasi', [NotifikasiController::class, 'index'])->name('notifikasi.index');
    Route::patch('/notifikasi/{notifikasi}/read', [NotifikasiController::class, 'markRead'])->name('notifikasi.read');
    Route::post('/notifikasi/read-all', [NotifikasiController::class, 'markAllRead'])->name('notifikasi.readAll');
});

// Profile (shared antara admin & penyewa)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
