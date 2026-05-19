<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            // Auth user (selalu di-share — null kalau guest)
            'auth' => [
                'user' => fn () => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'phone' => $request->user()->phone,
                        'avatar_url' => \App\Services\StorageUrl::for($request->user()->avatar_url),
                        'roles' => $request->user()->getRoleNames()->all(),
                        'unread_notif_count' => $request->user()->unreadNotifikasi()->count(),
                    ]
                    : null,
            ],

            // Flash messages
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            // Sidebar counts (admin only) — drives red-dot badges di nav items.
            // Cached 60 detik supaya request tidak hit DB tiap kali navigasi.
            // Invalidasi otomatis dari TagihanObserver/PembayaranObserver/KomplainObserver
            // saat ada create/update yang ubah count.
            'sidebar_counts' => fn () => $request->user()?->hasRole('admin')
                ? \Illuminate\Support\Facades\Cache::remember(
                    'sidebar_counts:admin',
                    60,
                    fn () => [
                        // whereHas('sewa.penyewa') exclude orphan tagihan dari penyewa
                        // soft-deleted — kalau tidak, badge nempel meskipun tabel kosong.
                        'tagihan_belum' => \App\Models\Tagihan::query()
                            ->whereIn('status', ['belum_bayar', 'terlambat'])
                            ->where('tgl_jatuh_tempo', '<=', now()->addDays(3)->toDateString())
                            ->whereHas('sewa.penyewa')
                            ->count(),
                        'konfirmasi_pending' => \App\Models\Pembayaran::query()
                            ->where('status_verifikasi', 'pending')
                            ->whereHas('tagihan.sewa.penyewa')
                            ->count(),
                        'komplen_aktif' => \App\Models\Komplain::query()
                            ->whereNot('status', 'selesai')
                            ->whereHas('penyewa')
                            ->count(),
                    ],
                )
                : null,

            // Config app & SIMKOS
            'app' => [
                'name' => config('app.name'),
                'kos_nama' => config('simkos.nama'),
                'kos_alamat' => config('simkos.alamat'),
            ],

            // Ziggy routes
            'ziggy' => fn () => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
