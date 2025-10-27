-- ============================================
-- SCRIPT UPDATE DATABASE - PROFILE FEATURES
-- Fitur: Profile Management & Forgot Password
-- ============================================

-- 1. Tambahkan kolom profile ke tabel users
DO $$ 
BEGIN
    -- Tambah kolom name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN name TEXT;
    END IF;

    -- Tambah kolom phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN phone TEXT;
    END IF;

    -- Tambah kolom updated_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Update existing users dengan default name dari username
UPDATE public.users 
SET name = username 
WHERE name IS NULL;

-- 3. Buat tabel untuk password reset tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS untuk password_reset_tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy untuk password_reset_tokens (allow all karena custom auth)
DROP POLICY IF EXISTS "Allow all operations on password_reset_tokens" ON public.password_reset_tokens;

CREATE POLICY "Allow all operations on password_reset_tokens" 
ON public.password_reset_tokens
FOR ALL USING (true) WITH CHECK (true);

-- 6. Buat trigger untuk update updated_at di users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Drop trigger jika sudah ada
DROP TRIGGER IF EXISTS users_updated_at ON public.users;

-- Buat trigger baru
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- 7. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- 8. Function untuk cleanup expired tokens (opsional, bisa dijalankan manual)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Selesai!
-- Catatan: Untuk lupa password, aplikasi akan generate token dan simpan di tabel ini
