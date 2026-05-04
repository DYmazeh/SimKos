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
            'status' => ['required', 'string', Rule::in([
                Kamar::STATUS_TERSEDIA,
                Kamar::STATUS_TERISI,
                Kamar::STATUS_MAINTENANCE,
            ])],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
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
