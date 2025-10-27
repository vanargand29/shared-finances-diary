# 🎉 Fitur Baru: Pemisahan Tabungan Pribadi & Bersama dengan Kategori

## 📋 Ringkasan Fitur

Aplikasi sekarang mendukung **pemisahan lengkap** antara tabungan pribadi dan bersama dengan sistem kategori untuk tabungan pribadi.

---

## ✨ Fitur Utama

### 1. **Tab Pribadi vs Bersama**
- Toggle antara "Tabungan Pribadi" dan "Tabungan Bersama"
- Total pemasukan/pengeluaran terpisah per tab
- UI yang jelas dengan icon User (pribadi) dan Users (bersama)

### 2. **Kategori Pribadi (Custom)**
- Setiap user bisa membuat kategori sendiri
- Contoh kategori: "Jajan", "Adek", "Transportasi", "Belanja", dll.
- CRUD kategori: Tambah, Hapus
- Validasi: Kategori yang masih digunakan tidak bisa dihapus

### 3. **Privacy & Access Control**

#### **Tabungan Pribadi:**
- ✅ Hanya user yang membuat yang bisa melihat
- ✅ Jayanto tidak bisa melihat catatan pribadi Lintang Ayu
- ✅ Lintang Ayu tidak bisa melihat catatan pribadi Jayanto
- ✅ Bisa edit dan hapus catatan sendiri

#### **Tabungan Bersama:**
- ✅ Semua user bisa melihat
- ✅ Semua user bisa edit
- ✅ Semua user bisa hapus
- ✅ Cocok untuk catatan keuangan rumah tangga

### 4. **Pengelompokan Tampilan**

#### **Tabungan Pribadi:**
Dikelompokkan berdasarkan **KATEGORI**
```
📁 Jajan
   ├── Total Pemasukan: Rp 500.000
   ├── Total Pengeluaran: Rp 300.000
   ├── Catatan 1
   └── Catatan 2

📁 Adek
   ├── Total Pemasukan: Rp 1.000.000
   ├── Total Pengeluaran: Rp 800.000
   └── ...
```

#### **Tabungan Bersama:**
Dikelompokkan berdasarkan **BULAN**
```
📅 Oktober 2024
   ├── Total Pemasukan: Rp 5.000.000
   ├── Total Pengeluaran: Rp 3.500.000
   └── ...

📅 September 2024
   └── ...
```

---

## 🗄️ Perubahan Database

### Tabel Baru: `private_categories`
```sql
CREATE TABLE public.private_categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(user_id, name)
);
```

### Update Tabel: `financial_notes`
- Tambah kolom: `private_category_id` (UUID, nullable)
- Tambah kolom: `transaction_date` (DATE)

---

## 🔧 Cara Menggunakan

### **Langkah 1: Jalankan Migration Database**

**PENTING!** Jalankan script SQL di Supabase Dashboard:

1. Buka: https://supabase.com/dashboard/project/jjbersylchuhsvdsexbi
2. Pilih **SQL Editor**
3. Copy-paste isi file `database-update-v2.sql`
4. Klik **Run**

### **Langkah 2: Jalankan Aplikasi**
```bash
npm run dev
```

### **Langkah 3: Login**
- Username: `LintangAyu` atau `Jayanto`
- Password: `JayaLintang123`

### **Langkah 4: Gunakan Fitur**

#### **A. Tabungan Pribadi**
1. Klik tab **"Tabungan Pribadi"**
2. Klik **"Tambah Kategori"** untuk membuat kategori baru
   - Contoh: "Jajan", "Adek", "Transportasi"
3. Klik **"Tambah Catatan Pribadi"**
4. Pilih kategori dari dropdown
5. Isi form dan simpan
6. Catatan akan muncul di grup kategori yang dipilih

#### **B. Tabungan Bersama**
1. Klik tab **"Tabungan Bersama"**
2. Klik **"Tambah Catatan Bersama"**
3. Isi form (tidak ada pilihan kategori)
4. Catatan akan muncul di grup bulan transaksi

