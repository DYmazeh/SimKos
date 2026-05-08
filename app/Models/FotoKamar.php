<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FotoKamar extends Model
{
    protected $table = 'foto_kamar';

    protected $fillable = [
        'kamar_id',
        'url',
        'urutan',
    ];

    public function kamar(): BelongsTo
    {
        return $this->belongsTo(Kamar::class);
    }
}
