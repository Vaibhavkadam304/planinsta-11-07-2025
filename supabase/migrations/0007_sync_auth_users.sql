-- 0007_sync_auth_users.sql

----------------------------------------------------------------
-- 1) A SECURITY DEFINER function to upsert into public.users
----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_auth_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.user_metadata ->> 'full_name',
    NEW.email,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE
    SET
      full_name  = COALESCE(NEW.user_metadata ->> 'full_name', public.users.full_name),
      email      = NEW.email,
      updated_at = NOW();

  RETURN NEW;
END;
$$;

----------------------------------------------------------------
-- 2) Trigger on auth.users that fires AFTER INSERT OR UPDATE
----------------------------------------------------------------
DROP TRIGGER IF EXISTS auth_user_sync ON auth.users;

CREATE TRIGGER auth_user_sync
  AFTER INSERT OR UPDATE
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user();
