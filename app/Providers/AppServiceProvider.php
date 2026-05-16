<?php

namespace App\Providers;

use App\Listeners\LogSuccessfulLogin;
use App\Models\Komplain;
use App\Models\Pembayaran;
use App\Models\Tagihan;
use App\Observers\SidebarCountsInvalidator;
use Illuminate\Auth\Events\Login;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // FR-006: Log login activity
        Event::listen(Login::class, LogSuccessfulLogin::class);

        // FR-012 + FR-021: Auto-expire sewa & kontrak reminder (run daily)
        $this->app->booted(function () {
            /** @var Schedule $schedule */
            $schedule = $this->app->make(Schedule::class);
            $schedule->command('sewa:update-expired')->daily();
        });

        // Cache invalidation untuk sidebar_counts saat data-source berubah.
        Tagihan::observe(SidebarCountsInvalidator::class);
        Pembayaran::observe(SidebarCountsInvalidator::class);
        Komplain::observe(SidebarCountsInvalidator::class);
    }
}

