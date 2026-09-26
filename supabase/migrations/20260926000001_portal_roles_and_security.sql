-- Secure role-aware portals and provision a customer profile for new auth users.

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION public.provision_auth_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_name TEXT;
BEGIN
  profile_name := COALESCE(
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    'Coolo customer'
  );

  INSERT INTO public.profiles (id, role, full_name, mobile, email)
  VALUES (
    NEW.id,
    'CUSTOMER',
    profile_name,
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'mobile'), ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.customers (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_provision_auth_user_profile ON auth.users;
CREATE TRIGGER trg_provision_auth_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.provision_auth_user_profile();

-- Backfill accounts created before the profile trigger was installed.
INSERT INTO public.profiles (id, role, full_name, email)
SELECT
  u.id,
  'CUSTOMER',
  COALESCE(NULLIF(BTRIM(u.raw_user_meta_data ->> 'full_name'), ''), NULLIF(SPLIT_PART(COALESCE(u.email, ''), '@', 1), ''), 'Coolo customer'),
  u.email
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.customers (user_id)
SELECT p.id
FROM public.profiles AS p
WHERE p.role = 'CUSTOMER'
ON CONFLICT (user_id) DO NOTHING;

-- A signed-in user may read their own customer/technician record only.
DROP POLICY IF EXISTS "Customers can view their own customer record" ON public.customers;
CREATE POLICY "Customers can view their own customer record"
  ON public.customers FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Technicians can view their own technician record" ON public.technicians;
CREATE POLICY "Technicians can view their own technician record"
  ON public.technicians FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- Let assigned technicians read and update only the job status of their bookings.
DROP POLICY IF EXISTS "Assigned technicians can update booking status" ON public.bookings;
CREATE POLICY "Assigned technicians can update booking status"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = bookings.id
        AND t.user_id = auth.uid()
        AND ta.status IN ('ASSIGNED', 'ACCEPTED')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = bookings.id
        AND t.user_id = auth.uid()
        AND ta.status IN ('ASSIGNED', 'ACCEPTED')
    )
  );

DROP POLICY IF EXISTS "Admins can update contact request status" ON public.contact_requests;
CREATE POLICY "Admins can update contact request status"
  ON public.contact_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Prevent self-promotion through the existing self-profile update policy.
CREATE OR REPLACE FUNCTION public.guard_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(auth.role(), '') <> 'service_role'
      AND SESSION_USER NOT IN ('postgres', 'supabase_admin')
     AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only a super administrator may change user roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role_change ON public.profiles;
CREATE TRIGGER trg_guard_profile_role_change
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role_change();

-- Constrain customer and technician updates even if they call the database directly.
CREATE OR REPLACE FUNCTION public.guard_booking_portal_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role public.user_role;
  is_assigned_technician BOOLEAN;
BEGIN
  IF COALESCE(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  actor_role := public.current_user_role();

  IF actor_role = 'CUSTOMER' THEN
    IF OLD.status NOT IN ('REQUESTED', 'CONFIRMED')
       OR NEW.status <> 'CANCELLED'
       OR (to_jsonb(NEW) - ARRAY['status', 'updated_at']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status', 'updated_at']) THEN
      RAISE EXCEPTION 'Customers may only cancel an upcoming booking';
    END IF;
  ELSIF actor_role = 'TECHNICIAN' THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = OLD.id
        AND t.user_id = auth.uid()
        AND ta.status IN ('ASSIGNED', 'ACCEPTED')
    ) INTO is_assigned_technician;

    IF NOT is_assigned_technician
       OR NEW.status NOT IN ('TECHNICIAN_ON_THE_WAY', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED')
       OR (to_jsonb(NEW) - ARRAY['status', 'updated_at']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status', 'updated_at']) THEN
      RAISE EXCEPTION 'Technicians may only update the status of their assigned jobs';
    END IF;
  ELSIF actor_role NOT IN ('ADMIN', 'SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Not authorized to update this booking';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_booking_portal_updates ON public.bookings;
CREATE TRIGGER trg_guard_booking_portal_updates
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.guard_booking_portal_updates();
