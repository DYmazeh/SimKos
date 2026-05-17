# SIMKOS — User Manual

Panduan singkat untuk **Admin (Pemilik Kos)** dan **Penyewa**.

---

## A. Untuk Admin (Pemilik Kos)

### 1. Login pertama kali
1. Buka URL aplikasi (mis. `https://simkos.onrender.com`)
2. Klik **Log in**
3. Pakai akun admin default: `admin@simkos.test` / `password`
4. Setelah login berhasil, Anda akan diarahkan ke **Dashboard Admin**
5. **PENTING**: Segera ganti password lewat menu Profile (klik nama Anda di kanan atas → Profile)

### 2. Mengelola Kamar
- Menu **Kamar**
- **Tambah kamar baru**: klik **+ Tambah Kamar** → isi nomor, tipe (standar/deluxe/vip), harga, status
- **Edit / hapus**: klik link "Edit" / "Hapus" di baris kamar
- **Filter**: pakai search bar atau dropdown status di atas tabel
- ⚠️ Kamar yang sedang ditempati tidak bisa dihapus — akhiri dulu sewanya

### 3. Mengelola Penyewa
- Menu **Penyewa**
- **Tambah penyewa baru**: klik **+ Tambah Penyewa** → isi data diri
  - Centang **"Sekaligus buat akun login"** kalau penyewa juga butuh akses sistem (untuk upload bukti transfer)
  - Catat password awal yang Anda buat — berikan ke penyewa
- **Detail penyewa**: klik **Detail** untuk lihat profil + riwayat sewa lengkap

### 4. Menugaskan Penyewa ke Kamar (Membuat Sewa)
1. Buka halaman **Detail** penyewa
2. Di bagian **Sewa Aktif**, pilih kamar dari dropdown (hanya kamar status "Tersedia" yang muncul)
3. Isi tanggal mulai (default hari ini)
4. (Opsional) override harga jika ada diskon/kesepakatan khusus
5. Klik **Tugaskan ke Kamar**
   - Kamar otomatis berubah status jadi "Terisi"
   - Penyewa siap dibuatkan tagihan bulanan

### 5. Mengakhiri Sewa
1. Buka **Detail** penyewa
2. Di bagian **Sewa Aktif**, isi **Tgl Akhir** (default hari ini)
3. Klik **Akhiri Sewa**
   - Status sewa jadi "Selesai"
   - Kamar otomatis kembali ke status "Tersedia"

### 6. Generate Tagihan Bulanan
- Menu **Tagihan**
- Pilih periode (bulan & tahun) di form **Generate untuk Periode**
- Klik **Generate Tagihan**
  - Sistem otomatis bikin tagihan untuk semua penyewa dengan sewa aktif
  - Aman dipanggil berulang — tagihan yang sudah ada tidak akan dobel
- Default jatuh tempo: tanggal **5** setiap bulan (bisa diubah lewat env var `SIMKOS_JATUH_TEMPO_TANGGAL`)

### 7. Mengingatkan Penyewa via WhatsApp
- Menu **Dashboard** → bagian **📋 Pengingat Pembayaran**
  - Tampilkan tagihan yang jatuh tempo dalam 7 hari ke depan ATAU sudah lewat
  - Tagihan terlambat ditandai merah
- Klik tombol **🟢 Ingatkan** di baris penyewa yang ingin diingatkan
  - Browser akan buka WhatsApp (mobile/desktop) dengan pesan template otomatis berisi nama, kamar, jumlah, dan jatuh tempo
  - Anda tinggal review pesan & klik kirim

### 8. Verifikasi Pembayaran
- Menu **Verifikasi** → tampilkan antrian pembayaran status **Pending**
- Klik **Detail tagihan →** untuk melihat bukti transfer
- Di halaman detail tagihan:
  - Klik **🧾 Lihat bukti transfer** untuk preview file (JPG/PDF)
  - Klik **✓ Setujui** kalau valid → tagihan otomatis ditandai **Lunas** kalau jumlah cukup
  - Klik **✗ Tolak** kalau tidak valid → wajib isi alasan; penyewa akan diminta upload ulang

### 9. Laporan Keuangan & Rekap Penghuni
- Menu **Laporan**
- Pilih periode (bulan & tahun)
- **Laporan Keuangan**: total pemasukan + piutang, daftar transaksi disetujui
- **Rekap Penghuni**: daftar semua sewa di periode tersebut (aktif & selesai)
- Klik **📄 Export PDF** untuk download laporan PDF

