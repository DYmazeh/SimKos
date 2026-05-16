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
        'peraturan',
        'deposit',
        'min_sewa_bulan',
        'luas_m2',
        'lantai',
    ];

    protected $casts = [
        'harga_bulanan' => 'integer',
        'deposit' => 'integer',
        'min_sewa_bulan' => 'integer',
        'luas_m2' => 'integer',
        'lantai' => 'integer',
        'fasilitas' => 'array',
    ];

    public const STATUS_TERSEDIA = 'tersedia';

    public const STATUS_TERISI = 'terisi';

    public const STATUS_MAINTENANCE = 'maintenance';

    public function sewa(): HasMany
    {
        return $this->hasMany(Sewa::class);
    }

    public function sewaAktif()
    {
        return $this->hasOne(Sewa::class)->where('status', Sewa::STATUS_AKTIF);
    }

    public function foto(): HasMany
    {
        return $this->hasMany(FotoKamar::class)->orderBy('urutan');
    }

    public function komplain(): HasMany
    {
        return $this->hasMany(Komplain::class)->latest();
    }
}
