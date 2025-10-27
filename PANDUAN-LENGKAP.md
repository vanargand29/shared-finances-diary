# 📖 Panduan Lengkap Aplikasi Catatan Keuangan

## 🎯 Ringkasan Fitur

Aplikasi ini membantu Anda mengelola keuangan dengan 2 mode:
1. **Tabungan Pribadi** - Hanya Anda yang bisa lihat
2. **Tabungan Bersama** - Semua user bisa lihat & edit

---

## 🚀 Cara Memulai

### **1. Login**
```
Username: LintangAyu atau Jayanto
Password: JayaLintang123
```

### **2. Jalankan Migration Database**

**PENTING!** Sebelum menggunakan, jalankan script SQL:

1. Buka: https://supabase.com/dashboard/project/jjbersylchuhsvdsexbi
2. Pilih **SQL Editor**
3. Copy-paste isi file `database-update-v2.sql`
4. Klik **Run**

### **3. Mulai Menggunakan**

Setelah login, Anda akan melihat:
- Summary cards (Total Pemasukan, Pengeluaran, Saldo)
- 2 Tabs: Tabungan Pribadi & Tabungan Bersama

---

## 📱 Fitur Tabungan Pribadi

### **A. Buat Kategori**

1. Klik tab **"Tabungan Pribadi"**
2. Klik **"Tambah Kategori"**
3. Masukkan nama kategori (contoh: "Jajan", "Adek", "Transportasi")
4. Klik **"Simpan"**

**Contoh Kategori:**
- 💰 Jajan
- 👨‍👩‍👧 Adek
- 🚗 Transportasi
- 🛒 Belanja
- 💊 Kesehatan
- 🎓 Pendidikan

### **B. Tambah Catatan Pribadi**

1. Klik **"Tambah Catatan Pribadi"**
2. Isi form:
   - **Judul**: Nama transaksi (contoh: "Beli Kopi")
   - **Jumlah**: Nominal (contoh: 25000)
   - **Tanggal**: Pilih tanggal transaksi
   - **Tipe**: Pemasukan atau Pengeluaran
   - **Kategori**: Pilih kategori (contoh: "Jajan")
   - **Deskripsi**: Detail tambahan (opsional)
3. Klik **"Simpan"**

### **C. Filter per Kategori**

1. Lihat section **"Filter Kategori"**
2. Klik tombol kategori yang ingin dilihat
   - **Semua Kategori**: Tampilkan semua
   - **Jajan**: Hanya catatan jajan
   - **Adek**: Hanya catatan untuk adek
   - dst.

**Hasil:**
- Summary cards menampilkan total kategori tersebut
- List catatan hanya menampilkan kategori yang dipilih

### **D. Lihat Total per Kategori**

**Cara 1: Filter Kategori**
1. Klik kategori yang ingin dilihat
2. Lihat summary cards di atas
   - Total Pemasukan (kategori X)
   - Total Pengeluaran (kategori X)
   - Saldo (kategori X)

**Cara 2: Lihat Semua Kategori**
1. Klik "Semua Kategori"
2. Scroll ke bawah
3. Setiap grup kategori menampilkan total masing-masing

```
📁 Jajan
   Pemasukan: Rp 500.000 | Pengeluaran: Rp 300.000
   └── List catatan...

📁 Adek
   Pemasukan: Rp 1.000.000 | Pengeluaran: Rp 800.000
   └── List catatan...
```

### **E. Edit/Hapus Catatan**

1. Cari catatan yang ingin diedit/hapus
2. Klik icon **Pensil** untuk edit
3. Klik icon **Trash** untuk hapus
4. Konfirmasi aksi

---

## 👥 Fitur Tabungan Bersama

### **A. Tambah Catatan Bersama**

1. Klik tab **"Tabungan Bersama"**
2. Klik **"Tambah Catatan Bersama"**
3. Isi form (sama seperti pribadi, tapi tanpa kategori)
4. Klik **"Simpan"**

**Catatan:**
- Semua user bisa lihat catatan ini
- Semua user bisa edit & hapus

### **B. Lihat Catatan per Bulan**

Catatan bersama otomatis dikelompokkan per bulan:

```
📅 Oktober 2024
   Pemasukan: Rp 5.000.000 | Pengeluaran: Rp 3.500.000
   └── List catatan bulan Oktober...

📅 September 2024
   Pemasukan: Rp 4.500.000 | Pengeluaran: Rp 3.000.000
   └── List catatan bulan September...
```

---

## 🎯 Skenario Penggunaan

### **Skenario 1: Jayanto Track Jajan Pribadi**

**Tujuan:** Monitor pengeluaran jajan agar tidak boros

**Langkah:**
1. Login sebagai Jayanto
2. Tab "Tabungan Pribadi"
3. Buat kategori "Jajan"
4. Setiap beli kopi/makan → Tambah catatan kategori "Jajan"
5. Akhir bulan → Klik filter "Jajan"
6. Lihat total pengeluaran jajan bulan ini

**Manfaat:**
- Tahu berapa pengeluaran jajan per bulan
- Bisa set target budget
- Lintang Ayu tidak bisa lihat (privasi terjaga)

---

### **Skenario 2: Lintang Ayu Tabung untuk Adek**

**Tujuan:** Kelola uang kiriman untuk adek terpisah

