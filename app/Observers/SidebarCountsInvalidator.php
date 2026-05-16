<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Generic observer: invalidate sidebar_counts cache saat model yg trackable
 * berubah. Dipasang ke Tagihan, Pembayaran, Komplain.
 */
class SidebarCountsInvalidator
{
    public function created(Model $model): void { $this->flush(); }
    public function updated(Model $model): void { $this->flush(); }
    public function deleted(Model $model): void { $this->flush(); }
    public function restored(Model $model): void { $this->flush(); }

    private function flush(): void
    {
        Cache::forget('sidebar_counts:admin');
    }
}
