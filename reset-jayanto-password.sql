-- ============================================
-- RESET PASSWORD JAYANTO KE DEFAULT
-- ============================================

-- 1. Lihat password hash saat ini
SELECT username, password_hash, length(password_hash) as hash_length
FROM public.users 
WHERE username = 'Jayanto';

-- 2. Reset password ke JayaLintang123
-- Hash MD5 untuk 'JayaLintang123' adalah:
UPDATE public.users 
SET password_hash = md5('JayaLintang123')
WHERE username = 'Jayanto'
RETURNING id, username, password_hash, length(password_hash) as hash_length;

-- 3. Verifikasi hash
SELECT 
    username, 
    password_hash,
    length(password_hash) as hash_length,
    md5('JayaLintang123') as expected_hash,
    password_hash = md5('JayaLintang123') as is_correct
FROM public.users 
WHERE username = 'Jayanto';

-- 4. Reset untuk LintangAyu juga (jika ada)
UPDATE public.users 
SET password_hash = md5('JayaLintang123')
WHERE username = 'LintangAyu'
RETURNING id, username, password_hash;

-- Selesai! Sekarang password Jayanto dan LintangAyu = JayaLintang123
