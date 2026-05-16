<?php

namespace App\Http\Requests\Penyewa;

use Illuminate\Foundation\Http\FormRequest;

class StoreBuktiTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('penyewa') ?? false;
    }

    public function rules(): array
    {
        return [
            'tgl_bayar' => ['required', 'date', 'before_or_equal:today'],
            'jumlah_bayar' => ['required', 'integer', 'min:1', 'max:99999999'],
            'metode' => ['required', 'string', 'in:transfer,tunai'],
            // mimetypes (vs mimes): validate MIME via file header, mencegah rename
            // attack (e.g. .exe rename jadi .jpg masih lolos `mimes`).
            'bukti' => [
                'required', 'file',
                'mimetypes:image/jpeg,image/png,image/webp,application/pdf',
                'max:5120',
            ],
            'catatan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'bukti.required' => 'Bukti transfer wajib diunggah.',
            'bukti.mimetypes' => 'Format file harus JPG, PNG, WebP, atau PDF (header MIME tidak valid).',
            'bukti.max' => 'Ukuran file maksimal 5MB.',
            'tgl_bayar.before_or_equal' => 'Tanggal bayar tidak boleh di masa depan.',
        ];
    }
}
