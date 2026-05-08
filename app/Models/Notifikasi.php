<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notifikasi extends Model
{
    protected $table = 'notifikasi';

    protected $fillable = [
        'user_id',
        'judul',
        'pesan',
        'tipe',
        'is_read',
        'url_referensi',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    // Tipe constants
    public const TIPE_PEMBAYARAN = 'pembayaran';
    public const TIPE_TAGIHAN = 'tagihan';
    public const TIPE_SISTEM = 'sistem';
    public const TIPE_KONTRAK = 'kontrak';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
