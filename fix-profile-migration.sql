-- ============================================
-- SCRIPT FIX PROFILE MIGRATION
-- Jalankan ini jika database-profile-update.sql gagal
-- ============================================

-- 1. Force add columns to users table (akan skip jika sudah ada)
DO $$ 
BEGIN
    -- Add name column
    BEGIN
        ALTER TABLE public.users ADD COLUMN name TEXT;
        RAISE NOTICE 'Column name added successfully';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column name already exists, skipping';
    END;

    -- Add phone column
    BEGIN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
        RAISE NOTICE 'Column phone added successfully';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column phone already exists, skipping';
    END;

    -- Add updated_at column
    BEGIN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Column updated_at added successfully';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column updated_at already exists, skipping';
    END;
END $$;

-- 2. Update existing users dengan default name dari username
UPDATE public.users 
SET name = username 
WHERE name IS NULL;

-- 3. Verify columns exist
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('name', 'phone', 'updated_at')
ORDER BY column_name;

-- 4. Show sample data
SELECT 
    id, 
    username, 
    name, 
    phone,
    created_at,
    updated_at
FROM public.users 
LIMIT 3;
