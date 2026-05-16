<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FotoKomplain extends Model
{
    protected $table = 'foto_komplain';

    protected $fillable = ['komplain_id', 'url'];

    public function komplain(): BelongsTo
    {
        return $this->belongsTo(Komplain::class);
    }
}
