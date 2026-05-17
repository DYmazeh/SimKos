<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BuktiTransferUploader
{
    /**
     * Upload bukti transfer ke disk default (env FILESYSTEM_DISK).
     * - Dev (FILESYSTEM_DISK=public): simpan ke storage/app/public/bukti-transfer/
     * - Prod (FILESYSTEM_DISK=supabase): simpan ke bucket Supabase
     *
     * Return relative path (bukan full URL) — URL signed di-generate
     * saat ditampilkan via App\Services\StorageUrl::for($path).
     *
     * @return string Relative path file di disk (mis. "bukti-transfer/tagihan-1-...-abc.jpg")
     */
    public function upload(UploadedFile $file, int $tagihanId): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin');
        $filename = sprintf(
            'tagihan-%d-%s-%s.%s',
            $tagihanId,
            now()->format('YmdHis'),
            Str::random(8),
            $ext
        );

        $disk = config('filesystems.default');

        Storage::disk($disk)->putFileAs(
            'bukti-transfer',
            $file,
            $filename,
        );

        return "bukti-transfer/{$filename}";
    }
}
