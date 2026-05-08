<?php

return [
    'nama' => env('SIMKOS_KOS_NAMA', 'Kos Sejahtera'),
    'alamat' => env('SIMKOS_KOS_ALAMAT', ''),
    'kontak_hp' => env('SIMKOS_KONTAK_HP', ''),

    /*
     * Berapa hari sebelum jatuh tempo tagihan masuk widget reminder admin.
     * Contoh: 7 berarti tagihan jatuh tempo dalam 7 hari ke depan
     * (atau yang sudah lewat) akan ditampilkan.
     */
    'reminder_days' => (int) env('SIMKOS_REMINDER_DAYS', 7),

    /*
     * Tanggal tetap jatuh tempo tagihan setiap bulan.
     * Mis. 5 = setiap tanggal 5.
     */
    'jatuh_tempo_tanggal' => (int) env('SIMKOS_JATUH_TEMPO_TANGGAL', 5),

    /*
     * Rekening untuk instruksi pembayaran (FR-024)
     */
    'rekening_bank' => env('SIMKOS_REKENING_BANK', 'BCA'),
    'rekening_nomor' => env('SIMKOS_REKENING_NOMOR', ''),
    'rekening_nama' => env('SIMKOS_REKENING_NAMA', ''),
];
