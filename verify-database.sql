-- Script untuk verifikasi apakah kolom sudah ada
-- Jalankan di Supabase SQL Editor untuk cek status database

-- 1. Cek kolom di tabel users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Cek apakah tabel password_reset_tokens ada
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'password_reset_tokens'
) as table_exists;

-- 3. Cek data sample dari users
SELECT id, username, name, phone, created_at, updated_at 
FROM public.users 
LIMIT 5;