---

## 🎯 Skenario Penggunaan

### **Skenario 1: Jayanto Mencatat Jajan Pribadi**
1. Login sebagai Jayanto
2. Tab "Tabungan Pribadi"
3. Buat kategori "Jajan"
4. Tambah catatan: "Beli Kopi" - Rp 25.000
5. **Hasil:** Lintang Ayu TIDAK bisa melihat catatan ini

### **Skenario 2: Lintang Ayu Mencatat Uang untuk Adek**
1. Login sebagai Lintang Ayu
2. Tab "Tabungan Pribadi"
3. Buat kategori "Adek"
4. Tambah catatan: "Kiriman Bulanan" - Rp 500.000
5. **Hasil:** Jayanto TIDAK bisa melihat catatan ini

### **Skenario 3: Catatan Belanja Bersama**
1. Login sebagai Jayanto atau Lintang Ayu
2. Tab "Tabungan Bersama"
3. Tambah catatan: "Belanja Bulanan" - Rp 1.500.000
4. **Hasil:** Jayanto DAN Lintang Ayu bisa melihat, edit, hapus

---

## 📊 Fitur Total & Saldo

### **Total di Header**
- Menampilkan total sesuai tab aktif
- Tab Pribadi: Total dari catatan pribadi user saja
- Tab Bersama: Total dari semua catatan bersama

### **Total per Grup**
- Setiap grup (kategori/bulan) menampilkan:
  - Total Pemasukan grup tersebut
  - Total Pengeluaran grup tersebut

---

## 🔐 Keamanan & Privacy

### **Application-Level Security**
Karena menggunakan custom authentication (bukan Supabase Auth), filtering dilakukan di application layer:

```typescript
// Filter catatan pribadi
const privateNotes = notes.filter(note => 
  note.is_private === true && note.user_id === currentUser.id
);

// Filter catatan bersama
const sharedNotes = notes.filter(note => 
  note.is_private === false
);
```

### **Database-Level**
- RLS policies di-set ke `allow all` karena custom auth
- Validasi akses dilakukan di frontend
- User ID disimpan di setiap catatan

---

## 📁 File yang Dimodifikasi

### **Baru:**
- `database-update-v2.sql` - Migration script
- `src/components/PrivateCategoryManager.tsx` - Komponen manage kategori

### **Diupdate:**
- `src/integrations/supabase/types.ts` - Tambah type `private_categories`
- `src/pages/Dashboard.tsx` - Tabs, filtering, kategori
- `src/components/FinanceNoteDialog.tsx` - Support kategori pribadi
- `src/components/FinanceNotesList.tsx` - Grouping by kategori/bulan

---

## 🐛 Troubleshooting

### **Error: Gagal menyimpan catatan**
- Pastikan migration database sudah dijalankan
- Cek file `database-update-v2.sql` sudah di-run di Supabase

### **Kategori tidak muncul**
- Refresh halaman
- Pastikan sudah membuat kategori di tab "Tabungan Pribadi"

### **Catatan pribadi terlihat oleh user lain**
- Cek field `is_private` di database harus `true`
- Cek field `user_id` sesuai dengan user yang login

---

## 🎨 UI/UX Improvements

- ✅ Tabs dengan icon yang jelas
- ✅ Badge untuk kategori dengan tombol hapus
- ✅ Grouping visual yang rapi
- ✅ Total pemasukan/pengeluaran per grup
- ✅ Color coding: hijau (income), merah (expense)
- ✅ Responsive design

---

## 🚀 Next Steps (Opsional)

Fitur yang bisa ditambahkan di masa depan:
- [ ] Export data per kategori
- [ ] Grafik per kategori
- [ ] Notifikasi budget limit per kategori
- [ ] Share kategori antar user
- [ ] Recurring transactions

---

**Selamat menggunakan! 🎉**
