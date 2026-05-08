<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Detail Kamar {{ $kamar->nomor_kamar }}
            </h2>
            <div class="flex gap-2">
                <a href="{{ route('admin.kamar.edit', $kamar) }}" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md">Edit</a>
                <a href="{{ route('admin.kamar.index') }}" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-300">← Kembali</a>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

            {{-- Info Kamar --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informasi Kamar</h3>
                <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                        <dt class="text-gray-500 dark:text-gray-400">Nomor Kamar</dt>
                        <dd class="font-medium text-gray-900 dark:text-gray-100 mt-1">{{ $kamar->nomor_kamar }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500 dark:text-gray-400">Tipe</dt>
                        <dd class="font-medium text-gray-900 dark:text-gray-100 mt-1">{{ strtoupper($kamar->tipe) }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500 dark:text-gray-400">Harga / Bulan</dt>
                        <dd class="font-medium text-gray-900 dark:text-gray-100 mt-1">Rp {{ number_format($kamar->harga_bulanan, 0, ',', '.') }}</dd>
                    </div>
                    <div>
                        <dt class="text-gray-500 dark:text-gray-400">Status</dt>
                        <dd class="mt-1">
                            <span @class([
                                'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                'bg-emerald-100 text-emerald-800' => $kamar->status === 'tersedia',
                                'bg-blue-100 text-blue-800' => $kamar->status === 'terisi',
                                'bg-gray-100 text-gray-800' => $kamar->status === 'maintenance',
                            ])>{{ ucfirst($kamar->status) }}</span>
                        </dd>
                    </div>
                    @if ($kamar->luas_m2)
                    <div>
                        <dt class="text-gray-500 dark:text-gray-400">Luas</dt>
                        <dd class="font-medium text-gray-900 dark:text-gray-100 mt-1">{{ $kamar->luas_m2 }} m²</dd>
                    </div>
                    @endif
                    @if ($kamar->lantai)
                    <div>
                        <dt class="text-gray-500 dark:text-gray-400">Lantai</dt>
                        <dd class="font-medium text-gray-900 dark:text-gray-100 mt-1">{{ $kamar->lantai }}</dd>
                    </div>
                    @endif
                </dl>

                @if ($kamar->deskripsi)
                <div class="mt-4">
                    <dt class="text-sm text-gray-500 dark:text-gray-400">Deskripsi</dt>
                    <dd class="text-sm text-gray-900 dark:text-gray-100 mt-1">{{ $kamar->deskripsi }}</dd>
                </div>
                @endif

                @if ($kamar->fasilitas)
                <div class="mt-4">
                    <dt class="text-sm text-gray-500 dark:text-gray-400">Fasilitas</dt>
                    <dd class="text-sm text-gray-900 dark:text-gray-100 mt-1">{{ $kamar->fasilitas }}</dd>
                </div>
                @endif
            </div>

            {{-- Foto Kamar --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">📷 Foto Kamar ({{ $kamar->foto->count() }}/5)</h3>
                </div>

                @if ($kamar->foto->isNotEmpty())
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                        @foreach ($kamar->foto as $foto)
                            <div class="relative group">
                                <img src="{{ Storage::url($foto->url) }}" alt="Foto kamar {{ $kamar->nomor_kamar }}" class="w-full h-32 object-cover rounded-lg">
                                <form action="{{ route('admin.kamar.foto.destroy', [$kamar, $foto]) }}" method="POST"
                                      class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                                      onsubmit="return confirm('Hapus foto ini?')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">✕</button>
                                </form>
                            </div>
                        @endforeach
                    </div>
                @endif

                @if ($kamar->foto->count() < 5)
                    <form action="{{ route('admin.kamar.foto.store', $kamar) }}" method="POST" enctype="multipart/form-data" class="flex items-center gap-3">
                        @csrf
                        <input type="file" name="foto" accept="image/*" required class="text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100">
                        <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md">Upload</button>
                    </form>
                    <x-input-error :messages="$errors->get('foto')" class="mt-2" />
                @endif
            </div>

            {{-- Riwayat Penyewa --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">📋 Riwayat Penyewa</h3>
                </div>

                @if ($kamar->sewa->isEmpty())
                    <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada riwayat sewa untuk kamar ini.
                    </div>
                @else
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th class="px-4 py-3">Penyewa</th>
                                    <th class="px-4 py-3">Mulai</th>
                                    <th class="px-4 py-3">Selesai</th>
                                    <th class="px-4 py-3">Status</th>
                                    <th class="px-4 py-3">Harga</th>
                                    <th class="px-4 py-3">Tagihan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                                @foreach ($kamar->sewa as $sewa)
                                    <tr class="text-gray-700 dark:text-gray-300">
                                        <td class="px-4 py-3 font-medium">
                                            @if ($sewa->penyewa)
                                                <a href="{{ route('admin.penyewa.show', $sewa->penyewa) }}" class="text-indigo-600 hover:underline">{{ $sewa->penyewa->nama_lengkap }}</a>
                                            @else
                                                -
                                            @endif
                                        </td>
                                        <td class="px-4 py-3 text-xs">{{ \Carbon\Carbon::parse($sewa->tgl_mulai)->format('d/m/Y') }}</td>
                                        <td class="px-4 py-3 text-xs">{{ $sewa->tgl_selesai ? \Carbon\Carbon::parse($sewa->tgl_selesai)->format('d/m/Y') : '-' }}</td>
                                        <td class="px-4 py-3">
                                            <span @class([
                                                'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                                'bg-emerald-100 text-emerald-800' => $sewa->status === 'aktif',
                                                'bg-gray-100 text-gray-800' => $sewa->status === 'selesai',
                                            ])>{{ ucfirst($sewa->status) }}</span>
                                        </td>
                                        <td class="px-4 py-3">Rp {{ number_format($sewa->harga_disepakati, 0, ',', '.') }}</td>
                                        <td class="px-4 py-3 text-xs">{{ $sewa->tagihan->count() }} tagihan</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>

        </div>
    </div>
</x-app-layout>
