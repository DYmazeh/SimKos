<?php

namespace App\Http\Requests\Admin;

use App\Models\Kamar;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKamarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'nomor_kamar' => ['required', 'string', 'max:20', Rule::unique('kamar', 'nomor_kamar')],
            'tipe' => ['required', 'string', 'in:standar,deluxe,vip'],
            'harga_bulanan' => ['required', 'integer', 'min:0', 'max:99999999'],
            // Kamar baru tidak boleh langsung 'terisi' — status itu hanya muncul
            // setelah admin daftarkan penyewa + buat kontrak sewa.
            'status' => ['required', 'string', Rule::in([
                Kamar::STATUS_TERSEDIA,
                Kamar::STATUS_MAINTENANCE,
            ])],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
            'fasilitas' => ['nullable', 'string', 'max:1000'],
            'luas_m2' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'lantai' => ['nullable', 'integer', 'min:1', 'max:99'],
            'foto' => ['nullable', 'array', 'max:5'],
            'foto.*' => ['file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nomor_kamar' => 'nomor kamar',
            'harga_bulanan' => 'harga bulanan',
        ];
    }
}
