<?php

namespace App\Http\Requests\Admin;

use App\Models\Kamar;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKamarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        $kamarId = $this->route('kamar')?->id ?? $this->route('kamar');

        return [
            'nomor_kamar' => [
                'required', 'string', 'max:20',
                Rule::unique('kamar', 'nomor_kamar')->ignore($kamarId),
            ],
            'tipe' => ['required', 'string', 'in:standar,deluxe,vip'],
            'harga_bulanan' => ['required', 'integer', 'min:0', 'max:99999999'],
            // Status 'terisi' boleh muncul di payload (untuk kamar yang sudah terisi),
            // tapi controller enforce: admin tidak boleh ubah dari tersedia/maintenance → terisi
            // (itu hanya lewat flow daftar penyewa baru).
            'status' => ['required', 'string', Rule::in([
                Kamar::STATUS_TERSEDIA,
                Kamar::STATUS_TERISI,
                Kamar::STATUS_MAINTENANCE,
            ])],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'fasilitas' => ['nullable', 'string', 'max:1000'],
            'luas_m2' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'lantai' => ['nullable', 'integer', 'min:1', 'max:99'],
        ];
    }
}
