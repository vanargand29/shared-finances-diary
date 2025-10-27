# Troubleshooting Profile Update

## Problem: "Database belum diupdate" atau Update Profile Gagal

### Langkah Penyelesaian:

#### 1. Jalankan Fix Migration Script

Di Supabase SQL Editor, jalankan file `fix-profile-migration.sql`:

```sql
-- Script ini akan:
-- - Menambahkan kolom name, phone, updated_at
-- - Skip jika kolom sudah ada
-- - Verifikasi hasilnya
```

#### 2. Verifikasi Database

Jalankan `verify-database.sql` untuk cek apakah kolom sudah ada.

Expected output:
```
column_name | data_type
------------|----------
name        | text
phone       | text
updated_at  | timestamp with time zone
```

#### 3. Test Update Profile

Sekarang aplikasi sudah di-update dengan fallback mechanism:
- Jika kolom ada → Update semua (name, username, phone)
- Jika kolom tidak ada → Update username saja + warning

#### 4. Refresh Browser

- Clear cache (Ctrl + Shift + R)
- Atau buka incognito/private window
- Login ulang

### Jika Masih Gagal:

Buka browser console (F12) dan lihat error message. Lalu beritahu saya error tersebut.
