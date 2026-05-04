<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Dashboard Admin
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

            {{-- Greeting --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                <p class="text-gray-700 dark:text-gray-300">
                    Halo, <span class="font-semibold">{{ auth()->user()->name }}</span> 👋 — Selamat datang kembali di SIMKOS.
                </p>
            </div>

            {{-- KPI Cards --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                @php
                    $cards = [
                        ['label' => 'Total Kamar', 'value' => $stats['total_kamar'], 'color' => 'bg-blue-500'],
                        ['label' => 'Kamar Terisi', 'value' => $stats['kamar_terisi'], 'color' => 'bg-emerald-500'],
                        ['label' => 'Kamar Tersedia', 'value' => $stats['kamar_tersedia'], 'color' => 'bg-amber-500'],
                        ['label' => 'Maintenance', 'value' => $stats['kamar_maintenance'], 'color' => 'bg-gray-500'],
                        ['label' => 'Sewa Aktif', 'value' => $stats['sewa_aktif'], 'color' => 'bg-indigo-500'],
                        ['label' => 'Tagihan Perlu Diingatkan', 'value' => $stats['tagihan_jatuh_tempo_horizon'], 'color' => 'bg-rose-500'],
                        ['label' => 'Bukti Menunggu Verifikasi', 'value' => $stats['menunggu_verifikasi'], 'color' => 'bg-purple-500'],
                        ['label' => 'Pemasukan Bulan Ini', 'value' => 'Rp ' . number_format($stats['pemasukan_bulan_ini'], 0, ',', '.'), 'color' => 'bg-teal-500'],
                    ];
                @endphp

                @foreach ($cards as $c)
                    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div class="p-4 flex items-start gap-3">
                            <div class="w-2 h-12 rounded {{ $c['color'] }}"></div>
                            <div class="flex-1">
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $c['label'] }}</p>
                                <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{{ $c['value'] }}</p>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>

            {{-- Placeholder modul B (akan diisi nanti) --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">📋 Pengingat Pembayaran</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Widget reminder + tombol WhatsApp akan tampil di sini (Modul B).</p>
            </div>

        </div>
    </div>
</x-app-layout>
