<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Generate URL untuk file yang disimpan di disk default.
 *
 * Supabase Storage bucket diset Public: OFF (lihat README), jadi URL S3 endpoint
 * yang di-generate `Storage::disk('supabase')->url()` butuh AWS signature dan
 * gak bisa diakses langsung dari browser. Helper ini balikin presigned URL
 * (signed URL berlaku 1 jam) untuk supabase, atau URL public biasa untuk local.
 */
class StorageUrl
{
    public static function for(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $disk = config('filesystems.default');
        $storage = Storage::disk($disk);

        if ($disk === 'supabase') {
            return $storage->temporaryUrl($path, now()->addHour());
        }

        return $storage->url($path);
    }
}
