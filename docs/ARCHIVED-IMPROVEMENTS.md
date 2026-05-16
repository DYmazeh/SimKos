# Archived Improvements (Paid / Deferred)

Improvement yang **belum diimplementasikan** karena butuh paid tier
atau scope-creep. Diarsipkan di sini supaya tidak hilang dari radar.

## 1. Daily PostgreSQL backup (paid)

**Status**: ❌ Tidak implement. Butuh upgrade Render PostgreSQL ke paid tier
($7/bln untuk shared, $20+/bln untuk dedicated dengan automated daily backup).

**Alternatif gratis** (kalau di-perlu sebelum upgrade):

1. **Manual backup via cron di app**: setup scheduled task harian yang run
   `pg_dump` lewat `php artisan` command, upload hasil ke Supabase Storage
   (free tier 1GB). Contoh struktur:
   ```php
   // app/Console/Commands/BackupDatabase.php
   exec('pg_dump $DATABASE_URL > /tmp/backup.sql');
   Storage::disk('s3')->put('backups/' . now() . '.sql', file_get_contents('/tmp/backup.sql'));
   ```
   Tambah di `routes/console.php`:
   ```php
   Schedule::command('backup:db')->dailyAt('02:00')->withoutOverlapping();
   ```

2. **GitHub Actions sebagai backup runner**: jalankan workflow harian yang
   pull dari Render PostgreSQL via `pg_dump`, commit hasil ke private repo
   atau release. Free.

3. **Supabase Storage berbayar tier mulai $25/bln** untuk volume backup yang
   lebih besar.

**Rekomendasi**: pakai opsi (1) — manual pg_dump + Supabase Storage. Setup
1-2 jam, gratis selamanya untuk volume backup kecil (< 100MB / hari).

---

## 2. Sentry production tier (paid kalau over free)

**Status**: ✅ Config sudah di-prepare (`config/sentry.php`), composer require
sudah ditambah. **User perlu**:
1. Sign up sentry.io (gratis).
2. Bikin project Laravel.
3. Copy DSN ke env: `SENTRY_LARAVEL_DSN=https://...`

**Free tier limit**: 5k events/bulan. Cukup untuk MVP. Upgrade ke Team plan
$26/bln kalau lebih.

---

## 3. Bulk action Tagihan (deferred, butuh UX exploration)

**Status**: Skipped sementara. Kompleksitas UI:
- Checkbox state management per-row dengan select-all
- Action bar floating yang muncul saat ada selection
- Backend endpoint `POST /admin/tagihan/bulk-reminder` dengan array IDs
- Confirmation modal sebelum eksekusi massal

**Estimated effort**: 4-6 jam implementasi.

**Recommend implement saat**: data > 50 penyewa aktif & admin sering keluhan
"capek WA satu-satu".

---

## 4. Dashboard widget customizable (deferred)

**Status**: Skipped — feature-creep tanpa demand jelas.

**Implementasi prediksi**:
- localStorage prefs: array of hidden widget IDs
- Drag-drop reorder via dnd-kit atau react-grid-layout
- "Edit dashboard" mode di top-right corner

**Estimated effort**: 6-8 jam.

**Recommend implement saat**: ada feedback user spesifik bahwa layout
dashboard tidak cocok dengan flow kerja mereka.

---

## Telegram / WhatsApp Business API notifications (alternative)

**Out of scope sementara**. Saat ini reminder pakai `wa.me/` link yang
buka WhatsApp app — admin manual klik kirim. Otomasi via WhatsApp Business
API butuh:
- Verified Meta Business account
- API access fee
- Compliance review

**Alternatif gratis untuk otomasi**:
- Telegram Bot API (free, butuh penyewa join channel/bot)
- Email notifications (sudah supported by Laravel mail, tinggal SMTP setup)

---

## Catatan terakhir

Semua item di atas **bukan blocker** untuk demo skripsi. Implementasi
sekarang sudah lebih dari cukup untuk:
- Demo manajemen kos end-to-end
- Showcase Inertia + Laravel modern stack
- Pengelola actual bisa pakai untuk operasional kecil-menengah

Reactivate item di atas saat ada need bisnis spesifik.
