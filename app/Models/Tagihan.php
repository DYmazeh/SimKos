<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tagihan extends Model
{
    use HasFactory;

    protected $table = 'tagihan';

    protected $fillable = [
        'sewa_id',
        'periode',
        'jumlah',
        'tgl_jatuh_tempo',
        'status',
    ];

    protected $casts = [
        'periode' => 'date',
        'tgl_jatuh_tempo' => 'date',
        'jumlah' => 'integer',
    ];

    public const STATUS_BELUM_BAYAR = 'belum_bayar';

    public const STATUS_MENUNGGU_VERIFIKASI = 'menunggu_verifikasi';

    public const STATUS_LUNAS = 'lunas';

    public const STATUS_TERLAMBAT = 'terlambat';

    public function sewa(): BelongsTo
    {
        return $this->belongsTo(Sewa::class);
    }

    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class);
    }

    public function isOverdue(): bool
    {
        return in_array($this->status, [self::STATUS_BELUM_BAYAR, self::STATUS_TERLAMBAT])
            && Carbon::parse($this->tgl_jatuh_tempo)->isPast();
    }
}
