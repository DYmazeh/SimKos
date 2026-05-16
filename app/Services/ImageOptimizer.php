<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

/**
 * Image optimization: resize foto besar ke max 1920px width, convert ke WebP
 * untuk space saving (~70% lebih kecil dari JPEG). Pakai intervention/image v3.
 *
 * Workflow upload:
 *   $optimized = $optimizer->optimize($request->file('foto'));
 *   $path = Storage::disk('s3')->putFileAs('kamar/1', $optimized, 'thumb.webp');
 */
class ImageOptimizer
{
    private ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Resize + convert ke WebP. Return path file di temporary storage.
     */
    public function optimizeAndStore(
        UploadedFile $file,
        string $directory,
        int $maxWidth = 1920,
        int $quality = 82,
    ): string {
        $image = $this->manager->read($file->getRealPath());

        // Scale down kalau lebih besar dari maxWidth (jangan upscale)
        if ($image->width() > $maxWidth) {
            $image->scaleDown(width: $maxWidth);
        }

        $disk = config('filesystems.default');
        $filename = uniqid('img_', true).'.webp';
        $relativePath = trim($directory, '/').'/'.$filename;

        $webpData = $image->toWebp($quality)->toString();
        Storage::disk($disk)->put($relativePath, $webpData);

        return $relativePath;
    }
}
