# 👤 Fitur Profile & Lupa Password

## ✨ Fitur Baru

Aplikasi sekarang memiliki fitur manajemen profile lengkap:

1. **Halaman Profile** - Edit nama, username, nomor telepon, dan password
2. **Lupa Password** - Reset password dengan verifikasi nomor telepon
3. **Update Profile** - Ubah informasi akun kapan saja

---

## 🗄️ Update Database

### **Tabel `users` - Kolom Baru:**
- `name` (TEXT) - Nama lengkap user
- `phone` (TEXT) - Nomor telepon
- `updated_at` (TIMESTAMP) - Waktu update terakhir

### **Tabel Baru: `password_reset_tokens`**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference ke users
- `token` (TEXT) - Token reset password
- `expires_at` (TIMESTAMP) - Waktu kadaluarsa
- `used` (BOOLEAN) - Status penggunaan

---

## 📋 Cara Menggunakan

### **1. Akses Profile**

**Dari Dashboard:**
1. Klik tombol **"Profile"** di header (sebelah tombol Logout)
2. Atau navigasi ke `/profile`

### **2. Edit Informasi Profile**

**Form Profile:**
- **Nama Lengkap**: Update nama tampilan
- **Username**: Ganti username (harus unik)
- **Nomor Telepon**: Tambah/update nomor telepon

**Langkah:**
1. Isi form dengan data baru
2. Klik **"Simpan Perubahan"**
3. Data akan tersimpan dan tampilan di dashboard akan update

### **3. Ubah Password**

**Form Ubah Password:**
- **Password Saat Ini**: Masukkan password lama
- **Password Baru**: Minimal 6 karakter
- **Konfirmasi Password**: Ulangi password baru

**Langkah:**
1. Masukkan password saat ini
2. Masukkan password baru (min. 6 karakter)
3. Konfirmasi password baru
4. Klik **"Ubah Password"**

### **4. Lupa Password**

**Dari Halaman Login:**
1. Klik link **"Lupa Password?"**
2. Masukkan **username**
3. Masukkan **nomor telepon** yang terdaftar
4. Buat **password baru**
5. Login dengan password baru

---

## 🔐 Keamanan

### **Verifikasi Password**
- Password saat ini harus benar untuk ubah password
- Password baru minimal 6 karakter
- Konfirmasi password harus cocok

### **Verifikasi Lupa Password**
- Username harus terdaftar
- Nomor telepon harus cocok dengan database
- Akun harus memiliki nomor telepon

### **Username Unik**
- Sistem cek duplikasi username
- Tidak bisa pakai username yang sudah digunakan user lain

---

## 🎯 Skenario Penggunaan

### **Skenario 1: Update Nama Lengkap**

**Situasi:** Jayanto ingin nama tampilan lebih formal

**Langkah:**
1. Login sebagai Jayanto
2. Klik tombol "Profile"
3. Ubah nama dari "Jayanto" ke "Jayanto Wijaya"
4. Klik "Simpan Perubahan"
5. Kembali ke Dashboard
6. Nama di header berubah: "Selamat datang, Jayanto Wijaya"

### **Skenario 2: Tambah Nomor Telepon**

**Situasi:** Lintang Ayu ingin tambah nomor telepon untuk recovery

**Langkah:**
1. Login sebagai Lintang Ayu
2. Klik "Profile"
3. Isi nomor telepon: 081234567890
4. Klik "Simpan Perubahan"
5. Nomor tersimpan untuk fitur lupa password

### **Skenario 3: Lupa Password**

**Situasi:** Jayanto lupa password

**Langkah:**
1. Di halaman login, klik "Lupa Password?"
2. Masukkan username: "Jayanto"
3. Masukkan nomor telepon yang terdaftar
4. Buat password baru
5. Login dengan password baru

---

## 📁 File yang Dibuat/Dimodifikasi

### **File Baru:**
1. `database-profile-update.sql` - Migration database
2. `src/pages/Profile.tsx` - Halaman profile
3. `src/pages/ForgotPassword.tsx` - Halaman lupa password

### **File Dimodifikasi:**
1. `src/integrations/supabase/types.ts` - Tambah types
2. `src/contexts/AuthContext.tsx` - Tambah updateUser function
3. `src/App.tsx` - Tambah routes
4. `src/pages/Login.tsx` - Tambah link lupa password
5. `src/pages/Dashboard.tsx` - Tambah tombol profile

---

## 🚀 Instalasi

### **1. Jalankan Migration Database**

**PENTING!** Jalankan di Supabase SQL Editor:

1. Buka: https://supabase.com/dashboard/project/jjbersylchuhsvdsexbi
2. Pilih **SQL Editor**
3. Copy-paste isi file `database-profile-update.sql`
4. Klik **Run**

### **2. Refresh Aplikasi**

```bash
npm run dev
```

---

## ✅ Checklist Fitur

✅ Edit nama lengkap
✅ Edit username (dengan validasi unik)
✅ Edit nomor telepon
✅ Ubah password (dengan verifikasi password lama)
✅ Lupa password (dengan verifikasi nomor telepon)
✅ Link profile di dashboard
✅ Link lupa password di login
✅ Auto-update nama di dashboard setelah edit

---

## 🎨 UI/UX

- ✅ Halaman profile dengan 2 card (Profile & Password)
- ✅ Form validation yang jelas
- ✅ Loading states
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Back button ke dashboard
- ✅ Multi-step forgot password flow

---

**Fitur siap digunakan! 🎉**
