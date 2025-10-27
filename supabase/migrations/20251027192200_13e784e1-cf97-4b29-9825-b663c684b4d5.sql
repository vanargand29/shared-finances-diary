-- Create users table for custom authentication
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create financial_notes table
CREATE TABLE public.financial_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  is_private BOOLEAN DEFAULT true,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (public read for login)
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT USING (true);

-- RLS Policies for groups
CREATE POLICY "Users can view their groups" ON public.groups
  FOR SELECT USING (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update groups" ON public.groups
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Group creators can delete groups" ON public.groups
  FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for group_members
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_members.group_id AND (
        created_by = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.group_members gm 
          WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Group creators can add members" ON public.group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Group creators can remove members" ON public.group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- RLS Policies for financial_notes
CREATE POLICY "Users can view their private notes" ON public.financial_notes
  FOR SELECT USING (
    (is_private = true AND user_id = auth.uid()) OR
    (is_private = false AND EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_id = financial_notes.group_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create notes" ON public.financial_notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their notes" ON public.financial_notes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their notes" ON public.financial_notes
  FOR DELETE USING (user_id = auth.uid());

-- Insert the two users with MD5 hashed passwords
-- MD5('JayaLintang123') = '5e3e5a8f3c5e5a8f3c5e5a8f3c5e5a8f' (example hash)
INSERT INTO public.users (username, password_hash) VALUES
  ('LintangAyu', md5('JayaLintang123')),
  ('Jayanto', md5('JayaLintang123'));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER financial_notes_updated_at
  BEFORE UPDATE ON public.financial_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();