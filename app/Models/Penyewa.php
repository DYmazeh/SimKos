<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Penyewa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'penyewa';

    protected $fillable = [
        'user_id',
        'nama_lengkap',
        'no_ktp',
        'no_hp',
        'alamat_asal',
        'foto_ktp_url',
        'status_aktif',
        'catatan',
    ];

    public const STATUS_AKTIF = 'aktif';
    public const STATUS_NONAKTIF = 'nonaktif';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sewa(): HasMany
    {
        return $this->hasMany(Sewa::class);
    }

    public function sewaAktif(): HasOne
    {
        return $this->hasOne(Sewa::class)->where('status', Sewa::STATUS_AKTIF);
    }

    public function komplain(): HasMany
    {
        return $this->hasMany(Komplain::class)->latest();
    }
}