**Langkah:**
1. Login sebagai Lintang Ayu
2. Tab "Tabungan Pribadi"
3. Buat kategori "Adek"
4. Setiap terima gaji → Tambah pemasukan kategori "Adek"
5. Setiap kirim uang → Tambah pengeluaran kategori "Adek"
6. Klik filter "Adek" untuk lihat saldo

**Manfaat:**
- Track berapa sudah dikirim ke adek
- Lihat saldo khusus untuk adek
- Jayanto tidak bisa lihat (privasi terjaga)

---

### **Skenario 3: Kelola Keuangan Rumah Tangga Bersama**

**Tujuan:** Transparansi keuangan rumah tangga

**Langkah:**
1. Login (Jayanto atau Lintang Ayu)
2. Tab "Tabungan Bersama"
3. Tambah catatan:
   - Gaji Jayanto → Pemasukan
   - Gaji Lintang Ayu → Pemasukan
   - Belanja Bulanan → Pengeluaran
   - Bayar Listrik → Pengeluaran
4. Kedua user bisa lihat & edit

**Manfaat:**
- Transparansi penuh
- Kedua pihak tahu kondisi keuangan
- Bisa diskusi budget bersama

---

## 💡 Tips & Trik

### **1. Naming Kategori**

**Good:**
- ✅ Jajan
- ✅ Adek
- ✅ Transportasi
- ✅ Kesehatan

**Avoid:**
- ❌ Kategori 1
- ❌ Lain-lain
- ❌ Misc

**Alasan:** Nama yang jelas memudahkan tracking

---

### **2. Konsisten Input Tanggal**

- Selalu input tanggal transaksi yang sebenarnya
- Jangan pakai tanggal hari ini untuk transaksi kemarin
- Ini penting untuk grouping per bulan yang akurat

---

### **3. Gunakan Deskripsi**

Tambahkan detail di deskripsi untuk catatan penting:
```
Judul: Belanja Bulanan
Deskripsi: Beras 10kg, Minyak 2L, Gula 1kg
```

---

### **4. Review Berkala**

**Setiap Minggu:**
- Cek pengeluaran minggu ini
- Bandingkan dengan minggu lalu

**Setiap Bulan:**
- Filter per kategori
- Analisa kategori mana yang paling boros
- Adjust budget bulan depan

---

## 🔐 Privacy & Security

### **Tabungan Pribadi**

✅ **Hanya Anda yang bisa lihat**
- Jayanto tidak bisa lihat catatan Lintang Ayu
- Lintang Ayu tidak bisa lihat catatan Jayanto

✅ **Hanya Anda yang bisa edit/hapus**
- Tidak ada user lain yang bisa ubah catatan Anda

### **Tabungan Bersama**

✅ **Semua user bisa lihat**
- Transparansi penuh

✅ **Semua user bisa edit/hapus**
- Kolaborasi mudah

---

## 📊 Memahami Summary Cards

### **Total Pemasukan**
- Jumlah semua transaksi tipe "Pemasukan"
- Warna hijau
- Icon trending up

### **Total Pengeluaran**
- Jumlah semua transaksi tipe "Pengeluaran"
- Warna merah
- Icon trending down

### **Saldo**
- Rumus: Total Pemasukan - Total Pengeluaran
- Hijau jika surplus (positif)
- Merah jika defisit (negatif)

**Contoh:**
```
Pemasukan: Rp 5.000.000
Pengeluaran: Rp 3.500.000
Saldo: Rp 1.500.000 (Surplus)
```

---

## 🎨 Memahami UI

### **Badge Pribadi vs Bersama**

**Pribadi:**
```
[🔒 Pribadi]  ← Badge abu-abu dengan icon lock
```

**Bersama:**
```
[👥 Bersama]  ← Badge outline dengan icon users
```

### **Color Coding**

- 🟢 **Hijau**: Pemasukan, Surplus
- 🔴 **Merah**: Pengeluaran, Defisit
- 🔵 **Biru**: Saldo positif
- ⚪ **Abu-abu**: Netral

---

## ❓ FAQ

### **Q: Apakah data saya aman?**
A: Ya, data pribadi hanya bisa dilihat oleh Anda. Data bersama bisa dilihat semua user.

### **Q: Bisa hapus kategori?**
A: Ya, tapi kategori yang masih digunakan tidak bisa dihapus. Hapus/pindahkan catatan dulu.

### **Q: Bisa ganti kategori catatan?**
A: Ya, klik edit pada catatan, lalu pilih kategori baru.

### **Q: Berapa maksimal kategori?**
A: Tidak ada limit, tapi disarankan 5-10 kategori agar mudah dikelola.

### **Q: Bisa export data?**
A: Belum tersedia di versi ini. Fitur akan ditambahkan nanti.

---

## 🐛 Troubleshooting

### **Problem: Kategori tidak muncul**
**Solusi:**
1. Refresh halaman
2. Pastikan sudah membuat kategori
3. Cek apakah di tab yang benar (Pribadi)

### **Problem: Catatan tidak tersimpan**
**Solusi:**
1. Pastikan migration database sudah dijalankan
2. Cek koneksi internet
3. Refresh dan coba lagi

### **Problem: Total tidak sesuai**
**Solusi:**
1. Cek filter kategori yang aktif
2. Pastikan di tab yang benar
3. Refresh halaman

---

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Cek dokumentasi ini
2. Cek file `FITUR-BARU.md`
3. Cek file `UPDATE-FILTER-KATEGORI.md`

---

**Selamat mengelola keuangan! 💰✨**
