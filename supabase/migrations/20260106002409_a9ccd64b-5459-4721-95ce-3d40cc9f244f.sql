-- Add 'owner' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';

-- Insert owner role for the specific user (will be applied after they sign up)
-- This creates a function to assign owner role when the user with this email signs in
CREATE OR REPLACE FUNCTION public.assign_owner_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user has the owner email
  IF NEW.email = 'bhulku2@gmail.com' THEN
    -- Insert owner role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to run after user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_owner ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_owner_role();