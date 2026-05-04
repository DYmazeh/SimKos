<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Verifikasi Pembayaran</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-4">

            @if (session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-3 text-sm">{{ session('success') }}</div>
            @endif
            @if ($errors->any())
                <div class="bg-rose-50 border border-rose-200 text-rose-800 rounded-md p-3 text-sm">{{ $errors->first() }}</div>
            @endif

            <div class="flex gap-2 text-sm">
                @foreach (['pending' => 'Pending', 'approved' => 'Disetujui', 'rejected' => 'Ditolak'] as $v => $l)
                    <a href="{{ route('admin.pembayaran.index', ['status' => $v]) }}"
                       @class([
                            'px-3 py-1.5 rounded-md font-semibold',
                            'bg-indigo-600 text-white' => $status === $v,
                            'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300' => $status !== $v,
                       ])>{{ $l }}</a>
                @endforeach
            </div>

            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="px-4 py-3">Tgl Bayar</th>
                                <th class="px-4 py-3">Penyewa / Kamar</th>
                                <th class="px-4 py-3">Periode</th>
                                <th class="px-4 py-3">Jumlah</th>
                                <th class="px-4 py-3">Bukti</th>
                                <th class="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                            @forelse ($pembayaran as $bayar)
                                <tr class="text-gray-700 dark:text-gray-300">
                                    <td class="px-4 py-3 text-xs">{{ $bayar->tgl_bayar->translatedFormat('d M Y') }}</td>
                                    <td class="px-4 py-3">
                                        <div class="font-medium">{{ $bayar->tagihan->sewa->penyewa->nama_lengkap }}</div>
                                        <div class="text-xs text-gray-500">Kamar {{ $bayar->tagihan->sewa->kamar->nomor_kamar }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-xs">{{ $bayar->tagihan->periode->translatedFormat('M Y') }}</td>
                                    <td class="px-4 py-3">Rp {{ number_format($bayar->jumlah_bayar, 0, ',', '.') }}</td>
                                    <td class="px-4 py-3">
                                        @if ($bayar->bukti_transfer_url)
                                            <a href="{{ $bayar->bukti_transfer_url }}" target="_blank" class="text-indigo-600 hover:underline text-xs">Lihat</a>
                                        @else
                                            <span class="text-xs text-gray-400">—</span>
                                        @endif
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <a href="{{ route('admin.tagihan.show', $bayar->tagihan) }}" class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">Detail tagihan →</a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada pembayaran berstatus <strong>{{ $status }}</strong>.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if ($pembayaran->hasPages())
                    <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700">{{ $pembayaran->links() }}</div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout>
