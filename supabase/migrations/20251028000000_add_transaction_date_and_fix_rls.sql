-- Add transaction_date column to financial_notes
ALTER TABLE public.financial_notes 
ADD COLUMN transaction_date DATE DEFAULT CURRENT_DATE;

-- Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their private notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can create notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can update their notes" ON public.financial_notes;
DROP POLICY IF EXISTS "Users can delete their notes" ON public.financial_notes;

-- Create new RLS policies that allow all operations (since we're using custom auth)
-- The application layer will handle authorization
CREATE POLICY "Allow all select" ON public.financial_notes
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert" ON public.financial_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update" ON public.financial_notes
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete" ON public.financial_notes
  FOR DELETE USING (true);
