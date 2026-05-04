<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePenyewaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'no_hp' => ['required', 'string', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,11}$/'],
            'no_ktp' => ['nullable', 'string', 'max:30'],
            'alamat_asal' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'no_hp.regex' => 'Format nomor HP harus valid (08xx, 62xx, atau +62xx).',
        ];
    }
}
