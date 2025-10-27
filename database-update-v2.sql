-- ============================================
-- SCRIPT UPDATE DATABASE V2
-- Fitur: Pemisahan Tabungan Pribadi & Bersama dengan Kategori
-- ============================================

-- 1. Buat tabel untuk kategori pribadi
CREATE TABLE IF NOT EXISTS public.private_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 2. Tambahkan kolom private_category_id ke financial_notes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_notes' 
        AND column_name = 'private_category_id'
    ) THEN
        ALTER TABLE public.financial_notes 
        ADD COLUMN private_category_id UUID REFERENCES public.private_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Tambahkan kolom transaction_date jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_notes' 
        AND column_name = 'transaction_date'
    ) THEN
        ALTER TABLE public.financial_notes 
        ADD COLUMN transaction_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- 4. Enable RLS untuk private_categories
ALTER TABLE public.private_categories ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing RLS policies untuk financial_notes
DROP POLICY IF EXISTS "Users can view their private notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can create notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can update their notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can delete their notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Allow all select" ON public.financial_notes;
DROP POLICY IF EXISTS "Allow all insert" ON public.financial_notes;
DROP POLICY IF EXISTS "Allow all update" ON public.financial_notes;
DROP POLICY IF EXISTS "Allow all delete" ON public.financial_notes;

-- 6. Buat RLS policies baru untuk financial_notes
-- Karena menggunakan custom auth, kita allow all operations
CREATE POLICY "Allow all operations on financial_notes" ON public.financial_notes
  FOR ALL USING (true) WITH CHECK (true);

-- 7. RLS Policies untuk private_categories (allow all karena custom auth)
CREATE POLICY "Allow all operations on private_categories" ON public.private_categories
  FOR ALL USING (true) WITH CHECK (true);

-- 8. Update existing records untuk set transaction_date dari created_at
UPDATE public.financial_notes 
SET transaction_date = created_at::date 
WHERE transaction_date IS NULL;

-- 9. Insert default private categories untuk existing users
INSERT INTO public.private_categories (user_id, name)
SELECT u.id, 'Umum'
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.private_categories pc 
  WHERE pc.user_id = u.id AND pc.name = 'Umum'
);

-- 10. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_financial_notes_user_id ON public.financial_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_notes_is_private ON public.financial_notes(is_private);
CREATE INDEX IF NOT EXISTS idx_financial_notes_private_category_id ON public.financial_notes(private_category_id);
CREATE INDEX IF NOT EXISTS idx_private_categories_user_id ON public.private_categories(user_id);

-- Selesai!
-- Catatan: Karena menggunakan custom authentication (bukan Supabase Auth),
-- filtering data pribadi/bersama akan dilakukan di application layer
