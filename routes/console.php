<?php

use Illuminate\Support\Facades\Schedule;

// Cron daily: generate tagihan H-3 sebelum tanggal jatuh tempo.
// Idempotent — kalau sudah ada untuk periode itu, skip.
Schedule::command('tagihan:generate-h3')
    ->dailyAt('00:01')
    ->name('generate-tagihan-h3')
    ->withoutOverlapping();

// FR-012 + FR-021: Akhiri sewa yang lewat tgl_selesai (set kamar → tersedia)
// dan kirim notif kontrak yang mendekati berakhir (default H-3).
Schedule::command('sewa:update-expired')
    ->dailyAt('00:05')
    ->name('update-expired-sewa')
    ->withoutOverlapping();
