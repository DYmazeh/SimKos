<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use RuntimeException;

/**
 * Image optimization: resize foto besar ke max 1920px width, convert ke WebP
 * untuk space saving (~70% lebih kecil dari JPEG). Pakai intervention/image v3.
 *
 * Memory note: GD decode raw bitmap = width * height * 4 bytes. Foto 4000x3000
 * = ~48MB plain bitmap, plus salinan saat scaleDown + encoder = bisa exhaust
 * memory_limit default (128M). Render free tier hanya 512MB total RAM, jadi
 * kita bump memory_limit di runtime dan release intermediate buffer ASAP.
 */
class ImageOptimizer
{
    private ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Resize + convert ke WebP. Return path file di disk default.
     *
     * @throws RuntimeException kalau dekode image, encode WebP, atau upload
     *                          ke storage gagal. Caller (controller) bisa
     *                          rollback DB transaction.
     */
    public function optimizeAndStore(
        UploadedFile $file,
        string $directory,
        int $maxWidth = 1920,
        int $quality = 82,
    ): string {
        // Bump memory_limit untuk operasi ini saja — restore sebelum return.
        // 256M cukup untuk foto 4000x3000 (raw + scaled + encoder buffer).
        $prevLimit = ini_get('memory_limit');
        ini_set('memory_limit', '256M');

        try {
            $image = $this->manager->read($file->getRealPath());

            if ($image->width() > $maxWidth) {
                $image->scaleDown(width: $maxWidth);
            }

            $disk = config('filesystems.default');
            $filename = uniqid('img_', true).'.webp';
            $relativePath = trim($directory, '/').'/'.$filename;

            $webpData = $image->toWebp($quality)->toString();
            // Release Intervention image object ASAP supaya GC dapat free bitmap
            // sebelum upload yang juga bisa makan memory (HTTP buffer).
            unset($image);

            $ok = Storage::disk($disk)->put($relativePath, $webpData);
            unset($webpData);

            if ($ok === false) {
                // Disk config punya 'throw' => false, jadi error di-swallow jadi
                // false return. Eskalasi ke exception biar controller bisa rollback.
                throw new RuntimeException("Storage put gagal untuk disk '{$disk}', path '{$relativePath}'.");
            }

            return $relativePath;
        } catch (\Throwable $e) {
            Log::error('ImageOptimizer.optimizeAndStore failed', [
                'original_name' => $file->getClientOriginalName(),
                'size_bytes' => $file->getSize(),
                'directory' => $directory,
                'exception' => $e->getMessage(),
            ]);
            // Re-throw supaya transaction di controller rollback.
            throw $e instanceof RuntimeException
                ? $e
                : new RuntimeException('Gagal memproses foto: '.$e->getMessage(), 0, $e);
        } finally {
            ini_set('memory_limit', $prevLimit);
        }
    }
}
