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
