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
            'bukti' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'bukti.required' => 'Bukti transfer wajib diunggah (JPG/PNG/PDF, max 2MB).',
            'bukti.mimes' => 'Format file harus JPG, PNG, atau PDF.',
            'bukti.max' => 'Ukuran file maksimal 5MB.',
            'tgl_bayar.before_or_equal' => 'Tanggal bayar tidak boleh di masa depan.',
        ];
    }
}
