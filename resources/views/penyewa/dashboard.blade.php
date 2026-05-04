<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Dashboard Penyewa
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">

            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-3 text-sm">{{ session('success') }}</div>
            @endif

            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                <p class="text-gray-700 dark:text-gray-300">
                    Halo, <span class="font-semibold">{{ auth()->user()->name }}</span> 👋
                </p>
            </div>

            {{-- Status sewa --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Status Sewa</h3>

                @if ($penyewa?->sewaAktif)
                    @php $sewa = $penyewa->sewaAktif; @endphp
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Kamar</p>
                            <p class="text-gray-900 dark:text-gray-100 font-medium">{{ $sewa->kamar->nomor_kamar }} · {{ ucfirst($sewa->kamar->tipe) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Sejak</p>
                            <p class="text-gray-900 dark:text-gray-100 font-medium">{{ $sewa->tgl_mulai->translatedFormat('d F Y') }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Harga / bulan</p>
                            <p class="text-gray-900 dark:text-gray-100 font-medium">Rp {{ number_format($sewa->harga_disepakati, 0, ',', '.') }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 dark:text-gray-400">Status</p>
                            <span class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">{{ ucfirst($sewa->status) }}</span>
                        </div>
                    </div>
                @else
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Anda belum terdaftar sebagai penyewa kamar aktif. Silakan hubungi pengelola kos untuk pendaftaran kamar.
                    </p>
                @endif
            </div>

            {{-- Tagihan --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Tagihan</h3>

                @if ($tagihan->isEmpty())
                    <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada tagihan.</p>
                @else
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="text-left text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                    <th class="py-2 pr-4">Periode</th>
                                    <th class="py-2 pr-4">Jumlah</th>
                                    <th class="py-2 pr-4">Jatuh Tempo</th>
                                    <th class="py-2 pr-4">Status</th>
                                    <th class="py-2 pr-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                @foreach ($tagihan as $t)
                                    <tr class="text-gray-700 dark:text-gray-300">
                                        <td class="py-2 pr-4">{{ $t->periode->translatedFormat('F Y') }}</td>
                                        <td class="py-2 pr-4">Rp {{ number_format($t->jumlah, 0, ',', '.') }}</td>
                                        <td class="py-2 pr-4">{{ $t->tgl_jatuh_tempo->translatedFormat('d M Y') }}</td>
                                        <td class="py-2 pr-4">
                                            <span @class([
                                                'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                                'bg-rose-100 text-rose-800' => $t->status === 'belum_bayar' || $t->status === 'terlambat',
                                                'bg-amber-100 text-amber-800' => $t->status === 'menunggu_verifikasi',
                                                'bg-emerald-100 text-emerald-800' => $t->status === 'lunas',
                                            ])>{{ str_replace('_', ' ', ucfirst($t->status)) }}</span>
                                        </td>
                                        <td class="py-2 pr-4 text-right">
                                            @if (in_array($t->status, ['belum_bayar', 'terlambat']))
                                                <a href="{{ route('penyewa.tagihan.bayar.create', $t) }}"
                                                   class="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold">
                                                    💳 Bayar / Upload Bukti
                                                </a>
                                            @elseif ($t->status === 'menunggu_verifikasi')
                                                <span class="text-xs text-amber-700 italic">Menunggu verifikasi admin</span>
                                            @elseif ($t->status === 'lunas')
                                                <span class="text-xs text-emerald-700">✓ Sudah lunas</span>
                                            @endif

                                            @php $latestRejected = $t->pembayaran->where('status_verifikasi', 'rejected')->sortByDesc('verified_at')->first(); @endphp
                                            @if ($latestRejected && in_array($t->status, ['belum_bayar', 'terlambat']))
                                                <p class="text-[11px] text-rose-600 mt-1 italic">
                                                    Bukti sebelumnya ditolak: "{{ $latestRejected->catatan }}"
                                                </p>
                                            @endif
                                        </td>
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
