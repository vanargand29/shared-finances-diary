-- Test apakah update berfungsi
-- Jalankan di Supabase SQL Editor untuk test manual

-- 1. Lihat data user sebelum update
SELECT id, username, name, phone, password_hash 
FROM public.users 
WHERE username = 'Jayanto';

-- 2. Test update name
UPDATE public.users 
SET name = 'Test Update Name'
WHERE username = 'Jayanto';

-- 3. Lihat hasil update
SELECT id, username, name, phone, password_hash 
FROM public.users 
WHERE username = 'Jayanto';

-- 4. Test update password
UPDATE public.users 
SET password_hash = md5('TestPassword123')
WHERE username = 'Jayanto';

-- 5. Lihat hasil
SELECT id, username, password_hash 
FROM public.users 
WHERE username = 'Jayanto';

-- 6. Kembalikan ke password asli
UPDATE public.users 
SET password_hash = md5('JayaLintang123')
WHERE username = 'Jayanto';
