# SIMKOS — Sistem Informasi Manajemen Kos-Kosan

Aplikasi web untuk pengelolaan kos: manajemen kamar & penyewa, generate tagihan bulanan, reminder pembayaran via WhatsApp, verifikasi bukti transfer, dan laporan keuangan.

Project tugas Manajemen Proyek TI — Kelompok 4. Submission final: 16 Mei 2026 (delivered on time).

---

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.4)
- **Frontend**: Blade + Tailwind CSS + Alpine.js (Vite)
- **Auth**: Laravel Breeze (Blade) + Spatie Laravel Permission
- **Database**: PostgreSQL (Supabase free tier)
- **File Storage**: Supabase Storage (S3-compatible) untuk bukti transfer
- **PDF Export**: barryvdh/laravel-dompdf
- **Container**: FrankenPHP (single binary, Caddy + PHP) — multi-stage Dockerfile
- **Hosting**: Render.com free tier
- **CI**: GitHub Actions (Pint + PHPUnit)

## Fitur

| Modul | Sisi | Highlight |
|---|---|---|
| **Auth & role** | Admin & Penyewa | Register publik = otomatis role `penyewa` + auto-create profil; admin di-seed |
| **Dashboard Admin** | Admin | KPI cards, widget reminder pembayaran + tombol WhatsApp, antrian verifikasi |
| **Dashboard Penyewa** | Penyewa | Info sewa aktif, daftar tagihan, tombol upload bukti transfer |
| **CRUD Kamar** | Admin | Filter status, soft delete, cegah hapus kamar dengan sewa aktif |
| **CRUD Penyewa** | Admin | Optional sekaligus buat akun login, riwayat sewa lengkap |
| **Sewa (assignment kamar)** | Admin | Transactional assign + auto-update status kamar; akhiri sewa |
| **Tagihan** | Admin | Generate idempotent per periode, auto-mark terlambat, filter status/periode |
| **Verifikasi Pembayaran** | Admin | Approve (set lunas kalau jumlah cukup) atau reject dengan alasan |
| **Upload Bukti Transfer** | Penyewa | Validasi mime/ukuran (jpg/png/pdf, max 2MB) → Supabase Storage |
| **Laporan Keuangan & Rekap Penghuni** | Admin | Filter periode, export PDF (dompdf) |

## Out of Scope (sesuai project charter)

- Payment gateway otomatis (Midtrans/Xendit)
- Cron jobs / WhatsApp Business API berbayar
- Aplikasi mobile native
- Multi-cabang kos

---

## Setup Development Lokal

### Prasyarat
- PHP 8.4 dengan ekstensi: `pdo_pgsql`, `gd`, `mbstring`, `intl`, `zip`, `bcmath`, `sodium` — Laragon sudah include
- Composer 2.x
- Node.js 22.x + npm
- Git

### Step
```bash
# 1. Clone & install
git clone https://github.com/DYmazeh/SimKos.git
cd SimKos
composer install
npm install

# 2. Copy env & generate key
cp .env.example .env
php artisan key:generate

# 3. Setup DB lokal — pilih salah satu:
#    a) Pakai sqlite (paling cepat untuk dev)
#       Pastikan DB_CONNECTION=sqlite di .env (default)
#    b) Pakai Supabase Postgres — uncomment block pgsql di .env, isi credential

# 4. Migrate + seed (admin@simkos.test / password)
php artisan migrate --seed

# 5. Storage symlink (untuk akses file upload via /storage/...)
php artisan storage:link

# 6. Build frontend assets
npm run build
# atau watch mode untuk dev:
# npm run dev

# 7. Jalankan server
php artisan serve
# Buka http://localhost:8000
```

### Akun Demo
- **Admin**: `admin@simkos.test` / `password`
- **Penyewa**: register sendiri di `/register` (auto-dapat role penyewa)

---

## Setup Supabase (Postgres + Storage)

