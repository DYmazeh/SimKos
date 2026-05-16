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
                        'avatar_url' => $request->user()->avatar_url
                            ? \Illuminate\Support\Facades\Storage::disk(config('filesystems.default'))->url($request->user()->avatar_url)
                            : null,
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
            // Lazy/cached per-request via closures supaya skip query kalau bukan admin.
            'sidebar_counts' => fn () => $request->user()?->hasRole('admin')
                ? [
                    'tagihan_belum' => \App\Models\Tagihan::query()
                        ->whereIn('status', ['belum_bayar', 'terlambat'])
                        ->where('tgl_jatuh_tempo', '<=', now()->addDays(3)->toDateString())
                        ->count(),
                    'konfirmasi_pending' => \App\Models\Pembayaran::query()
                        ->where('status_verifikasi', 'pending')
                        ->count(),
                    'komplen_aktif' => \App\Models\Komplain::query()
                        ->whereNot('status', 'selesai')
                        ->count(),
                ]
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
