<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Laporan Keuangan</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-4">

            {{-- Filter & export --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 flex flex-wrap items-end gap-3">
                <form method="GET" class="flex items-end gap-3 flex-1">
                    <div>
                        <x-input-label for="periode" value="Periode" />
                        <x-text-input id="periode" name="periode" type="month" class="block mt-1" :value="$periode" />
                    </div>
                    <x-primary-button>Tampilkan</x-primary-button>
                </form>
                <a href="{{ route('admin.laporan.pdf', ['type' => 'keuangan', 'periode' => $periode]) }}"
                   class="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold uppercase tracking-wide">
                    📄 Export PDF
                </a>
                <a href="{{ route('admin.laporan.penghuni', ['periode' => $periode]) }}"
                   class="text-sm text-indigo-600 hover:underline self-center">→ Lihat Rekap Penghuni</a>
            </div>

            {{-- Ringkasan --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
                    <p class="text-sm text-gray-500">Total Pemasukan ({{ \Carbon\Carbon::createFromFormat('Y-m', $periode)->translatedFormat('F Y') }})</p>
                    <p class="text-3xl font-semibold text-emerald-600 mt-1">Rp {{ number_format($totalPemasukan, 0, ',', '.') }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ $pemasukan->count() }} transaksi disetujui</p>
                </div>
                <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
                    <p class="text-sm text-gray-500">Piutang (belum/menunggu/terlambat)</p>
                    <p class="text-3xl font-semibold text-rose-600 mt-1">Rp {{ number_format($totalPiutang, 0, ',', '.') }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ $piutang->count() }} tagihan</p>
                </div>
            </div>

            {{-- Table pemasukan --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div class="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Pemasukan</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="px-4 py-3">Tgl Bayar</th>
                                <th class="px-4 py-3">Penyewa</th>
                                <th class="px-4 py-3">Kamar</th>
                                <th class="px-4 py-3">Periode Tagihan</th>
                                <th class="px-4 py-3">Jumlah</th>
                                <th class="px-4 py-3">Metode</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            @forelse ($pemasukan as $b)
                                <tr class="text-gray-700 dark:text-gray-300">
                                    <td class="px-4 py-3 text-xs">{{ $b->tgl_bayar->translatedFormat('d M Y') }}</td>
                                    <td class="px-4 py-3">{{ $b->tagihan->sewa->penyewa->nama_lengkap }}</td>
                                    <td class="px-4 py-3">{{ $b->tagihan->sewa->kamar->nomor_kamar }}</td>
                                    <td class="px-4 py-3 text-xs">{{ $b->tagihan->periode->translatedFormat('M Y') }}</td>
                                    <td class="px-4 py-3 font-medium">Rp {{ number_format($b->jumlah_bayar, 0, ',', '.') }}</td>
                                    <td class="px-4 py-3 text-xs">{{ ucfirst($b->metode) }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-4 py-10 text-center text-gray-500">Tidak ada pemasukan di periode ini.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- Table piutang --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div class="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Piutang</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="px-4 py-3">Penyewa</th>
                                <th class="px-4 py-3">Kamar</th>
                                <th class="px-4 py-3">Jatuh Tempo</th>
                                <th class="px-4 py-3">Jumlah</th>
                                <th class="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            @forelse ($piutang as $t)
                                <tr class="text-gray-700 dark:text-gray-300">
                                    <td class="px-4 py-3">{{ $t->sewa->penyewa->nama_lengkap }}</td>
                                    <td class="px-4 py-3">{{ $t->sewa->kamar->nomor_kamar }}</td>
                                    <td class="px-4 py-3 text-xs">{{ $t->tgl_jatuh_tempo->translatedFormat('d M Y') }}</td>
                                    <td class="px-4 py-3 font-medium">Rp {{ number_format($t->jumlah, 0, ',', '.') }}</td>
                                    <td class="px-4 py-3">
                                        <span @class([
                                            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                            'bg-rose-100 text-rose-800' => in_array($t->status, ['belum_bayar', 'terlambat']),
                                            'bg-amber-100 text-amber-800' => $t->status === 'menunggu_verifikasi',
                                        ])>{{ str_replace('_', ' ', ucfirst($t->status)) }}</span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-4 py-10 text-center text-gray-500">Tidak ada piutang di periode ini. 🎉</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
