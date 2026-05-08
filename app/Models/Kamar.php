<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kamar extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'kamar';

    protected $fillable = [
        'nomor_kamar',
        'tipe',
        'harga_bulanan',
        'status',
        'deskripsi',
        'fasilitas',
        'luas_m2',
        'lantai',
    ];

    protected $casts = [
        'harga_bulanan' => 'integer',
        'luas_m2' => 'decimal:2',
        'lantai' => 'integer',
    ];

    public const STATUS_TERSEDIA = 'tersedia';

    public const STATUS_TERISI = 'terisi';

    public const STATUS_MAINTENANCE = 'maintenance';

    public function sewa(): HasMany
    {
        return $this->hasMany(Sewa::class);
    }

    public function foto(): HasMany
    {
        return $this->hasMany(FotoKamar::class)->orderBy('urutan');
    }

    public function sewaAktif()
    {
        return $this->hasOne(Sewa::class)->where('status', Sewa::STATUS_AKTIF);
    }
}
