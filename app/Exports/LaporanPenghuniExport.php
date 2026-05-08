<?php

namespace App\Exports;

use App\Models\Sewa;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class LaporanPenghuniExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize
{
    public function __construct(
        private Carbon $start,
        private Carbon $end,
        private string $periode
    ) {}

    public function collection()
    {
        return Sewa::query()
            ->with(['penyewa', 'kamar'])
            ->where('tgl_mulai', '<=', $this->end->toDateString())
            ->where(function ($q) {
                $q->whereNull('tgl_selesai')
                    ->orWhere('tgl_selesai', '>=', $this->start->toDateString());
            })
            ->orderBy('kamar_id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Kamar',
            'Penyewa',
            'No HP',
            'Tgl Mulai',
            'Tgl Selesai',
            'Status',
            'Harga/Bulan (Rp)',
        ];
    }

    public function map($sewa): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $sewa->kamar?->nomor_kamar ?? '-',
            $sewa->penyewa?->nama_lengkap ?? '-',
            $sewa->penyewa?->no_hp ?? '-',
            Carbon::parse($sewa->tgl_mulai)->format('d/m/Y'),
            $sewa->tgl_selesai ? Carbon::parse($sewa->tgl_selesai)->format('d/m/Y') : 'Belum ditentukan',
            ucfirst($sewa->status),
            $sewa->harga_disepakati,
        ];
    }

    public function title(): string
    {
        return 'Penghuni ' . $this->periode;
    }
}
