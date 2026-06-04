# Desain: Assign Kamar ke Penyewa yang Sudah Ada

Tanggal: 2026-06-04
Status: Disetujui, siap implementasi

## Latar belakang & masalah

Saat ini kamar hanya bisa ditugaskan (assign) ketika **membuat akun penyewa baru**
(form create, blok `!isEdit`). Setelah akun jadi, tidak ada cara untuk menugaskan
kamar dari UI. Padahal kebutuhannya: admin ingin bisa buat akun penyewa dulu tanpa
kamar, lalu meng-assign kamar belakangan ketika penyewa sudah pasti menempati.

Backend sebenarnya sudah mendukung ini:
`POST admin/penyewa/{penyewa}/sewa` -> `SewaController@store` -> `AssignKamarService::assign()`
(lock baris, cek penyewa belum punya sewa aktif, cek kamar tersedia, buat sewa,
tandai kamar terisi, auto-generate tagihan pertama). Yang hilang murni UI-nya.

Fitur ini adalah **assign** (menugaskan ke kamar kosong), **bukan pindah kamar**
(mengakhiri sewa lama lalu pindah). Pindah kamar di luar lingkup.

## Pendekatan

Pakai ulang route penyewa-centric yang sudah ada. Route ini punya penyewa di URL
dan `kamar_id` di body, jadi cocok untuk dua arah penempatan:

- Dari **detail kamar**: kamar fixed (kamar yang dibuka), admin memilih penyewa.
  POST ke `admin.penyewa.sewa.store({penyewa terpilih})` dengan `kamar_id = kamar ini`.
- Dari **detail penyewa**: penyewa fixed (penyewa yang dibuka), admin memilih kamar.
  POST ke `admin.penyewa.sewa.store({penyewa ini})` dengan `kamar_id = kamar terpilih`.

Tidak ada route, controller, atau service baru. Logika assign tetap satu jalur
yang sudah teruji (`AssignKamarService`).

Alternatif yang ditolak: route kamar-centric baru
(`POST admin/kamar/{kamar}/assign`). Menduplikasi logika assign, menambah permukaan
yang harus dites, tanpa manfaat berarti.

## Perubahan

### Backend
- `KamarController@show`: tambah prop `penyewaTanpaKamar` = penyewa berstatus aktif
  yang belum punya sewa aktif
  (`Penyewa::where('status_aktif', 'aktif')->whereDoesntHave('sewa', fn => status aktif)`),
  field `id`, `nama_lengkap`, `no_hp`. Untuk dropdown di detail kamar.
- `PenyewaController@show`: tidak diubah, sudah mengirim `kamarTersedia`.

### Frontend
- Komponen baru `AssignKamarForm` (dipakai dua halaman). Field:
  `tgl_mulai` (default hari ini, wajib) dan harga override opsional
  (default `harga_bulanan` kamar). Submit ke `admin.penyewa.sewa.store`.
  - Mode `kamar`: kamar fixed, dropdown pilih penyewa.
  - Mode `penyewa`: penyewa fixed, dropdown pilih kamar.
- `Kamar/Show.tsx`: tampilkan card assign hanya jika `status === 'tersedia'`.
  Jika tidak ada penyewa nganggur, tampilkan hint + link "Tambah penyewa".
- `Penyewa/Show.tsx`: ganti empty-state yang menyesatkan
  ("Tugaskan kamar dari halaman edit penyewa") dengan form assign sungguhan,
  muncul jika penyewa belum punya sewa aktif dan masih berstatus aktif.
  Jika tidak ada kamar tersedia, tampilkan hint.

## Field, validasi, error

- Field terkirim: `kamar_id`, `tgl_mulai` (wajib), `harga_disepakati` (opsional).
- Tanpa `tgl_selesai`: mengikuti `AssignKamarService::assign()`. Tanggal selesai
  diisi nanti saat sewa diakhiri.
- Validasi sudah ada di `StoreSewaRequest`.
- `AssignKamarService` melempar `DomainException` (mis. kamar keburu terisi, atau
  penyewa keburu punya sewa). `SewaController@store` menangkap -> `errors.assign`,
  ditampilkan di form.

## Edge case

- Kamar `maintenance`/`terisi`: form assign tidak muncul di detail kamar.
- Penyewa `nonaktif`: tidak masuk dropdown dan form tidak muncul di detailnya.
- Race condition: dijaga `lockForUpdate` di service.
- Redirect setelah sukses: mengikuti existing -> `admin.penyewa.show`. Artinya assign
  dari halaman kamar akan mendarat di halaman penyewa (melihat kontrak yang baru jadi).

## Testing

PHPUnit feature test (`tests/Feature/AssignKamarTest.php`):
- Admin bisa assign penyewa tanpa kamar ke kamar tersedia (sewa aktif terbentuk,
  kamar jadi terisi, tagihan pertama tergenerate).
- Assign penyewa yang sudah punya sewa aktif ditolak.
- Assign ke kamar yang tidak tersedia ditolak.
- `KamarController@show` mengirim `penyewaTanpaKamar` dan tidak memuat penyewa yang
  sudah punya kamar.

Frontend diverifikasi manual.
