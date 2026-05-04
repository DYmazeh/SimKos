<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Tagihan #{{ $tagihan->id }} — {{ $tagihan->periode->translatedFormat('F Y') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-3 text-sm">{{ session('success') }}</div>
            @endif
            @if ($errors->any())
                <div class="bg-rose-50 border border-rose-200 text-rose-800 rounded-md p-3 text-sm">{{ $errors->first() }}</div>
            @endif

            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-gray-500 dark:text-gray-400">Penyewa</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">
                        <a href="{{ route('admin.penyewa.show', $tagihan->sewa->penyewa_id) }}" class="text-indigo-600 hover:underline">
                            {{ $tagihan->sewa->penyewa->nama_lengkap }}
                        </a>
                    </p>
                </div>
                <div>
                    <p class="text-gray-500 dark:text-gray-400">Kamar</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ $tagihan->sewa->kamar->nomor_kamar }}</p>
                </div>
                <div>
                    <p class="text-gray-500 dark:text-gray-400">Jumlah</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">Rp {{ number_format($tagihan->jumlah, 0, ',', '.') }}</p>
                </div>
                <div>
                    <p class="text-gray-500 dark:text-gray-400">Jatuh Tempo</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ $tagihan->tgl_jatuh_tempo->translatedFormat('d F Y') }}</p>
                </div>
                <div>
                    <p class="text-gray-500 dark:text-gray-400">Status</p>
                    <span @class([
                        'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                        'bg-rose-100 text-rose-800' => in_array($tagihan->status, ['belum_bayar', 'terlambat']),
                        'bg-amber-100 text-amber-800' => $tagihan->status === 'menunggu_verifikasi',
                        'bg-emerald-100 text-emerald-800' => $tagihan->status === 'lunas',
                    ])>{{ str_replace('_', ' ', ucfirst($tagihan->status)) }}</span>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Pembayaran</h3>

                @if ($tagihan->pembayaran->isEmpty())
                    <p class="text-sm text-gray-500 dark:text-gray-400">Belum ada pembayaran masuk untuk tagihan ini.</p>
                @else
                    <div class="space-y-3">
                        @foreach ($tagihan->pembayaran as $bayar)
                            <div class="border border-gray-200 dark:border-gray-700 rounded-md p-4 text-sm">
                                <div class="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p><span class="text-gray-500">Tgl bayar:</span> {{ $bayar->tgl_bayar->translatedFormat('d M Y') }}</p>
                                        <p><span class="text-gray-500">Jumlah:</span> <span class="font-semibold">Rp {{ number_format($bayar->jumlah_bayar, 0, ',', '.') }}</span></p>
                                        <p><span class="text-gray-500">Metode:</span> {{ ucfirst($bayar->metode) }}</p>
                                    </div>
                                    <div class="text-right">
                                        <span @class([
                                            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                            'bg-amber-100 text-amber-800' => $bayar->status_verifikasi === 'pending',
                                            'bg-emerald-100 text-emerald-800' => $bayar->status_verifikasi === 'approved',
                                            'bg-rose-100 text-rose-800' => $bayar->status_verifikasi === 'rejected',
                                        ])>{{ ucfirst($bayar->status_verifikasi) }}</span>

                                        @if ($bayar->verified_at)
                                            <p class="text-xs text-gray-500 mt-1">
                                                {{ $bayar->verifikator?->name }} · {{ $bayar->verified_at->translatedFormat('d M Y H:i') }}
                                            </p>
                                        @endif
                                    </div>
                                </div>

                                @if ($bayar->bukti_transfer_url)
                                    <a href="{{ $bayar->bukti_transfer_url }}" target="_blank"
                                       class="inline-block mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                        🧾 Lihat bukti transfer
                                    </a>
                                @endif

                                @if ($bayar->catatan)
                                    <p class="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">"{{ $bayar->catatan }}"</p>
                                @endif

                                @if ($bayar->status_verifikasi === 'pending')
                                    <div class="mt-3 flex gap-2 items-center border-t border-gray-100 dark:border-gray-700 pt-3" x-data="{ rejecting: false, catatan: '' }">
                                        <form method="POST" action="{{ route('admin.pembayaran.approve', $bayar) }}"
                                              onsubmit="return confirm('Setujui pembayaran ini? Tagihan akan ditandai lunas (jika jumlah cukup).')">
                                            @csrf @method('PATCH')
                                            <button class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold">✓ Setujui</button>
                                        </form>

                                        <button @click="rejecting = !rejecting" type="button"
                                                class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold">✗ Tolak</button>

                                        <form method="POST" action="{{ route('admin.pembayaran.reject', $bayar) }}"
                                              x-show="rejecting" x-cloak class="flex gap-2 flex-1 ms-2">
                                            @csrf @method('PATCH')
                                            <input type="text" name="catatan" placeholder="Alasan penolakan (wajib)" required
                                                   class="flex-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md text-xs" />
                                            <button class="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-semibold">Kirim</button>
                                        </form>
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
