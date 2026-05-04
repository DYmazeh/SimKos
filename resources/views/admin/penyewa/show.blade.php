<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Detail Penyewa — {{ $penyewa->nama_lengkap }}
            </h2>
            <a href="{{ route('admin.penyewa.edit', $penyewa) }}" class="text-sm text-indigo-600 hover:underline">Edit</a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">

            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-3 text-sm">{{ session('success') }}</div>
            @endif
            @if ($errors->any())
                <div class="bg-rose-50 border border-rose-200 text-rose-800 rounded-md p-3 text-sm">{{ $errors->first() }}</div>
            @endif

            {{-- Profile card --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-gray-500 dark:text-gray-400">Nama</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ $penyewa->nama_lengkap }}</p>
                </div>
                <div>
                    <p class="text-gray-500 dark:text-gray-400">No HP</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ $penyewa->no_hp }}</p>
                </div>
                <div>
                    <p class="text-gray-500 dark:text-gray-400">No KTP</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ $penyewa->no_ktp ?? '—' }}</p>
                </div>
                <div>
                    <p class="text-gray-500 dark:text-gray-400">Akun login</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ $penyewa->user?->email ?? '— belum punya akun' }}</p>
                </div>
                <div class="md:col-span-2">
                    <p class="text-gray-500 dark:text-gray-400">Alamat Asal</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100 whitespace-pre-line">{{ $penyewa->alamat_asal ?? '—' }}</p>
                </div>
            </div>

            {{-- Sewa Aktif & Assignment --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Sewa Aktif</h3>

                @php $aktif = $penyewa->sewa->where('status', 'aktif')->first(); @endphp

                @if ($aktif)
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Kamar</p>
                            <p class="font-medium text-gray-900 dark:text-gray-100">{{ $aktif->kamar->nomor_kamar }} ({{ ucfirst($aktif->kamar->tipe) }})</p>
                        </div>
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Sejak</p>
                            <p class="font-medium text-gray-900 dark:text-gray-100">{{ $aktif->tgl_mulai->translatedFormat('d F Y') }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Harga / bulan</p>
                            <p class="font-medium text-gray-900 dark:text-gray-100">Rp {{ number_format($aktif->harga_disepakati, 0, ',', '.') }}</p>
                        </div>
                    </div>

                    <form method="POST" action="{{ route('admin.sewa.end', $aktif) }}" class="mt-4 flex items-end gap-3"
                          onsubmit="return confirm('Akhiri sewa kamar {{ $aktif->kamar->nomor_kamar }}? Kamar akan kembali tersedia.')">
                        @csrf @method('PATCH')
                        <div>
                            <x-input-label for="tgl_selesai" value="Tgl Akhir (opsional)" class="text-xs" />
                            <x-text-input id="tgl_selesai" name="tgl_selesai" type="date"
                                          class="block mt-1" :value="now()->toDateString()" />
                        </div>
                        <button type="submit"
                                class="inline-flex items-center px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold uppercase tracking-wide">
                            Akhiri Sewa
                        </button>
                    </form>
                @else
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Belum ada sewa aktif.</p>

                    @if ($kamarTersedia->isEmpty())
                        <p class="text-sm text-amber-700 dark:text-amber-400">Tidak ada kamar tersedia saat ini.</p>
                    @else
                        <form method="POST" action="{{ route('admin.penyewa.sewa.store', $penyewa) }}"
                              class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border-t border-gray-200 dark:border-gray-700 pt-4">
                            @csrf
                            <div>
                                <x-input-label for="kamar_id" value="Kamar" />
                                <select id="kamar_id" name="kamar_id" required
                                        class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">
                                    @foreach ($kamarTersedia as $k)
                                        <option value="{{ $k->id }}" data-harga="{{ $k->harga_bulanan }}">
                                            {{ $k->nomor_kamar }} · {{ ucfirst($k->tipe) }} · Rp {{ number_format($k->harga_bulanan, 0, ',', '.') }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div>
                                <x-input-label for="tgl_mulai" value="Tgl Mulai" />
                                <x-text-input id="tgl_mulai" name="tgl_mulai" type="date" class="block mt-1 w-full" :value="now()->toDateString()" required />
                            </div>
                            <div>
                                <x-input-label for="harga_disepakati" value="Harga Disepakati (opsional)" />
                                <x-text-input id="harga_disepakati" name="harga_disepakati" type="number" min="0"
                                              class="block mt-1 w-full" placeholder="Pakai harga kamar" />
                            </div>
                            <div>
                                <x-primary-button>Tugaskan ke Kamar</x-primary-button>
                            </div>
                        </form>
                    @endif
                @endif
            </div>

            {{-- Riwayat Sewa --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Riwayat Sewa</h3>

                @if ($penyewa->sewa->isEmpty())
                    <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat sewa.</p>
                @else
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead class="text-left text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th class="py-2 pr-4">Kamar</th>
                                    <th class="py-2 pr-4">Periode</th>
                                    <th class="py-2 pr-4">Harga</th>
                                    <th class="py-2 pr-4">Status</th>
                                    <th class="py-2 pr-4">Tagihan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                                @foreach ($penyewa->sewa->sortByDesc('tgl_mulai') as $s)
                                    <tr>
                                        <td class="py-2 pr-4">{{ $s->kamar->nomor_kamar }}</td>
                                        <td class="py-2 pr-4 text-xs">
                                            {{ $s->tgl_mulai->translatedFormat('d M Y') }} — {{ $s->tgl_selesai?->translatedFormat('d M Y') ?? 'sekarang' }}
                                        </td>
                                        <td class="py-2 pr-4">Rp {{ number_format($s->harga_disepakati, 0, ',', '.') }}</td>
                                        <td class="py-2 pr-4">
                                            <span @class([
                                                'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                                'bg-emerald-100 text-emerald-800' => $s->status === 'aktif',
                                                'bg-gray-200 text-gray-700' => $s->status !== 'aktif',
                                            ])>{{ ucfirst($s->status) }}</span>
                                        </td>
                                        <td class="py-2 pr-4 text-xs">{{ $s->tagihan->count() }} tagihan</td>
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
