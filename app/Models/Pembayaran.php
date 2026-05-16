<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Pembayaran extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status_verifikasi', 'diverifikasi_oleh', 'jumlah_bayar', 'catatan'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('pembayaran');
    }

    protected $table = 'pembayaran';

    protected $fillable = [
        'tagihan_id',
        'tgl_bayar',
        'jumlah_bayar',
        'metode',
        'bukti_transfer_url',
        'status_verifikasi',
        'diverifikasi_oleh',
        'verified_at',
        'catatan',
    ];

    protected $casts = [
        'tgl_bayar' => 'date',
        'verified_at' => 'datetime',
        'jumlah_bayar' => 'integer',
    ];

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public function tagihan(): BelongsTo
    {
        return $this->belongsTo(Tagihan::class);
    }

    public function verifikator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }
}
