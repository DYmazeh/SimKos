<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sewa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'sewa';

    protected $fillable = [
        'penyewa_id',
        'kamar_id',
        'tgl_mulai',
        'tgl_selesai',
        'harga_disepakati',
        'status',
    ];

    protected $casts = [
        'tgl_mulai' => 'date',
        'tgl_selesai' => 'date',
        'harga_disepakati' => 'integer',
    ];

    public const STATUS_AKTIF = 'aktif';
    public const STATUS_SELESAI = 'selesai';
    public const STATUS_DIBATALKAN = 'dibatalkan';

    public function penyewa(): BelongsTo
    {
        return $this->belongsTo(Penyewa::class);
    }

    public function kamar(): BelongsTo
    {
        return $this->belongsTo(Kamar::class);
    }

    public function tagihan(): HasMany
    {
        return $this->hasMany(Tagihan::class);
    }
}
