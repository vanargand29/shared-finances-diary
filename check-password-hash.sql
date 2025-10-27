-- Cek perbedaan hash antara CryptoJS dan PostgreSQL md5()

-- Hash dari CryptoJS.MD5('JayaLintang123')
-- Hasil: 5f4dcc3b5aa765d61d8327deb882cf99 (contoh, bisa beda)

-- Hash dari PostgreSQL md5('JayaLintang123')
SELECT md5('JayaLintang123') as pg_md5_hash;

-- Lihat password hash yang tersimpan di database
SELECT username, password_hash 
FROM public.users 
WHERE username = 'Jayanto';

-- Test: Update dengan hash yang benar
-- Jalankan di JavaScript console browser untuk dapat hash CryptoJS:
-- CryptoJS.MD5('Gratis123').toString()
