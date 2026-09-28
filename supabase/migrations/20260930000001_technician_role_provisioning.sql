-- Keep technician profiles synchronized with profile-role transitions, including
-- administrative provisioning through the Supabase Auth API.
CREATE OR REPLACE FUNCTION public.sync_technician_role_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  IF NEW.role = 'TECHNICIAN' THEN
    INSERT INTO public.technicians (user_id, employee_code, is_active)
    VALUES (
      NEW.id,
      'COOLO-' || UPPER(LEFT(REPLACE(NEW.id::TEXT, '-', ''), 12)),
      TRUE
    )
    ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE, updated_at = NOW();
  ELSIF OLD.role = 'TECHNICIAN' THEN
    UPDATE public.technicians
    SET is_active = FALSE, updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_technician_role_profile ON public.profiles;
CREATE TRIGGER trg_sync_technician_role_profile
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_technician_role_profile();
