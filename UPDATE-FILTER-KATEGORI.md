# 🎯 Update: Filter Kategori untuk Tabungan Pribadi

## ✨ Fitur Baru

Sekarang di **Tabungan Pribadi**, Anda bisa **memfilter catatan berdasarkan kategori** dengan tampilan total pemasukan, pengeluaran, dan saldo per kategori.

---

## 📊 Cara Kerja

### **1. Filter Kategori**

Di tab "Tabungan Pribadi", sekarang ada section **Filter Kategori** dengan tombol-tombol:

```
┌─────────────────────────────────────────────┐
│  Filter Kategori                            │
├─────────────────────────────────────────────┤
│  [Semua Kategori] [Jajan] [Adek] [Belanja] │
└─────────────────────────────────────────────┘
```

### **2. Tampilan Summary Cards**

Ketika kategori dipilih, summary cards akan menampilkan:

**Sebelum (Semua Kategori):**
```
┌──────────────────────┐
│ Total Pemasukan      │
│ Rp 5.000.000         │
└──────────────────────┘
```

**Sesudah (Kategori "Adek" dipilih):**
```
┌──────────────────────┐
│ Total Pemasukan      │
│ Adek                 │ ← Nama kategori muncul
│ Rp 1.000.000         │
└──────────────────────┘
```

### **3. List Catatan**

- **Semua Kategori**: Catatan dikelompokkan per kategori
- **Kategori Spesifik**: Hanya tampil catatan kategori tersebut, dikelompokkan per bulan

---

## 🎮 Contoh Penggunaan

### **Skenario: Cek Tabungan untuk Adek**

1. Login sebagai **Lintang Ayu**
2. Klik tab **"Tabungan Pribadi"**
3. Klik tombol filter **"Adek"**
4. **Hasil:**
   - Total Pemasukan: Rp 2.000.000 (hanya kategori Adek)
   - Total Pengeluaran: Rp 1.500.000 (hanya kategori Adek)
   - Saldo: Rp 500.000 (hanya kategori Adek)
   - List catatan: Hanya catatan kategori Adek

### **Skenario: Cek Pengeluaran Jajan Bulan Ini**

1. Login sebagai **Jayanto**
2. Tab **"Tabungan Pribadi"**
3. Klik filter **"Jajan"**
4. **Hasil:**
   - Lihat total pengeluaran jajan
   - Lihat detail per bulan
   - Bisa analisa apakah jajan terlalu boros

---

## 🔍 Detail Implementasi

### **State Management**

Tambah state baru:
```typescript
const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
```

### **Filter Logic**

```typescript
const filteredNotes = notes.filter(note => {
  if (activeTab === 'private') {
    const isPrivateNote = note.is_private === true && note.user_id === user?.id;
    
    // Filter by category
    if (selectedCategoryId === 'all') {
      return isPrivateNote; // Tampilkan semua
    } else {
      return isPrivateNote && note.private_category_id === selectedCategoryId;
    }
  }
  // ... shared logic
});
```

### **UI Components**

**Filter Buttons:**
```tsx
<Button
  variant={selectedCategoryId === 'all' ? 'default' : 'outline'}
  onClick={() => setSelectedCategoryId('all')}
>
  Semua Kategori
</Button>

{privateCategories.map((category) => (
  <Button
    variant={selectedCategoryId === category.id ? 'default' : 'outline'}
    onClick={() => setSelectedCategoryId(category.id)}
  >
    {category.name}
  </Button>
))}
```

**Summary Card Label:**
```tsx
{activeTab === 'private' && selectedCategoryId !== 'all' && (
  <p className="text-xs text-muted-foreground mt-1">
    {privateCategories.find(c => c.id === selectedCategoryId)?.name}
  </p>
)}
```

---

## 📋 Behavior

### **Grouping Logic**

| Filter | Grouping |
|--------|----------|
| **Semua Kategori** | Group by **Kategori** |
| **Kategori Spesifik** | Group by **Bulan** |

**Contoh:**

**Filter: Semua Kategori**
```
📁 Jajan
   ├── Beli Kopi - Rp 25.000
   └── Makan Siang - Rp 50.000

📁 Adek
   ├── Kiriman Bulanan - Rp 500.000
   └── Uang Jajan - Rp 200.000
```

**Filter: Adek**
```
📅 Oktober 2024
   ├── Kiriman Bulanan - Rp 500.000
   └── Uang Jajan - Rp 200.000

📅 September 2024
   └── Kiriman Bulanan - Rp 500.000
```

---

## 🎨 UI/UX Features

✅ **Active State**: Tombol kategori aktif berwarna primary
✅ **Label Kategori**: Muncul di summary cards saat filter aktif
✅ **Responsive**: Filter buttons wrap otomatis di mobile
✅ **Clear Visual**: Mudah lihat kategori mana yang sedang aktif
✅ **Quick Switch**: Satu klik untuk ganti kategori

---

## 📊 Use Cases

### **1. Budget Tracking per Kategori**
- Cek berapa pengeluaran untuk "Jajan" bulan ini
- Bandingkan dengan bulan lalu
- Set target budget per kategori

### **2. Dedicated Savings**
- Track tabungan untuk "Adek" terpisah
- Monitor progress tabungan "Liburan"
- Kelola dana "Darurat"

### **3. Expense Analysis**
- Analisa kategori mana yang paling boros
- Identifikasi pola pengeluaran
- Buat keputusan finansial lebih baik

---

## 🔄 Workflow

```
User Flow:
1. Buka Tab "Tabungan Pribadi"
2. Lihat semua kategori (default)
3. Klik kategori spesifik (misal "Adek")
   ↓
4. Summary cards update → Total hanya kategori Adek
5. List catatan filter → Hanya catatan kategori Adek
6. Grouping berubah → Per bulan (bukan per kategori)
   ↓
7. Klik "Semua Kategori" untuk kembali
```

---

## 📁 File yang Dimodifikasi

### **`src/pages/Dashboard.tsx`**

**Perubahan:**
1. ✅ Tambah state `selectedCategoryId`
2. ✅ Update filter logic untuk support kategori
3. ✅ Tambah UI filter buttons
4. ✅ Tambah label kategori di summary cards
5. ✅ Update `showCategoryGrouping` logic

**Lines Changed:** ~50 lines

---

## 🎯 Hasil Akhir

### **Sebelum:**
- Hanya bisa lihat semua catatan pribadi sekaligus
- Tidak bisa fokus ke satu kategori
- Total selalu untuk semua kategori

### **Sesudah:**
- ✅ Bisa filter per kategori
- ✅ Total pemasukan/pengeluaran/saldo per kategori
- ✅ List catatan sesuai kategori yang dipilih
- ✅ UI yang jelas dan mudah digunakan

---

## 🚀 Next Steps

Fitur tambahan yang bisa dikembangkan:
- [ ] Budget limit per kategori
- [ ] Notifikasi jika melebihi budget
- [ ] Grafik per kategori
- [ ] Export data per kategori
- [ ] Perbandingan antar kategori

---

**Fitur siap digunakan! 🎉**

Tidak perlu migration database tambahan, cukup refresh aplikasi dan fitur filter kategori sudah aktif.
