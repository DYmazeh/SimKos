<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StorePenyewaRequest extends FormRequest
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
            'buat_akun' => ['nullable', 'boolean'],
            'email' => ['required_if:buat_akun,1', 'nullable', 'email', 'max:255', Rule::unique(User::class, 'email')],
            'password' => ['required_if:buat_akun,1', 'nullable', Password::defaults()],
        ];
    }

    public function messages(): array
    {
        return [
            'no_hp.regex' => 'Format nomor HP harus valid (08xx, 62xx, atau +62xx).',
            'email.required_if' => 'Email wajib diisi kalau membuat akun login penyewa.',
            'password.required_if' => 'Password awal wajib diisi kalau membuat akun login penyewa.',
        ];
    }

    public function isCreatingAccount(): bool
    {
        return (bool) $this->boolean('buat_akun');
    }
}
