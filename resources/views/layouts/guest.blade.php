<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="bg-surface-base">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'SimKos') }}</title>

    {{-- Fonts: Figtree as PPLX Sans visual stand-in --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="font-sans antialiased text-fg-primary bg-surface-base min-h-screen">
    <a href="#main" class="sr-only-focusable absolute top-3 left-3 z-50 px-4 py-2 rounded-pill bg-surface-raised text-fg-secondary text-md">
        Lewati ke konten utama
    </a>

    <div class="min-h-screen grid lg:grid-cols-[6fr_5fr]">
        {{-- Brand panel --}}
        <aside class="hidden lg:flex flex-col justify-between p-11 bg-surface-muted border-r border-border">
            <a href="/" class="inline-flex items-center gap-3 text-fg-secondary">
                <x-application-logo class="text-surface-raised" />
                <span class="text-3xl font-semibold tracking-tight">SimKos</span>
            </a>

            <div>
                <h2 class="text-6xl font-semibold tracking-tight text-fg-secondary mb-5">
                    Manajemen kos,<br>
                    <span class="text-surface-raised">jelas dan tenang.</span>
                </h2>
                <p class="text-2xl text-fg-tertiary max-w-md">
                    Satu dashboard untuk kamar, penyewa, tagihan, dan verifikasi pembayaran.
                </p>
            </div>

            <ul class="grid grid-cols-3 gap-5 text-md text-fg-tertiary">
                <li class="flex items-start gap-2">
                    <span aria-hidden="true" class="mt-1 inline-block w-1.5 h-1.5 rounded-pill bg-surface-raised"></span>
                    Tagihan otomatis tiap bulan
                </li>
                <li class="flex items-start gap-2">
                    <span aria-hidden="true" class="mt-1 inline-block w-1.5 h-1.5 rounded-pill bg-surface-raised"></span>
                    Verifikasi bukti transfer
                </li>
                <li class="flex items-start gap-2">
                    <span aria-hidden="true" class="mt-1 inline-block w-1.5 h-1.5 rounded-pill bg-surface-raised"></span>
                    Laporan keuangan ringkas
                </li>
            </ul>
        </aside>

        {{-- Form panel --}}
        <main id="main" class="flex flex-col justify-center px-6 py-11 lg:px-11">
            {{-- Mobile brand --}}
            <a href="/" class="lg:hidden inline-flex items-center gap-3 mb-9 text-fg-secondary">
                <x-application-logo class="text-surface-raised" />
                <span class="text-3xl font-semibold tracking-tight">SimKos</span>
            </a>

            <div class="w-full max-w-md mx-auto">
                {{ $slot }}
            </div>

            <p class="mt-11 text-sm text-fg-tertiary text-center max-w-md mx-auto">
                &copy; {{ date('Y') }} SimKos &middot; Sistem Informasi Manajemen Kos
            </p>
        </main>
    </div>
</body>
</html>
