# Debug Profile Update Issue

## Masalah: Update Berhasil tapi Data Tidak Tersimpan

### Langkah Debug:

#### 1. Buka Browser Console

1. Tekan **F12** di browser
2. Pilih tab **Console**
3. Clear console (icon 🚫 atau Ctrl+L)

#### 2. Test Update Profile

1. Di aplikasi, klik **Profile**
2. Ubah nama/username/phone
3. Klik **"Simpan Perubahan"**
4. **Lihat di Console**, akan muncul log:

```
Updating profile for user ID: [user-id]
Data to update: {name: "...", username: "...", phone: "..."}
Update result: [...]
Update error: null
Verification data: {id: "...", username: "...", name: "...", phone: "..."}
```

**Analisa:**
- ✅ Jika `Update result` ada data → Update berhasil
- ✅ Jika `Verification data` sesuai → Data tersimpan
- ❌ Jika `Update result` kosong → Update gagal (cek RLS)
- ❌ Jika `Verification data` tidak sesuai → Ada masalah

#### 3. Test Update Password

1. Di halaman Profile, scroll ke **Ubah Password**
2. Isi password lama dan baru
3. Klik **"Ubah Password"**
4. **Lihat di Console**:

```
Updating password for user ID: [user-id]
New password hash: [hash]
Password update result: [...]
Password verification - new hash: [hash]
Expected hash: [hash]
Match: true/false
```

**Analisa:**
- ✅ Jika `Match: true` → Password berubah
- ❌ Jika `Match: false` → Password TIDAK berubah

#### 4. Verifikasi Manual di Database

Jalankan `test-update.sql` di Supabase SQL Editor untuk test manual update.

### Kemungkinan Penyebab:

#### A. RLS Policy Terlalu Ketat

Cek di Supabase Dashboard → Authentication → Policies

Pastikan ada policy untuk UPDATE di tabel `users`.

#### B. User ID Tidak Cocok

Console log akan menampilkan user ID. Pastikan ID ini ada di database.

#### C. Trigger yang Menghalangi

Cek apakah ada trigger yang me-revert update.

### Solusi Berdasarkan Log:

**Jika Update Result Kosong:**
```sql
-- Jalankan di Supabase SQL Editor
-- Cek RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Temporary: Disable RLS untuk test
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Test update manual
UPDATE public.users SET name = 'Test' WHERE username = 'Jayanto';

-- Enable kembali
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

**Jika Verification Data Tidak Cocok:**
Ada kemungkinan cache atau transaction issue. Coba:
- Hard refresh browser (Ctrl+Shift+R)
- Clear localStorage
- Logout dan login ulang

### Screenshot yang Dibutuhkan:

Jika masih gagal, kirim screenshot:
1. Browser Console (semua log)
2. Network tab (request ke Supabase)
3. Error message (jika ada)
