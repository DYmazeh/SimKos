<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Komplain extends Model
{
    use HasFactory;

    protected $table = 'komplain';

    protected $fillable = [
        'kamar_id',
        'penyewa_id',
        'judul',
        'deskripsi',
        'status',
        'resolved_by_admin_id',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public const STATUS_MENUNGGU = 'menunggu';
    public const STATUS_DIPROSES = 'diproses';
    public const STATUS_SELESAI = 'selesai';

    public function kamar(): BelongsTo
    {
        return $this->belongsTo(Kamar::class);
    }

    public function penyewa(): BelongsTo
    {
        return $this->belongsTo(Penyewa::class);
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by_admin_id');
    }

    public function scopeAktif($query)
    {
        return $query->whereNot('status', self::STATUS_SELESAI);
    }
}
