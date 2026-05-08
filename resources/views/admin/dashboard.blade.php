<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Dashboard Admin
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                <p class="text-gray-700 dark:text-gray-300">
                    Halo, <span class="font-semibold">{{ auth()->user()->name }}</span> 👋 — Selamat datang kembali di SIMKOS.
                </p>
            </div>

            {{-- KPI Cards --}}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                @php
                    $cards = [
                        ['label' => 'Total Kamar', 'value' => $stats['total_kamar'], 'color' => 'bg-blue-500'],
                        ['label' => 'Kamar Terisi', 'value' => $stats['kamar_terisi'], 'color' => 'bg-emerald-500'],
                        ['label' => 'Kamar Tersedia', 'value' => $stats['kamar_tersedia'], 'color' => 'bg-amber-500'],
                        ['label' => 'Maintenance', 'value' => $stats['kamar_maintenance'], 'color' => 'bg-gray-500'],
                        ['label' => 'Sewa Aktif', 'value' => $stats['sewa_aktif'], 'color' => 'bg-indigo-500'],
                        ['label' => 'Tagihan Perlu Diingatkan', 'value' => $stats['tagihan_jatuh_tempo_horizon'], 'color' => 'bg-rose-500'],
                        ['label' => 'Bukti Menunggu Verifikasi', 'value' => $stats['menunggu_verifikasi'], 'color' => 'bg-purple-500'],
                        ['label' => 'Pemasukan Bulan Ini', 'value' => 'Rp ' . number_format($stats['pemasukan_bulan_ini'], 0, ',', '.'), 'color' => 'bg-teal-500'],
                    ];
                @endphp

                @foreach ($cards as $c)
                    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div class="p-4 flex items-start gap-3">
                            <div class="w-2 h-12 rounded {{ $c['color'] }}"></div>
                            <div class="flex-1">
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $c['label'] }}</p>
                                <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{{ $c['value'] }}</p>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>

            {{-- Pengingat Pembayaran --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">📋 Pengingat Pembayaran</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Tagihan yang jatuh tempo dalam {{ config('simkos.reminder_days', 7) }} hari ke depan atau sudah lewat
                        </p>
                    </div>
                    <a href="{{ route('admin.tagihan.index', ['status' => 'terlambat']) }}" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Lihat semua →</a>
                </div>

                @if ($reminderList->isEmpty())
                    <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        🎉 Tidak ada tagihan yang perlu diingatkan saat ini.
                    </div>
                @else
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th class="px-4 py-3">Penyewa</th>
                                    <th class="px-4 py-3">Kamar</th>
                                    <th class="px-4 py-3">Periode</th>
                                    <th class="px-4 py-3">Jumlah</th>
                                    <th class="px-4 py-3">Jatuh Tempo</th>
                                    <th class="px-4 py-3">Status</th>
                                    <th class="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                                @foreach ($reminderList as $t)
                                    @php
                                        $waLink = \App\Services\WhatsappReminderLink::make($t->sewa->penyewa, $t);
                                        $isOverdue = $t->status === 'terlambat';
                                        $daysUntil = \Carbon\Carbon::today()->diffInDays($t->tgl_jatuh_tempo, false);
                                    @endphp
                                    <tr class="text-gray-700 dark:text-gray-300 {{ $isOverdue ? 'bg-rose-50/50 dark:bg-rose-900/10' : '' }}">
                                        <td class="px-4 py-3 font-medium">{{ $t->sewa->penyewa->nama_lengkap }}</td>
                                        <td class="px-4 py-3">{{ $t->sewa->kamar->nomor_kamar }}</td>
                                        <td class="px-4 py-3 text-xs">{{ $t->periode->translatedFormat('M Y') }}</td>
                                        <td class="px-4 py-3">Rp {{ number_format($t->jumlah, 0, ',', '.') }}</td>
                                        <td class="px-4 py-3 text-xs">
                                            <div>{{ $t->tgl_jatuh_tempo->translatedFormat('d M Y') }}</div>
                                            <div class="text-gray-500">
                                                @if ($daysUntil < 0)
                                                    <span class="text-rose-600 font-semibold">Lewat {{ abs($daysUntil) }} hari</span>
                                                @elseif ($daysUntil === 0)
                                                    <span class="text-amber-600 font-semibold">Hari ini</span>
                                                @else
                                                    {{ $daysUntil }} hari lagi
                                                @endif
                                            </div>
                                        </td>
                                        <td class="px-4 py-3">
                                            <span @class([
                                                'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                                'bg-rose-100 text-rose-800' => $t->status === 'terlambat',
                                                'bg-amber-100 text-amber-800' => $t->status === 'belum_bayar',
                                            ])>{{ str_replace('_', ' ', ucfirst($t->status)) }}</span>
                                        </td>
                                        <td class="px-4 py-3 text-right">
                                            @if ($waLink)
                                                <a href="{{ $waLink }}" target="_blank" rel="noopener noreferrer"
                                                   class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-xs font-semibold">
                                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                                    </svg>
                                                    Ingatkan
                                                </a>
                                            @else
                                                <span class="text-xs text-gray-400" title="Nomor HP tidak valid">No HP invalid</span>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>

            {{-- Bukti menunggu verifikasi --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">🧾 Bukti Menunggu Verifikasi</h3>
                    <a href="{{ route('admin.pembayaran.index') }}" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Lihat semua →</a>
                </div>

                @if ($verifikasiList->isEmpty())
                    <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Tidak ada bukti pembayaran yang menunggu verifikasi.
                    </div>
                @else
                    <ul class="divide-y divide-gray-100 dark:divide-gray-700">
                        @foreach ($verifikasiList as $bayar)
                            <li class="p-4 flex items-center justify-between text-sm">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ $bayar->tagihan->sewa->penyewa->nama_lengkap }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                        Kamar {{ $bayar->tagihan->sewa->kamar->nomor_kamar }} ·
                                        Periode {{ $bayar->tagihan->periode->translatedFormat('M Y') }} ·
                                        Rp {{ number_format($bayar->jumlah_bayar, 0, ',', '.') }}
                                    </p>
                                </div>
                                <a href="{{ route('admin.tagihan.show', $bayar->tagihan) }}"
                                   class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold">Verifikasi →</a>
                            </li>
                        @endforeach
                    </ul>
                @endif
            </div>

            {{-- FR-043: Grafik Pendapatan Bulanan --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">📊 Pendapatan 12 Bulan Terakhir</h3>
                </div>
                <div class="p-6">
                    <canvas id="chartPendapatan" height="100"></canvas>
                </div>
            </div>

            {{-- FR-047: Kamar Akan Kosong dalam 30 Hari --}}
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">🏠 Kamar Akan Kosong (30 Hari)</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Kontrak sewa yang akan berakhir dalam 30 hari ke depan</p>
                </div>

                @if ($kamarAkanKosong->isEmpty())
                    <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Tidak ada kamar yang akan kosong dalam 30 hari ke depan.
                    </div>
                @else
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead class="bg-gray-50 dark:bg-gray-700/40 text-left text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th class="px-4 py-3">Kamar</th>
                                    <th class="px-4 py-3">Penyewa</th>
                                    <th class="px-4 py-3">Kontrak Berakhir</th>
                                    <th class="px-4 py-3">Sisa Hari</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                                @foreach ($kamarAkanKosong as $sewa)
                                    @php $sisaHari = \Carbon\Carbon::today()->diffInDays($sewa->tgl_selesai, false); @endphp
                                    <tr class="text-gray-700 dark:text-gray-300">
                                        <td class="px-4 py-3 font-medium">{{ $sewa->kamar?->nomor_kamar ?? '-' }}</td>
                                        <td class="px-4 py-3">{{ $sewa->penyewa?->nama_lengkap ?? '-' }}</td>
                                        <td class="px-4 py-3 text-xs">{{ \Carbon\Carbon::parse($sewa->tgl_selesai)->translatedFormat('d M Y') }}</td>
                                        <td class="px-4 py-3">
                                            <span @class([
                                                'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
                                                'bg-rose-100 text-rose-800' => $sisaHari <= 7,
                                                'bg-amber-100 text-amber-800' => $sisaHari > 7 && $sisaHari <= 14,
                                                'bg-blue-100 text-blue-800' => $sisaHari > 14,
                                            ])>{{ $sisaHari }} hari</span>
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

    @push('scripts')
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const ctx = document.getElementById('chartPendapatan');
            if (!ctx) return;

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: @json($chartData['labels']),
                    datasets: [{
                        label: 'Pendapatan (Rp)',
                        data: @json($chartData['values']),
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 1,
                        borderRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Rp ' + context.parsed.y.toLocaleString('id-ID');
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
                                }
                            }
                        }
                    }
                }
            });
        });
    </script>
    @endpush
</x-app-layout>

