-- ============================================
-- FIX RLS POLICY UNTUK TABEL USERS
-- Masalah: UPDATE tidak berfungsi karena RLS terlalu ketat
-- ============================================

-- 1. Cek RLS policies yang ada
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. Drop semua policies lama
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- 3. Buat policy baru yang allow all (karena custom auth)
CREATE POLICY "Allow all operations on users"
ON public.users
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Pastikan RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Test update manual
UPDATE public.users 
SET name = 'Test Update ' || NOW()
WHERE username = 'Jayanto'
RETURNING id, username, name, updated_at;

-- 6. Jika update berhasil, coba update password
UPDATE public.users 
SET password_hash = md5('JayaLintang123')
WHERE username = 'Jayanto'
RETURNING id, username, password_hash;

-- 7. Verifikasi
SELECT id, username, name, phone, password_hash, updated_at
FROM public.users 
WHERE username = 'Jayanto';
