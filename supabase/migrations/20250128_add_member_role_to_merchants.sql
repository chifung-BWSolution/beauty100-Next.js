-- Ensure all merchants and sub_merchants also have 'member' in their roles array
-- This allows them to access all member functions
UPDATE public.users
SET roles = array_append(roles, 'member')
WHERE (roles @> ARRAY['merchant']::TEXT[] OR roles @> ARRAY['sub_merchant']::TEXT[])
  AND NOT (roles @> ARRAY['member']::TEXT[]);

-- Also ensure staff (admin/marketing) have 'member' in their roles
UPDATE public.users
SET roles = array_append(roles, 'member')
WHERE (roles @> ARRAY['admin']::TEXT[] OR roles @> ARRAY['marketing']::TEXT[])
  AND NOT (roles @> ARRAY['member']::TEXT[]);

-- Update the handle_new_user trigger to always include 'member' for merchants
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_roles TEXT[];
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'merchant');
  
  -- Merchants and sub_merchants always get 'member' role too
  IF user_role IN ('merchant', 'sub_merchant', 'admin', 'marketing') THEN
    user_roles := ARRAY[user_role, 'member'];
  ELSE
    user_roles := ARRAY[user_role];
  END IF;

  INSERT INTO public.users (id, email, full_name, role, roles)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role,
    user_roles
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
