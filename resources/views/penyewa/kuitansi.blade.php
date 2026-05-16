<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kuitansi #{{ $pembayaran->id }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; color: #0b0d1a; margin: 0; padding: 40px; font-size: 12px; }
        .header { border-bottom: 2px solid #0b0d1a; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: -0.02em; }
        .header .meta { color: #5b6079; font-size: 11px; margin-top: 4px; }
        .receipt-title { text-align: center; font-size: 18px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin: 32px 0 8px; }
        .receipt-no { text-align: center; color: #5b6079; font-size: 11px; margin-bottom: 24px; }
        .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .info-grid td { padding: 8px 0; vertical-align: top; }
        .info-grid td.label { width: 30%; color: #5b6079; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; }
        .info-grid td.value { color: #0b0d1a; font-weight: 500; }
        .amount-box { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center; }
        .amount-box .label { font-size: 11px; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
        .amount-box .value { font-size: 28px; font-weight: 700; color: #0b0d1a; margin-top: 8px; letter-spacing: -0.02em; }
        .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #d8dbe7; color: #5b6079; font-size: 11px; line-height: 1.6; }
        .signature { margin-top: 40px; }
        .signature-box { display: inline-block; width: 200px; text-align: center; }
        .signature-line { border-bottom: 1px solid #0b0d1a; margin-top: 60px; margin-bottom: 4px; }
        .stamp { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $kos['nama'] }}</h1>
        <div class="meta">{{ $kos['alamat'] }}</div>
    </div>

    <div class="receipt-title">Kuitansi Pembayaran</div>
    <div class="receipt-no">No. #TRX-{{ $pembayaran->created_at->format('Ymd') }}-{{ str_pad($pembayaran->id, 3, '0', STR_PAD_LEFT) }}</div>

    <table class="info-grid">
        <tr>
            <td class="label">Telah diterima dari</td>
            <td class="value">{{ $pembayaran->tagihan->sewa->penyewa->nama_lengkap }}</td>
        </tr>
        <tr>
            <td class="label">Untuk pembayaran</td>
            <td class="value">Sewa Kamar {{ $pembayaran->tagihan->sewa->kamar->nomor_kamar ?? '-' }} ({{ strtoupper($pembayaran->tagihan->sewa->kamar->tipe ?? '-') }})</td>
        </tr>
        <tr>
            <td class="label">Periode</td>
            <td class="value">{{ $pembayaran->tagihan->periode->translatedFormat('F Y') }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal bayar</td>
            <td class="value">{{ $pembayaran->tgl_bayar->translatedFormat('d F Y') }}</td>
        </tr>
        <tr>
            <td class="label">Metode</td>
            <td class="value">{{ ucfirst($pembayaran->metode) }}</td>
        </tr>
        <tr>
            <td class="label">Status</td>
            <td class="value"><span class="stamp">Lunas</span></td>
        </tr>
    </table>

    <div class="amount-box">
        <div class="label">Jumlah Pembayaran</div>
        <div class="value">Rp {{ number_format($pembayaran->jumlah_bayar, 0, ',', '.') }}</div>
    </div>

    <div class="signature">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div>{{ $kos['pengelola_nama'] }}</div>
            <div style="color: #5b6079; font-size: 11px; margin-top: 2px;">Pengelola Kos</div>
        </div>
    </div>

    <div class="footer">
        Kuitansi ini dibuat otomatis oleh sistem SIMKOS dan sah tanpa tanda tangan basah.
        Diverifikasi {{ optional($pembayaran->verified_at)->translatedFormat('d F Y H:i') ?? '-' }}.
    </div>
</body>
</html>
