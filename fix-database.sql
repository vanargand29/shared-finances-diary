-- Script untuk memperbaiki database
-- Jalankan script ini di Supabase SQL Editor

-- 1. Tambahkan kolom transaction_date jika belum ada
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

-- 2. Drop existing RLS policies yang menggunakan auth.uid()
DROP POLICY IF EXISTS "Users can view their private notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can create notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can update their notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can delete their notes" ON public.financial_notes;

-- 3. Buat RLS policies baru yang allow all (karena menggunakan custom auth)
CREATE POLICY "Allow all select" ON public.financial_notes
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert" ON public.financial_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update" ON public.financial_notes
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete" ON public.financial_notes
  FOR DELETE USING (true);

-- 4. Update existing records untuk set transaction_date dari created_at
UPDATE public.financial_notes 
SET transaction_date = created_at::date 
WHERE transaction_date IS NULL;
