<?php

namespace App\Http\Requests\Penyewa;

use Illuminate\Foundation\Http\FormRequest;

class StoreKomplainRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('penyewa') ?? false;
    }

    public function rules(): array
    {
        return [
            'judul' => ['required', 'string', 'min:5', 'max:200'],
            'deskripsi' => ['required', 'string', 'min:10', 'max:2000'],
            'foto' => ['nullable', 'array', 'max:3'],
            'foto.*' => ['file', 'mimetypes:image/jpeg,image/png,image/webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'judul.min' => 'Judul minimal 5 karakter.',
            'deskripsi.min' => 'Deskripsi minimal 10 karakter — jelaskan masalahnya secukupnya supaya pengelola bisa bantu.',
            'foto.max' => 'Maksimal 3 foto per komplen.',
            'foto.*.mimetypes' => 'Foto harus JPG, PNG, atau WebP.',
            'foto.*.max' => 'Ukuran foto maksimal 5MB.',
        ];
    }
}