---

## B. Untuk Penyewa

### 1. Mendaftar Akun
1. Buka URL aplikasi
2. Klik **Register**
3. Isi: nama, email, **nomor HP (WhatsApp aktif — penting untuk reminder)**, password
4. Setelah register, Anda otomatis login & masuk ke **Dashboard Penyewa**
5. Hubungi pemilik kos untuk pendaftaran kamar

### 2. Login (jika sudah punya akun)
- Klik **Log in** → masukkan email & password
- Atau gunakan email & password yang diberikan pemilik kos saat pendaftaran

### 3. Melihat Tagihan
- Dashboard menampilkan:
  - **Status Sewa**: kamar yang Anda tempati, harga, tanggal mulai
  - **Tagihan**: daftar tagihan + status (Belum bayar / Menunggu verifikasi / Lunas / Terlambat)

### 4. Membayar Tagihan & Upload Bukti Transfer
1. Di tabel Tagihan, cari tagihan dengan status **Belum bayar** atau **Terlambat**
2. Klik tombol **💳 Bayar / Upload Bukti**
3. Lakukan transfer ke rekening pemilik kos (informasi rekening hubungi langsung pemilik kos)
4. Di form upload, isi:
   - **Tanggal Bayar** (sesuai tanggal transfer)
   - **Jumlah Dibayar** (sesuai nominal transfer)
   - **Metode Bayar** (Transfer Bank / Tunai)
   - **Bukti Transfer** (JPG/PNG/PDF, max 2MB)
   - (Opsional) Catatan
5. Klik **Kirim Bukti**
6. Status tagihan berubah jadi **Menunggu verifikasi** — admin akan review dalam 1×24 jam

### 5. Kalau Bukti Ditolak
- Status tagihan kembali ke **Belum bayar** / **Terlambat**
- Alasan penolakan tampil di bawah status (mis. "Nominal tidak sesuai")
- Upload ulang bukti yang benar dengan klik tombol **💳 Bayar / Upload Bukti** lagi

### 6. Download Kuitansi PDF
- Untuk pembayaran yang sudah disetujui admin (status **Lunas**), tersedia tombol **Download Kuitansi**
- File PDF berisi rincian pembayaran, info kamar, dan info kos
- Bisa disimpan untuk arsip pribadi atau klaim reimburse

### 7. Halaman Kamar Saya
- Menu **Kamar Saya** menampilkan detail kamar yang sedang disewa: nomor, tipe, fasilitas, foto
- Termasuk info kontrak: tgl mulai, tgl selesai (kalau ada), nominal sewa/bulan

### 8. Komplen / Keluhan
- Menu **Komplen** untuk melaporkan masalah kamar atau fasilitas
- Klik **Buat komplen baru** → isi judul + deskripsi
- Upload max 3 foto bukti (JPG/PNG, max 2MB per file)
- Status komplen: **Menunggu → Sedang diproses → Selesai** (di-update oleh admin)
- Riwayat komplen aktif dan selesai bisa dilihat di halaman yang sama

### 9. Ganti Password
- Klik nama Anda di kanan atas → **Profile**
- Bagian **Update Password** — isi password lama + password baru

---

## C. Troubleshooting

### "App sleep" / loading lama saat pertama akses
Aplikasi di-deploy di Render free tier yang **tidur setelah 15 menit idle**. Saat akses pertama, butuh ~30–60 detik untuk wake-up. Berikutnya akan responsif normal selama traffic aktif.

### Lupa password admin
Reset via tinker (admin/developer):
```bash
php artisan tinker
> $u = User::where('email', 'admin@simkos.test')->first();
> $u->password = Hash::make('password-baru');
> $u->save();
```

### Tagihan tidak muncul setelah generate
- Cek apakah penyewa punya **sewa aktif** dengan `tgl_mulai <= periode`
- Cek filter di halaman Tagihan — coba reset filter
- Cek log: `storage/logs/laravel.log`

### Bukti transfer tidak bisa dibuka di production
- Cek `FILESYSTEM_DISK=supabase` di env Render
- Cek S3 access key Supabase masih valid
- Cek bucket `simkos-uploads` ada & permission OK

---

## D. Kontak Bantuan Teknis

Untuk bug / kendala teknis, hubungi tim developer (Kelompok 4 MPTI):
- Project Manager: **Maura Hellena**

---

*Dokumen ini bagian dari deliverable project SIMKOS — Manajemen Proyek TI 2026.*
