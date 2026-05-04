<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan {{ $periode }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #111; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        h2 { font-size: 13px; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px solid #999; padding-bottom: 2px; }
        .meta { color: #555; font-size: 10px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
        th { background: #eee; font-size: 10px; text-transform: uppercase; }
        .text-right { text-align: right; }
        .summary { background: #f4f4f4; padding: 8px; margin-top: 8px; }
        .summary div { display: inline-block; margin-right: 30px; }
        .label { color: #555; font-size: 10px; }
        .value { font-weight: bold; font-size: 13px; }
        .empty { text-align: center; color: #999; padding: 20px; font-style: italic; }
    </style>
</head>
<body>
    <h1>{{ config('simkos.nama', 'SIMKOS') }} — Laporan Keuangan</h1>
    <div class="meta">
        Periode: {{ \Carbon\Carbon::createFromFormat('Y-m', $periode)->translatedFormat('F Y') }} ·
        Dicetak: {{ now()->translatedFormat('d F Y H:i') }} WIB
    </div>

    <div class="summary">
        <div>
            <div class="label">Total Pemasukan</div>
            <div class="value" style="color: #047857;">Rp {{ number_format($totalPemasukan, 0, ',', '.') }}</div>
        </div>
        <div>
            <div class="label">Total Piutang</div>
            <div class="value" style="color: #b91c1c;">Rp {{ number_format($totalPiutang, 0, ',', '.') }}</div>
        </div>
    </div>

    <h2>Pemasukan ({{ $pemasukan->count() }} transaksi)</h2>
    <table>
        <thead>
            <tr>
                <th>Tgl Bayar</th>
                <th>Penyewa</th>
                <th>Kamar</th>
                <th>Periode</th>
                <th>Metode</th>
                <th class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($pemasukan as $b)
                <tr>
                    <td>{{ $b->tgl_bayar->translatedFormat('d M Y') }}</td>
                    <td>{{ $b->tagihan->sewa->penyewa->nama_lengkap }}</td>
                    <td>{{ $b->tagihan->sewa->kamar->nomor_kamar }}</td>
                    <td>{{ $b->tagihan->periode->translatedFormat('M Y') }}</td>
                    <td>{{ ucfirst($b->metode) }}</td>
                    <td class="text-right">Rp {{ number_format($b->jumlah_bayar, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="empty">Tidak ada pemasukan di periode ini.</td></tr>
            @endforelse
            @if ($pemasukan->isNotEmpty())
                <tr style="background: #f4f4f4; font-weight: bold;">
                    <td colspan="5" class="text-right">TOTAL</td>
                    <td class="text-right">Rp {{ number_format($totalPemasukan, 0, ',', '.') }}</td>
                </tr>
            @endif
        </tbody>
    </table>

    <h2>Piutang ({{ $piutang->count() }} tagihan)</h2>
    <table>
        <thead>
            <tr>
                <th>Penyewa</th>
                <th>Kamar</th>
                <th>Jatuh Tempo</th>
                <th>Status</th>
                <th class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($piutang as $t)
                <tr>
                    <td>{{ $t->sewa->penyewa->nama_lengkap }}</td>
                    <td>{{ $t->sewa->kamar->nomor_kamar }}</td>
                    <td>{{ $t->tgl_jatuh_tempo->translatedFormat('d M Y') }}</td>
                    <td>{{ str_replace('_', ' ', ucfirst($t->status)) }}</td>
                    <td class="text-right">Rp {{ number_format($t->jumlah, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="empty">Tidak ada piutang di periode ini.</td></tr>
            @endforelse
            @if ($piutang->isNotEmpty())
                <tr style="background: #f4f4f4; font-weight: bold;">
                    <td colspan="4" class="text-right">TOTAL</td>
                    <td class="text-right">Rp {{ number_format($totalPiutang, 0, ',', '.') }}</td>
                </tr>
            @endif
        </tbody>
    </table>

    <p style="margin-top: 30px; font-size: 9px; color: #888; text-align: center;">
        Dokumen ini dihasilkan otomatis oleh sistem SIMKOS.
    </p>
</body>
</html>
