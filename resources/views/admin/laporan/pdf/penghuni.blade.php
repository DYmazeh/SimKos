<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Penghuni {{ $periode }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #111; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        .meta { color: #555; font-size: 10px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; }
        th { background: #eee; font-size: 10px; text-transform: uppercase; }
        .summary { background: #f4f4f4; padding: 8px; margin-top: 8px; margin-bottom: 14px; }
        .summary div { display: inline-block; margin-right: 30px; }
        .label { color: #555; font-size: 10px; }
        .value { font-weight: bold; font-size: 13px; }
        .empty { text-align: center; color: #999; padding: 20px; font-style: italic; }
    </style>
</head>
<body>
    <h1>{{ config('simkos.nama', 'SIMKOS') }} — Rekap Penghuni</h1>
    <div class="meta">
        Periode: {{ \Carbon\Carbon::createFromFormat('Y-m', $periode)->translatedFormat('F Y') }} ·
        Dicetak: {{ now()->translatedFormat('d F Y H:i') }} WIB
    </div>

    <div class="summary">
        <div>
            <div class="label">Penghuni Aktif (saat ini)</div>
            <div class="value" style="color: #047857;">{{ $totalAktifSekarang }}</div>
        </div>
        <div>
            <div class="label">Selesai dalam periode</div>
            <div class="value">{{ $totalSelesaiPeriode }}</div>
        </div>
        <div>
            <div class="label">Total dalam laporan</div>
            <div class="value">{{ $sewaPeriode->count() }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Kamar</th>
                <th>Penyewa</th>
                <th>No HP</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($sewaPeriode as $s)
                <tr>
                    <td>{{ $s->kamar->nomor_kamar }}</td>
                    <td>{{ $s->penyewa->nama_lengkap }}</td>
                    <td>{{ $s->penyewa->no_hp }}</td>
                    <td>{{ $s->tgl_mulai->translatedFormat('d M Y') }}</td>
                    <td>{{ $s->tgl_selesai?->translatedFormat('d M Y') ?? '—' }}</td>
                    <td>{{ ucfirst($s->status) }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="empty">Tidak ada penghuni dalam periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>

    <p style="margin-top: 30px; font-size: 9px; color: #888; text-align: center;">
        Dokumen ini dihasilkan otomatis oleh sistem SIMKOS.
    </p>
</body>
</html>
