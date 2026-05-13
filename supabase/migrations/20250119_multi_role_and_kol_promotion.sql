-- 1. Add roles array column to users (keep old role column for compatibility during migration)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['merchant']::TEXT[];

-- Backfill roles from existing role column
UPDATE public.users SET roles = ARRAY[role] WHERE role IS NOT NULL AND (roles IS NULL OR roles = ARRAY['merchant']::TEXT[]);

-- Update the handle_new_user trigger to also set roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, roles)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'merchant'),
    ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'merchant')]
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create kol_promotion_requests table
CREATE TABLE IF NOT EXISTS public.kol_promotion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  promotion_type TEXT NOT NULL,
  service_description TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  preferred_kol_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_followers TEXT NOT NULL,
  preferred_platform TEXT[] DEFAULT ARRAY[]::TEXT[],
  promotion_date TEXT,
  additional_requirements TEXT,
  status TEXT DEFAULT 'pending',
  handled_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  handled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
