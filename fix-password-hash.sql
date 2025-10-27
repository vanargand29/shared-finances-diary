-- ============================================
-- FIX PASSWORD HASH FORMAT
-- Masalah: Password hash di database mungkin menggunakan format PostgreSQL md5()
-- Solusi: Update ke format CryptoJS MD5 yang digunakan aplikasi
-- ============================================

-- 1. Cek password hash saat ini
SELECT username, password_hash, length(password_hash) as hash_length
FROM public.users;

-- 2. Reset password Jayanto ke JayaLintang123 dengan format CryptoJS
-- Hash CryptoJS.MD5('JayaLintang123') = '5f4dcc3b5aa765d61d8327deb882cf99'
-- TAPI ini hash untuk 'password', bukan 'JayaLintang123'

-- Untuk mendapatkan hash yang benar, jalankan di browser console:
-- CryptoJS.MD5('JayaLintang123').toString()

-- Contoh update (ganti dengan hash yang benar):
-- UPDATE public.users 
-- SET password_hash = 'HASH_DARI_CRYPTOJS'
-- WHERE username = 'Jayanto';

-- 3. Atau gunakan PostgreSQL md5() (tapi ini akan berbeda dengan CryptoJS!)
-- UPDATE public.users 
-- SET password_hash = md5('JayaLintang123')
-- WHERE username = 'Jayanto';

-- 4. Verifikasi
SELECT username, password_hash 
FROM public.users 
WHERE username = 'Jayanto';

-- ============================================
-- CATATAN PENTING:
-- CryptoJS.MD5() dan PostgreSQL md5() menghasilkan hash BERBEDA!
-- 
-- Contoh:
-- CryptoJS.MD5('test') = '098f6bcd4621d373cade4e832627b4f6'
-- PostgreSQL md5('test') = '098f6bcd4621d373cade4e832627b4f6'
-- 
-- Ternyata SAMA! Jadi masalahnya bukan di hash function.
-- Masalahnya mungkin di RLS atau update query yang tidak berjalan.
-- ============================================
