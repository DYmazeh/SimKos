<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Penyewa</h2>
            <a href="{{ route('admin.penyewa.create') }}"
               class="inline-flex items-center px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white">
                + Tambah Penyewa
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-3 text-sm">{{ session('success') }}</div>
            @endif
            @if ($errors->any())
                <div class="bg-rose-50 border border-rose-200 text-rose-800 rounded-md p-3 text-sm">{{ $errors->first() }}</div>
            @endif

            <form method="GET" class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 flex gap-3">
                <x-text-input name="q" type="search" placeholder="Cari nama / no HP…" :value="request('q')" class="flex-1" />
                <x-primary-button>Cari</x-primary-button>
                <a href="{{ route('admin.penyewa.index') }}" class="text-sm text-gray-600 dark:text-gray-400 hover:underline self-center">Reset</a>
            </form>

            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="px-4 py-3">Nama</th>
                                <th class="px-4 py-3">No HP</th>
                                <th class="px-4 py-3">Akun</th>
                                <th class="px-4 py-3">Kamar</th>
                                <th class="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            @forelse ($penyewa as $p)
                                <tr class="text-gray-700 dark:text-gray-300">
                                    <td class="px-4 py-3 font-medium">{{ $p->nama_lengkap }}</td>
                                    <td class="px-4 py-3">{{ $p->no_hp }}</td>
                                    <td class="px-4 py-3 text-xs">
                                        @if ($p->user)
                                            <span class="text-emerald-700">{{ $p->user->email }}</span>
                                        @else
                                            <span class="text-gray-400">— belum punya akun</span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-3">
                                        @if ($p->sewaAktif)
                                            <span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">{{ $p->sewaAktif->kamar->nomor_kamar }}</span>
                                        @else
                                            <span class="text-xs text-gray-400">—</span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <a href="{{ route('admin.penyewa.show', $p) }}" class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Detail</a>
                                        <a href="{{ route('admin.penyewa.edit', $p) }}" class="text-gray-600 dark:text-gray-400 hover:underline text-sm ms-2">Edit</a>
                                        <form method="POST" action="{{ route('admin.penyewa.destroy', $p) }}" class="inline ms-2"
                                              onsubmit="return confirm('Hapus penyewa {{ $p->nama_lengkap }}?')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="text-rose-600 dark:text-rose-400 hover:underline text-sm">Hapus</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-4 py-10 text-center text-gray-500">Belum ada penyewa.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if ($penyewa->hasPages())
                    <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700">{{ $penyewa->links() }}</div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
