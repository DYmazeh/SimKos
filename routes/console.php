<?php

use Illuminate\Support\Facades\Schedule;

// Cron daily: generate tagihan H-3 sebelum tanggal jatuh tempo.
// Idempotent — kalau sudah ada untuk periode itu, skip.
Schedule::command('tagihan:generate-h3')
    ->dailyAt('00:01')
    ->name('generate-tagihan-h3')
    ->withoutOverlapping();
