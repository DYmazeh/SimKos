<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="bg-surface-base">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="{{ config('simkos.nama') }} — Sistem manajemen kos modern. Lihat kamar tersedia, harga, dan fasilitas.">

    <title>{{ config('simkos.nama', 'SimKos') }} — Kos Nyaman & Terjangkau</title>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="font-sans antialiased text-fg-primary bg-surface-base min-h-screen">
    {{-- ============ NAVBAR ============ --}}
    <nav class="sticky top-0 z-50 bg-surface-base/80 backdrop-blur-xl border-b border-border/30">
        <div class="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="/" class="inline-flex items-center gap-3 text-fg-secondary">
                <x-application-logo class="text-surface-raised" />
                <span class="text-xl font-semibold tracking-tight">{{ config('simkos.nama', 'SimKos') }}</span>
            </a>

            <div class="flex items-center gap-4">
                <a href="#kamar" class="hidden sm:inline-block text-md text-fg-tertiary hover:text-fg-secondary transition-colors duration-fast">
                    Kamar
                </a>
                <a href="#tentang" class="hidden sm:inline-block text-md text-fg-tertiary hover:text-fg-secondary transition-colors duration-fast">
                    Tentang
                </a>
                @auth
                    <a href="{{ route('dashboard') }}"
                       class="inline-flex items-center px-5 py-2 rounded-pill bg-surface-raised text-fg-secondary text-md font-medium hover:opacity-90 transition-opacity duration-fast">
                        Dashboard
                    </a>
                @else
                    <a href="{{ route('login') }}"
                       class="inline-flex items-center px-5 py-2 rounded-pill bg-surface-raised text-fg-secondary text-md font-medium hover:opacity-90 transition-opacity duration-fast">
                        Masuk
                    </a>
                @endauth
            </div>
        </div>
    </nav>

    {{-- ============ HERO ============ --}}
    <section class="relative overflow-hidden">
        <div class="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-14">
            <div class="max-w-2xl">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-surface-muted border border-border/30 text-md text-fg-tertiary mb-6">
                    <span class="w-2 h-2 rounded-full bg-state-success animate-pulse"></span>
                    {{ $kamarTersedia->count() }} kamar tersedia
                </div>

                <h1 class="text-7xl font-bold tracking-tight text-fg-secondary mb-5 leading-tight">
                    Tempat tinggal<br>
                    <span class="text-surface-raised">nyaman & terjangkau</span>
                </h1>

                <p class="text-2xl text-fg-tertiary mb-9 max-w-lg">
                    {{ config('simkos.nama') }} menyediakan kamar kos dengan fasilitas lengkap.
                    Hubungi kami untuk booking, dan kelola tagihan dengan mudah lewat dashboard penyewa.
                </p>

                <div class="flex flex-wrap gap-4">
                    <a href="#kamar"
                       class="inline-flex items-center px-8 py-3 rounded-pill bg-surface-raised text-fg-secondary text-lg font-semibold shadow-2 hover:opacity-90 transition-all duration-fast">
                        Lihat Kamar
                        <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                    </a>
                    <a href="https://wa.me/{{ \App\Services\WhatsappReminderLink::normalizePhone(config('simkos.kontak_hp', '')) }}" target="_blank" rel="noopener"
                       class="inline-flex items-center px-8 py-3 rounded-pill border border-border text-fg-tertiary text-lg font-medium hover:text-fg-secondary hover:border-fg-tertiary transition-all duration-fast">
                        <svg class="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Hubungi Kami
                    </a>
                </div>
            </div>
        </div>

        {{-- Subtle gradient accent --}}
        <div class="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none bg-gradient-to-l from-surface-raised to-transparent"></div>
    </section>

    {{-- ============ KAMAR TERSEDIA ============ --}}
    <section id="kamar" class="scroll-mt-16">
        <div class="max-w-6xl mx-auto px-6 lg:px-8 py-14">
            <div class="flex items-end justify-between mb-9">
                <div>
                    <h2 class="text-5xl font-bold text-fg-secondary tracking-tight">Kamar Tersedia</h2>
                    <p class="text-lg text-fg-tertiary mt-2">Pilih tipe kamar yang sesuai dengan kebutuhanmu</p>
                </div>
            </div>

            @if($kamarTersedia->isEmpty())
                <div class="text-center py-14 bg-surface-muted rounded-sm border border-border/30">
                    <svg class="mx-auto w-12 h-12 text-fg-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    <p class="text-xl text-fg-tertiary">Maaf, semua kamar sedang terisi saat ini.</p>
                    <p class="text-md text-fg-tertiary mt-1">Silakan hubungi kami untuk masuk daftar tunggu.</p>
                </div>
            @else
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    @foreach($kamarTersedia as $kamar)
                        <article class="group bg-surface-muted border border-border/30 rounded-sm overflow-hidden hover:border-surface-raised/50 transition-all duration-normal">
                            {{-- Card header --}}
                            <div class="p-6 pb-4">
                                <div class="flex items-center justify-between mb-4">
                                    <span class="inline-flex items-center px-3 py-1 rounded-pill text-sm font-medium
                                        {{ $kamar->tipe === 'vip' ? 'bg-yellow-900/30 text-yellow-400' : ($kamar->tipe === 'deluxe' ? 'bg-purple-900/30 text-purple-400' : 'bg-surface-raised/20 text-surface-raised') }}">
                                        {{ strtoupper($kamar->tipe) }}
                                    </span>
                                    <span class="text-md text-fg-tertiary">{{ $kamar->nomor_kamar }}</span>
                                </div>

                                <h3 class="text-3xl font-bold text-fg-secondary mb-1">
                                    Kamar {{ $kamar->nomor_kamar }}
                                </h3>
                            </div>

                            {{-- Price --}}
                            <div class="px-6 py-4 border-t border-border/20">
                                <div class="flex items-baseline gap-1">
                                    <span class="text-md text-fg-tertiary">Rp</span>
                                    <span class="text-4xl font-bold text-fg-secondary num">{{ number_format($kamar->harga_bulanan, 0, ',', '.') }}</span>
                                    <span class="text-md text-fg-tertiary">/ bulan</span>
                                </div>
                            </div>

                            {{-- Description & Fasilitas --}}
                            <div class="px-6 pb-4 pt-2 space-y-2">
                                @if($kamar->deskripsi)
                                    <p class="text-md text-fg-tertiary leading-relaxed">{{ $kamar->deskripsi }}</p>
                                @endif
                                @if($kamar->fasilitas)
                                    <p class="text-sm text-fg-tertiary">
                                        <span class="font-medium text-fg-secondary">Fasilitas:</span> {{ $kamar->fasilitas }}
                                    </p>
                                @endif
                                @if($kamar->luas_m2)
                                    <p class="text-sm text-fg-tertiary">
                                        <span class="font-medium text-fg-secondary">Luas:</span> {{ $kamar->luas_m2 }} m²
                                        @if($kamar->lantai) · Lantai {{ $kamar->lantai }} @endif
                                    </p>
                                @endif
                            </div>

                            {{-- CTA --}}
                            <div class="px-6 pb-6">
                                <span class="inline-flex items-center gap-2 text-md text-surface-raised font-medium group-hover:underline">
                                    <span class="w-2 h-2 rounded-full bg-state-success"></span>
                                    Tersedia — Hubungi untuk booking
                                </span>
                            </div>
                        </article>
                    @endforeach
                </div>
            @endif
        </div>
    </section>

    {{-- ============ TENTANG / FLOW ============ --}}
    <section id="tentang" class="scroll-mt-16 border-t border-border/20">
        <div class="max-w-6xl mx-auto px-6 lg:px-8 py-14">
            <h2 class="text-5xl font-bold text-fg-secondary tracking-tight mb-9">Cara Menjadi Penyewa</h2>

            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-surface-muted border border-border/30 rounded-sm p-6">
                    <div class="w-10 h-10 rounded-full bg-surface-raised/20 text-surface-raised flex items-center justify-center text-xl font-bold mb-4">1</div>
                    <h3 class="text-lg font-semibold text-fg-secondary mb-2">Hubungi Kami</h3>
                    <p class="text-md text-fg-tertiary">Hubungi pemilik kos via WhatsApp atau datang langsung untuk survey kamar.</p>
                </div>

                <div class="bg-surface-muted border border-border/30 rounded-sm p-6">
                    <div class="w-10 h-10 rounded-full bg-surface-raised/20 text-surface-raised flex items-center justify-center text-xl font-bold mb-4">2</div>
                    <h3 class="text-lg font-semibold text-fg-secondary mb-2">Booking Kamar</h3>
                    <p class="text-md text-fg-tertiary">Setuju dengan kamar dan harga? Admin akan mendaftarkan kamu ke sistem.</p>
                </div>

                <div class="bg-surface-muted border border-border/30 rounded-sm p-6">
                    <div class="w-10 h-10 rounded-full bg-surface-raised/20 text-surface-raised flex items-center justify-center text-xl font-bold mb-4">3</div>
                    <h3 class="text-lg font-semibold text-fg-secondary mb-2">Terima Akun</h3>
                    <p class="text-md text-fg-tertiary">Kamu akan mendapatkan email dan password untuk login ke dashboard penyewa.</p>
                </div>

                <div class="bg-surface-muted border border-border/30 rounded-sm p-6">
                    <div class="w-10 h-10 rounded-full bg-surface-raised/20 text-surface-raised flex items-center justify-center text-xl font-bold mb-4">4</div>
                    <h3 class="text-lg font-semibold text-fg-secondary mb-2">Kelola Tagihan</h3>
                    <p class="text-md text-fg-tertiary">Lihat tagihan bulanan, upload bukti transfer, dan pantau status pembayaran.</p>
                </div>
            </div>
        </div>
    </section>

    {{-- ============ INFO KOS ============ --}}
    <section class="border-t border-border/20">
        <div class="max-w-6xl mx-auto px-6 lg:px-8 py-14">
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-surface-muted border border-border/30 rounded-sm p-6">
                    <svg class="w-8 h-8 text-surface-raised mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-fg-secondary mb-2">Alamat</h3>
                    <p class="text-md text-fg-tertiary">{{ config('simkos.alamat', 'Hubungi kami untuk info lokasi') }}</p>
                </div>

                <div class="bg-surface-muted border border-border/30 rounded-sm p-6">
                    <svg class="w-8 h-8 text-surface-raised mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-fg-secondary mb-2">Harga Mulai</h3>
                    <p class="text-md text-fg-tertiary">
                        @if($kamarTersedia->isNotEmpty())
                            Rp {{ number_format($kamarTersedia->min('harga_bulanan'), 0, ',', '.') }} / bulan
                        @else
                            Hubungi kami untuk info harga
                        @endif
                    </p>
                </div>

                <div class="bg-surface-muted border border-border/30 rounded-sm p-6">
                    <svg class="w-8 h-8 text-surface-raised mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-fg-secondary mb-2">Pembayaran Aman</h3>
                    <p class="text-md text-fg-tertiary">Tagihan otomatis tiap bulan dengan verifikasi bukti transfer oleh admin.</p>
                </div>
            </div>
        </div>
    </section>

    {{-- ============ FOOTER ============ --}}
    <footer class="border-t border-border/20">
        <div class="max-w-6xl mx-auto px-6 lg:px-8 py-9">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3 text-fg-tertiary">
                    <x-application-logo class="text-surface-raised w-6 h-6" />
                    <span class="text-md">&copy; {{ date('Y') }} {{ config('simkos.nama', 'SimKos') }} &middot; Sistem Informasi Manajemen Kos</span>
                </div>
                <a href="{{ route('login') }}" class="text-md text-fg-tertiary hover:text-surface-raised transition-colors duration-fast">
                    Login Penyewa →
                </a>
            </div>
        </div>
    </footer>
</body>
</html>