1. **Bikin project** di [supabase.com](https://supabase.com/dashboard) (region Singapore)
2. **Postgres**: Settings → Database → Connection string → tab **"Session"** (port 5432). Copy URL, pecah jadi `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, isi ke `.env`
3. **Storage bucket**: sidebar Storage → New bucket → nama `simkos-uploads`, **Public: OFF**
4. **S3 access keys** (untuk upload via Laravel filesystem):
   - Settings → Storage → S3 Access Keys → New access key
   - Copy `access_key_id` ke `SUPABASE_S3_KEY`, `secret_access_key` ke `SUPABASE_S3_SECRET`
5. **Migrate ke Supabase**:
   ```bash
   php artisan migrate:fresh --seed
   ```

---

## Deploy ke Render

1. **Push repo ke GitHub** (sudah)
2. Login [render.com](https://render.com) → **New + → Blueprint** → pilih repo `SimKos`
3. Render akan baca [`render.yaml`](./render.yaml) otomatis
4. **Set environment variables manual** di dashboard Render (jangan commit ke git):
   - `APP_KEY` — generate via `php artisan key:generate --show` (lokal), copy hasilnya
   - `APP_URL` — `https://<your-app>.onrender.com`
   - `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` — dari Supabase
   - `DB_PORT=6543` (transaction pooler — lebih hemat connection di production)
   - `SUPABASE_URL`, `SUPABASE_S3_KEY`, `SUPABASE_S3_SECRET`, `SUPABASE_BUCKET=simkos-uploads`
   - `FILESYSTEM_DISK=supabase`
5. **Deploy** — Render build Docker image (FrankenPHP), jalankan migrate (via `RUN_MIGRATIONS=true` di entrypoint)
6. **Setup UptimeRobot** (gratis) — ping `https://<your-app>.onrender.com/up` tiap 5 menit supaya container tidak tidur saat demo

---

## Struktur Folder Penting

```
app/
├── Http/Controllers/Admin/      # KamarController, PenyewaController, dst
├── Http/Controllers/Penyewa/    # DashboardController, PembayaranController
├── Http/Requests/Admin/         # FormRequest validation
├── Models/                      # Kamar, Penyewa, Sewa, Tagihan, Pembayaran, User
└── Services/                    # TagihanGenerator, WhatsappReminderLink,
                                 # AssignKamarService, BuktiTransferUploader

database/
├── migrations/                  # 6 migrasi SIMKOS + 4 default Laravel + Spatie
└── seeders/                     # RolePermission, Admin, Kamar

docker/                          # Caddyfile + entrypoint.sh

resources/views/admin/           # Blade views per modul (kamar, penyewa, tagihan, dll)
resources/views/penyewa/         # Dashboard penyewa, form upload bukti

tests/                           # 49 test passing
docs/USER_MANUAL.md              # Panduan pengguna
```

## Testing

```bash
php artisan test
# 49 tests, 118 assertions — semua hijau
```

## Code Style

```bash
./vendor/bin/pint            # auto-fix
./vendor/bin/pint --test     # check only (dipakai di CI)
```

---

## Database Schema (ringkas)

```
users (id, name, email, phone, password, role via spatie)
  └─ penyewa (1-1, optional)

kamar (id, nomor_kamar, tipe, harga_bulanan, status)
  └─ sewa (many)

penyewa (id, user_id, nama_lengkap, no_ktp, no_hp, alamat_asal, foto_ktp_url)
  └─ sewa (many)

sewa (id, penyewa_id, kamar_id, tgl_mulai, tgl_selesai, harga_disepakati, status)
  └─ tagihan (many, unique(sewa_id, periode))

tagihan (id, sewa_id, periode, jumlah, tgl_jatuh_tempo, status)
  └─ pembayaran (many)

pembayaran (id, tagihan_id, tgl_bayar, jumlah_bayar, metode,
            bukti_transfer_url, status_verifikasi, diverifikasi_oleh, verified_at, catatan)
```

## License

Tugas mata kuliah Manajemen Proyek TI — internal use only.

## Tim — Kelompok 4

- Project Manager: Maura Hellena
- Sponsor: Wahyu Aji Pulungan, S.T., M.T.I.

---

> 📖 Untuk panduan pemakaian aplikasi, lihat [docs/USER_MANUAL.md](./docs/USER_MANUAL.md)
