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
     * @return string URL publik bukti transfer
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

        $path = "bukti-transfer/{$filename}";
        $disk = config('filesystems.default');

        Storage::disk($disk)->putFileAs(
            'bukti-transfer',
            $file,
            $filename,
            ['visibility' => 'public']
        );

        return Storage::disk($disk)->url($path);
    }
}
