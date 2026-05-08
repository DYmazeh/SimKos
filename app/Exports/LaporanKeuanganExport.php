<?php

namespace App\Exports;

use App\Models\Pembayaran;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class LaporanKeuanganExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize
{
    public function __construct(
        private Carbon $start,
        private Carbon $end,
        private string $periode
    ) {}

    public function collection()
    {
        return Pembayaran::query()
            ->with(['tagihan.sewa.penyewa', 'tagihan.sewa.kamar'])
            ->where('status_verifikasi', Pembayaran::STATUS_APPROVED)
            ->whereBetween('tgl_bayar', [$this->start->toDateString(), $this->end->toDateString()])
            ->orderBy('tgl_bayar')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Tanggal Bayar',
            'Penyewa',
            'Kamar',
            'Periode Tagihan',
            'Jumlah Bayar (Rp)',
            'Metode',
            'Status',
        ];
    }

    public function map($pembayaran): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            Carbon::parse($pembayaran->tgl_bayar)->format('d/m/Y'),
            $pembayaran->tagihan?->sewa?->penyewa?->nama_lengkap ?? '-',
            $pembayaran->tagihan?->sewa?->kamar?->nomor_kamar ?? '-',
            Carbon::parse($pembayaran->tagihan?->periode)->translatedFormat('F Y'),
            $pembayaran->jumlah_bayar,
            ucfirst($pembayaran->metode),
            'Lunas',
        ];
    }

    public function title(): string
    {
        return 'Keuangan ' . $this->periode;
    }
}
