<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Rekap Penghuni</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-4">

            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 flex flex-wrap items-end gap-3">
                <form method="GET" class="flex items-end gap-3 flex-1">
                    <div>
                        <x-input-label for="periode" value="Periode" />
                        <x-text-input id="periode" name="periode" type="month" class="block mt-1" :value="$periode" />
                    </div>
                    <x-primary-button>Tampilkan</x-primary-button>
                </form>
                <a href="{{ route('admin.laporan.pdf', ['type' => 'penghuni', 'periode' => $periode]) }}"
                   class="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold uppercase tracking-wide">
                    📄 Export PDF
                </a>
                <a href="{{ route('admin.laporan.excel', ['type' => 'penghuni', 'periode' => $periode]) }}"
                   class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold uppercase tracking-wide">
                    📊 Export Excel
                </a>
                <a href="{{ route('admin.laporan.keuangan', ['periode' => $periode]) }}"
                   class="text-sm text-indigo-600 hover:underline self-center">→ Lihat Laporan Keuangan</a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
                    <p class="text-sm text-gray-500">Penghuni Aktif (saat ini)</p>
                    <p class="text-3xl font-semibold text-emerald-600 mt-1">{{ $totalAktifSekarang }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
                    <p class="text-sm text-gray-500">Selesai dalam periode</p>
                    <p class="text-3xl font-semibold text-gray-600 mt-1">{{ $totalSelesaiPeriode }}</p>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="px-4 py-3">Kamar</th>
                                <th class="px-4 py-3">Penyewa</th>
                                <th class="px-4 py-3">No HP</th>
                                <th class="px-4 py-3">Mulai</th>
                                <th class="px-4 py-3">Selesai</th>
                                <th class="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            @forelse ($sewaPeriode as $s)
                                <tr class="text-gray-700 dark:text-gray-300">
                                    <td class="px-4 py-3 font-medium">{{ $s->kamar->nomor_kamar }}</td>
                                    <td class="px-4 py-3">{{ $s->penyewa->nama_lengkap }}</td>
                                    <td class="px-4 py-3 text-xs">{{ $s->penyewa->no_hp }}</td>
                                    <td class="px-4 py-3 text-xs">{{ $s->tgl_mulai->translatedFormat('d M Y') }}</td>
                                    <td class="px-4 py-3 text-xs">{{ $s->tgl_selesai?->translatedFormat('d M Y') ?? '—' }}</td>
                                    <td class="px-4 py-3">
                                        <span @class([
                                            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                            'bg-emerald-100 text-emerald-800' => $s->status === 'aktif',
                                            'bg-gray-200 text-gray-700' => $s->status !== 'aktif',
                                        ])>{{ ucfirst($s->status) }}</span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-4 py-10 text-center text-gray-500">Tidak ada penghuni dalam periode ini.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
