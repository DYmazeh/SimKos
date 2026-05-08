<x-guest-layout>
    <header class="mb-8">
        <p class="text-sm font-medium uppercase tracking-wider text-fg-tertiary mb-2">
            Selamat datang kembali
        </p>
        <h1 class="text-5xl font-semibold tracking-tight text-fg-secondary">
            Masuk ke SimKos
        </h1>
        <p class="mt-3 text-lg text-fg-tertiary">
            Gunakan akun yang sudah terdaftar.
        </p>
    </header>

    <x-auth-session-status :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-5" novalidate>
        @csrf

        {{-- Email --}}
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input
                id="email"
                type="email"
                name="email"
                :value="old('email')"
                placeholder="nama@email.com"
                required
                autofocus
                autocomplete="username"
                inputmode="email"
                :aria-invalid="$errors->has('email') ? 'true' : 'false'"
                aria-describedby="email-error"
            />
            <x-input-error id="email-error" :messages="$errors->get('email')" />
        </div>

        {{-- Password --}}
        <div>
            <div class="flex items-center justify-between mb-2">
                <x-input-label for="password" :value="__('Password')" class="mb-0" />
                @if (Route::has('password.request'))
                    <a
                        href="{{ route('password.request') }}"
                        class="text-md text-fg-tertiary hover:text-fg-secondary underline-offset-4 hover:underline transition-colors duration-fast ease-standard rounded-xs"
                    >
                        Lupa password?
                    </a>
                @endif
            </div>
            <x-text-input
                id="password"
                type="password"
                name="password"
                placeholder="Minimal 8 karakter"
                required
                autocomplete="current-password"
                :aria-invalid="$errors->has('password') ? 'true' : 'false'"
                aria-describedby="password-error"
            />
            <x-input-error id="password-error" :messages="$errors->get('password')" />
        </div>

        {{-- Remember me --}}
        <label for="remember_me" class="inline-flex items-center gap-3 cursor-pointer select-none">
            <input
                id="remember_me"
                type="checkbox"
                name="remember"
                class="
                    w-5 h-5 rounded-xs
                    bg-surface-muted border-border text-surface-raised
                    focus:ring-2 focus:ring-surface-raised focus:ring-offset-2 focus:ring-offset-surface-base
                    cursor-pointer
                "
            >
            <span class="text-md text-fg-primary">Ingat saya di perangkat ini</span>
        </label>

        {{-- Submit --}}
        <div class="pt-3">
            <x-primary-button class="w-full h-11 text-xl">
                Masuk
            </x-primary-button>
        </div>

        {{-- Info: registrasi oleh admin --}}
        <p class="text-center text-md text-fg-tertiary pt-2">
            Belum punya akun? Hubungi pemilik kos untuk didaftarkan.
        </p>
    </form>
</x-guest-layout>
