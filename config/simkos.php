<?php

return [
    'nama' => env('SIMKOS_KOS_NAMA', 'Kos Sejahtera'),
    'alamat' => env('SIMKOS_KOS_ALAMAT', 'Jl. Dn. Batur Gg. Kibang No.21, RT./12/RW.LK/01, Surabaya, Kec. Kedaton, Kota Bandar Lampung, Lampung'),

    // Nomor WhatsApp pengelola (format 08xx / 62xx) — di-render ke wa.me/62xxx
    'wa_number' => env('SIMKOS_WA_NUMBER', '081385748661'),

    // Profil pengelola untuk section "Tentang Pengelola"
    'pengelola_nama' => env('SIMKOS_PENGELOLA_NAMA', 'Pengelola Kos'),
    'pengelola_sejak' => env('SIMKOS_PENGELOLA_SEJAK', '2018'),
    'pengelola_bio' => env('SIMKOS_PENGELOLA_BIO', 'Mengelola kos dengan prinsip jujur soal biaya, responsif terhadap keluhan, dan menjaga properti agar selalu nyaman untuk seluruh penghuni.'),

    /*
     * Berapa hari sebelum jatuh tempo tagihan masuk widget reminder admin.
     */
    'reminder_days' => (int) env('SIMKOS_REMINDER_DAYS', 3),

    /*
     * Tanggal tetap jatuh tempo tagihan setiap bulan.
     */
    'jatuh_tempo_tanggal' => (int) env('SIMKOS_JATUH_TEMPO_TANGGAL', 5),

    /*
     * Token rahasia untuk endpoint /cron/run (webhook alternatif scheduler
     * karena Render free tier tidak support cron). Wajib di-set di production —
     * tanpa token, endpoint akan selalu abort 403.
     */
    'cron_token' => env('SIMKOS_CRON_TOKEN', ''),

    /*
     * Token rahasia untuk endpoint /auth/google/setup. One-time setup utk
     * dapat refresh_token Gmail API. Setelah selesai, token boleh di-unset.
     */
    'oauth_setup_token' => env('SIMKOS_OAUTH_SETUP_TOKEN', ''),
];
