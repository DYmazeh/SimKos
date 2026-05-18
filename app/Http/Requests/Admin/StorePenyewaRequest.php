<?php

namespace App\Http\Requests\Admin;

use App\Models\Kamar;
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
            // Data Pribadi
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'no_hp' => ['required', 'string', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,11}$/'],
            'no_ktp' => ['nullable', 'string', 'max:30'],
            'alamat_asal' => ['nullable', 'string', 'max:1000'],
            'catatan' => ['nullable', 'string', 'max:1000'],
            'foto_ktp' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],

            // Akun Login
            'buat_akun' => ['nullable', 'boolean'],
            'email' => ['required_if:buat_akun,1', 'nullable', 'email', 'max:255', Rule::unique(User::class, 'email')],
            'password' => ['required_if:buat_akun,1', 'nullable', Password::defaults()],

            // Kontrak Sewa (opsional saat create — admin bisa juga assign nanti dari halaman detail)
            'kamar_id' => ['nullable', 'integer', Rule::exists(Kamar::class, 'id')],
            'tgl_mulai' => ['nullable', 'required_with:kamar_id', 'date'],
            'tgl_selesai' => ['nullable', 'date', 'after:tgl_mulai'],
            'harga_disepakati' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'no_hp.regex' => 'Format nomor HP harus valid (08xx, 62xx, atau +62xx).',
            'email.required_if' => 'Email wajib diisi kalau membuat akun login penyewa.',
            'password.required_if' => 'Password awal wajib diisi kalau membuat akun login penyewa.',
            'foto_ktp.max' => 'Ukuran foto KTP maksimal 5MB.',
            'foto_ktp.mimes' => 'Format file foto KTP harus berupa JPG, JPEG, PNG, atau WebP.',
            'foto_ktp.image' => 'File foto KTP harus berupa gambar.',
            'tgl_mulai.required_with' => 'Tanggal mulai sewa wajib diisi kalau memilih kamar.',
            'tgl_selesai.after' => 'Tanggal akhir harus setelah tanggal mulai.',
        ];
    }

    public function isCreatingAccount(): bool
    {
        return (bool) $this->boolean('buat_akun');
    }

    public function hasKontrakSewa(): bool
    {
        return (bool) $this->input('kamar_id');
    }
}
