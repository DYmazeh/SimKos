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
        ];
    }

    public function messages(): array
    {
        return [
            'judul.min' => 'Judul minimal 5 karakter.',
            'deskripsi.min' => 'Deskripsi minimal 10 karakter — jelaskan masalahnya secukupnya supaya pengelola bisa bantu.',
        ];
    }
}
