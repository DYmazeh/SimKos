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
            'catatan' => ['nullable', 'string', 'max:1000'],
            'foto_ktp' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'no_hp.regex' => 'Format nomor HP harus valid (08xx, 62xx, atau +62xx).',
            'foto_ktp.max' => 'Ukuran foto KTP maksimal 5MB.',
            'foto_ktp.mimes' => 'Format file foto KTP harus berupa JPG, JPEG, PNG, atau WebP.',
            'foto_ktp.image' => 'File foto KTP harus berupa gambar.',
        ];
    }
}
