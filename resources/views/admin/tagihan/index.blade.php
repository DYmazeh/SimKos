<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tagihan</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-3 text-sm">{{ session('success') }}</div>
            @endif
            @if ($errors->any())
                <div class="bg-rose-50 border border-rose-200 text-rose-800 rounded-md p-3 text-sm">{{ $errors->first() }}</div>
            @endif

            {{-- Generate tagihan --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4">
                <form method="POST" action="{{ route('admin.tagihan.generate') }}" class="flex items-end gap-3 flex-wrap">
                    @csrf
                    <div>
                        <x-input-label for="periode_gen" value="Generate untuk Periode" />
                        <x-text-input id="periode_gen" name="periode" type="month" class="block mt-1" :value="now()->format('Y-m')" required />
                    </div>
                    <button type="submit"
                            class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold uppercase tracking-wide">
                        Generate Tagihan
                    </button>
                    <p class="text-xs text-gray-500 dark:text-gray-400 self-center">Aman dipanggil berulang — yang sudah ada tidak akan dobel.</p>
                </form>
            </div>

            {{-- Filter --}}
            <form method="GET" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                    <select name="status" class="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">
                        <option value="">Semua status</option>
                        @foreach (['belum_bayar' => 'Belum Bayar', 'menunggu_verifikasi' => 'Menunggu Verifikasi', 'lunas' => 'Lunas', 'terlambat' => 'Terlambat'] as $v => $l)
                            <option value="{{ $v }}" @selected(request('status') === $v)>{{ $l }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <select name="periode" class="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">
                        <option value="">Semua periode</option>
                        @foreach ($periodeOptions as $p)
                            <option value="{{ $p }}" @selected(request('periode') === $p)>{{ \Carbon\Carbon::createFromFormat('Y-m', $p)->translatedFormat('F Y') }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="sm:col-span-2 flex gap-2">
                    <x-primary-button>Filter</x-primary-button>
                    <a href="{{ route('admin.tagihan.index') }}" class="text-sm text-gray-600 dark:text-gray-400 hover:underline self-center">Reset</a>
                </div>
            </form>

            {{-- Table --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="px-4 py-3">Periode</th>
                                <th class="px-4 py-3">Penyewa</th>
                                <th class="px-4 py-3">Kamar</th>
                                <th class="px-4 py-3">Jumlah</th>
                                <th class="px-4 py-3">Jatuh Tempo</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            @forelse ($tagihan as $t)
                                <tr class="text-gray-700 dark:text-gray-300">
                                    <td class="px-4 py-3">{{ $t->periode->translatedFormat('M Y') }}</td>
                                    <td class="px-4 py-3">{{ $t->sewa->penyewa->nama_lengkap }}</td>
                                    <td class="px-4 py-3">{{ $t->sewa->kamar->nomor_kamar }}</td>
                                    <td class="px-4 py-3">Rp {{ number_format($t->jumlah, 0, ',', '.') }}</td>
                                    <td class="px-4 py-3 text-xs">{{ $t->tgl_jatuh_tempo->translatedFormat('d M Y') }}</td>
                                    <td class="px-4 py-3">
                                        <span @class([
                                            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                            'bg-rose-100 text-rose-800' => in_array($t->status, ['belum_bayar', 'terlambat']),
                                            'bg-amber-100 text-amber-800' => $t->status === 'menunggu_verifikasi',
                                            'bg-emerald-100 text-emerald-800' => $t->status === 'lunas',
                                        ])>{{ str_replace('_', ' ', ucfirst($t->status)) }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <a href="{{ route('admin.tagihan.show', $t) }}" class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Detail</a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Belum ada tagihan untuk filter ini. Klik <strong>Generate Tagihan</strong> di atas untuk membuat.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if ($tagihan->hasPages())
                    <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700">{{ $tagihan->links() }}</div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
