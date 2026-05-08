<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Riwayat Pembayaran
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">

                @if ($pembayaran->isEmpty())
                    <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada riwayat pembayaran.
                    </div>
                @else
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th class="px-4 py-3">Tanggal</th>
                                    <th class="px-4 py-3">Kamar</th>
                                    <th class="px-4 py-3">Periode</th>
                                    <th class="px-4 py-3">Jumlah</th>
                                    <th class="px-4 py-3">Metode</th>
                                    <th class="px-4 py-3">Status</th>
                                    <th class="px-4 py-3">Catatan</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                                @foreach ($pembayaran as $bayar)
                                    <tr class="text-gray-700 dark:text-gray-300">
                                        <td class="px-4 py-3 text-xs">{{ \Carbon\Carbon::parse($bayar->tgl_bayar)->format('d/m/Y') }}</td>
                                        <td class="px-4 py-3">{{ $bayar->tagihan?->sewa?->kamar?->nomor_kamar ?? '-' }}</td>
                                        <td class="px-4 py-3 text-xs">{{ \Carbon\Carbon::parse($bayar->tagihan?->periode)->translatedFormat('F Y') }}</td>
                                        <td class="px-4 py-3 font-medium">Rp {{ number_format($bayar->jumlah_bayar, 0, ',', '.') }}</td>
                                        <td class="px-4 py-3 text-xs">{{ ucfirst($bayar->metode) }}</td>
                                        <td class="px-4 py-3">
                                            <span @class([
                                                'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                                'bg-amber-100 text-amber-800' => $bayar->status_verifikasi === 'pending',
                                                'bg-emerald-100 text-emerald-800' => $bayar->status_verifikasi === 'approved',
                                                'bg-rose-100 text-rose-800' => $bayar->status_verifikasi === 'rejected',
                                            ])>
                                                @if ($bayar->status_verifikasi === 'pending') Menunggu
                                                @elseif ($bayar->status_verifikasi === 'approved') Disetujui
                                                @else Ditolak
                                                @endif
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 text-xs text-gray-500">{{ $bayar->catatan ?? '-' }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    <div class="p-4">
                        {{ $pembayaran->links() }}
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
