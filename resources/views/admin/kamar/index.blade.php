<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Kamar
            </h2>
            <a href="{{ route('admin.kamar.create') }}"
               class="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white">
                + Tambah Kamar
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-3 text-sm">
                    {{ session('success') }}
                </div>
            @endif

            @if ($errors->any())
                <div class="bg-rose-50 border border-rose-200 text-rose-800 rounded-md p-3 text-sm">
                    {{ $errors->first() }}
                </div>
            @endif

            {{-- Filter --}}
            <form method="GET" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div class="sm:col-span-2">
                    <x-text-input name="q" type="search" placeholder="Cari nomor kamar…"
                                  :value="request('q')" class="w-full" />
                </div>
                <div>
                    <select name="status"
                            class="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">
                        <option value="">Semua status</option>
                        @foreach (['tersedia' => 'Tersedia', 'terisi' => 'Terisi', 'maintenance' => 'Maintenance'] as $v => $l)
                            <option value="{{ $v }}" @selected(request('status') === $v)>{{ $l }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <select name="tipe"
                            class="w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">
                        <option value="">Semua tipe</option>
                        @foreach (['standar' => 'Standar', 'deluxe' => 'Deluxe', 'vip' => 'VIP'] as $v => $l)
                            <option value="{{ $v }}" @selected(request('tipe') === $v)>{{ $l }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="flex gap-2">
                    <x-primary-button>Filter</x-primary-button>
                    <a href="{{ route('admin.kamar.index') }}" class="text-sm text-gray-600 dark:text-gray-400 hover:underline self-center">Reset</a>
                </div>
            </form>

            {{-- Table --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="px-4 py-3">Nomor</th>
                                <th class="px-4 py-3">Tipe</th>
                                <th class="px-4 py-3">Harga / bulan</th>
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            @forelse ($kamar as $k)
                                <tr class="text-gray-700 dark:text-gray-300">
                                    <td class="px-4 py-3 font-medium">{{ $k->nomor_kamar }}</td>
                                    <td class="px-4 py-3 capitalize">{{ $k->tipe }}</td>
                                    <td class="px-4 py-3">Rp {{ number_format($k->harga_bulanan, 0, ',', '.') }}</td>
                                    <td class="px-4 py-3">
                                        <span @class([
                                            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                            'bg-emerald-100 text-emerald-800' => $k->status === 'tersedia',
                                            'bg-indigo-100 text-indigo-800' => $k->status === 'terisi',
                                            'bg-gray-200 text-gray-700' => $k->status === 'maintenance',
                                        ])>{{ ucfirst($k->status) }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-right space-x-2">
                                        <a href="{{ route('admin.kamar.show', $k) }}"
                                           class="text-blue-600 dark:text-blue-400 hover:underline text-sm">Detail</a>
                                        <a href="{{ route('admin.kamar.edit', $k) }}"
                                           class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Edit</a>

                                        <form method="POST" action="{{ route('admin.kamar.destroy', $k) }}"
                                              class="inline ms-2"
                                              onsubmit="return confirm('Hapus kamar {{ $k->nomor_kamar }}?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-rose-600 dark:text-rose-400 hover:underline text-sm">Hapus</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Belum ada kamar. <a href="{{ route('admin.kamar.create') }}" class="text-indigo-600 hover:underline">Tambah sekarang</a>.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                @if ($kamar->hasPages())
                    <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                        {{ $kamar->links() }}
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
