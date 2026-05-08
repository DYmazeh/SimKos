<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Upload Bukti Transfer — {{ $tagihan->periode->translatedFormat('F Y') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-4">

            @if ($errors->any())
                <div class="bg-rose-50 border border-rose-200 text-rose-800 rounded-md p-3 text-sm">
                    <ul class="list-disc list-inside">
                        @foreach ($errors->all() as $err)
                            <li>{{ $err }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            {{-- Detail tagihan --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 text-sm">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <p class="text-gray-500 dark:text-gray-400">Periode</p>
                        <p class="font-medium">{{ $tagihan->periode->translatedFormat('F Y') }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 dark:text-gray-400">Jatuh Tempo</p>
                        <p class="font-medium">{{ $tagihan->tgl_jatuh_tempo->translatedFormat('d F Y') }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 dark:text-gray-400">Jumlah Tagihan</p>
                        <p class="font-medium">Rp {{ number_format($tagihan->jumlah, 0, ',', '.') }}</p>
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
            </div>

            {{-- FR-024: Instruksi Pembayaran --}}
            @if (config('simkos.rekening_nomor'))
                <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 text-sm">
                    <h4 class="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">💳 Instruksi Pembayaran</h4>
                    <p class="text-indigo-700 dark:text-indigo-400 mb-2">Transfer ke rekening berikut:</p>
                    <div class="bg-white dark:bg-gray-800 rounded-md p-3 space-y-1">
                        <div class="flex justify-between">
                            <span class="text-gray-500">Bank</span>
                            <span class="font-medium text-gray-900 dark:text-gray-100">{{ config('simkos.rekening_bank') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">No. Rekening</span>
                            <span class="font-mono font-medium text-gray-900 dark:text-gray-100">{{ config('simkos.rekening_nomor') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Atas Nama</span>
                            <span class="font-medium text-gray-900 dark:text-gray-100">{{ config('simkos.rekening_nama') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Nominal</span>
                            <span class="font-bold text-indigo-700 dark:text-indigo-300">Rp {{ number_format($tagihan->jumlah, 0, ',', '.') }}</span>
                        </div>
                    </div>
                </div>
            @endif

            {{-- Form upload --}}
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <form method="POST" action="{{ route('penyewa.tagihan.bayar.store', $tagihan) }}" enctype="multipart/form-data">
                    @csrf

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <x-input-label for="tgl_bayar" value="Tanggal Bayar" />
                            <x-text-input id="tgl_bayar" name="tgl_bayar" type="date" class="block mt-1 w-full"
                                          :value="old('tgl_bayar', now()->toDateString())" required />
                        </div>

                        <div>
                            <x-input-label for="jumlah_bayar" value="Jumlah Dibayar (Rp)" />
                            <x-text-input id="jumlah_bayar" name="jumlah_bayar" type="number" min="1" class="block mt-1 w-full"
                                          :value="old('jumlah_bayar', $tagihan->jumlah)" required />
                        </div>

                        <div>
                            <x-input-label for="metode" value="Metode Bayar" />
                            <select id="metode" name="metode" required
                                    class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">
                                <option value="transfer" @selected(old('metode', 'transfer') === 'transfer')>Transfer Bank</option>
                                <option value="tunai" @selected(old('metode') === 'tunai')>Tunai</option>
                            </select>
                        </div>

                        <div>
                            <x-input-label for="bukti" value="Bukti Transfer (JPG/PNG/PDF, max 5MB)" />
                            <input id="bukti" name="bukti" type="file" required
                                   accept="image/jpeg,image/png,application/pdf"
                                   class="block mt-1 w-full text-sm text-gray-700 dark:text-gray-300
                                          file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                                          file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700
                                          hover:file:bg-indigo-100" />
                        </div>

                        <div class="md:col-span-2">
                            <x-input-label for="catatan" value="Catatan (opsional)" />
                            <textarea id="catatan" name="catatan" rows="2" maxlength="500"
                                      class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm">{{ old('catatan') }}</textarea>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 mt-6">
                        <x-primary-button>Kirim Bukti</x-primary-button>
                        <a href="{{ route('penyewa.dashboard') }}" class="text-sm text-gray-600 dark:text-gray-400 hover:underline">Batal</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
