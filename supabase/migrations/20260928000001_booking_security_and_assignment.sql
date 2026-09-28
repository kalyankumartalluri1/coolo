-- Close public-write paths and ensure technician access always reflects active status.
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
REVOKE INSERT ON public.bookings FROM anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit contact requests" ON public.contact_requests;
REVOKE INSERT ON public.contact_requests FROM anon, authenticated;

DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.bookings;
CREATE POLICY "Customers and active assigned technicians can view bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM public.customers WHERE id = bookings.customer_id)
    OR public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = bookings.id
        AND t.user_id = auth.uid()
        AND t.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Technicians can see assigned jobs" ON public.technician_assignments;
CREATE POLICY "Active technicians can see assigned jobs"
  ON public.technician_assignments FOR SELECT
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE user_id = auth.uid() AND is_active = TRUE
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Technicians can update job status" ON public.technician_assignments;
CREATE POLICY "Active technicians can update assigned jobs"
  ON public.technician_assignments FOR UPDATE
  USING (
    technician_id IN (
      SELECT id FROM public.technicians WHERE user_id = auth.uid() AND is_active = TRUE
    )
    OR public.is_admin()
  )
  WITH CHECK (
    technician_id IN (
      SELECT id FROM public.technicians WHERE user_id = auth.uid() AND is_active = TRUE
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Assigned technicians can update booking status" ON public.bookings;
CREATE POLICY "Active assigned technicians can update booking status"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = bookings.id
        AND t.user_id = auth.uid()
        AND t.is_active = TRUE
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
        AND t.is_active = TRUE
        AND ta.status IN ('ASSIGNED', 'ACCEPTED')
    )
  );

-- Recreate the booking guard with the same active-technician check as RLS.
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
        AND t.is_active = TRUE
        AND ta.status IN ('ASSIGNED', 'ACCEPTED')
    ) INTO is_assigned_technician;

    IF NOT is_assigned_technician
       OR NEW.status NOT IN ('TECHNICIAN_ON_THE_WAY', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL', 'COMPLETED')
       OR (to_jsonb(NEW) - ARRAY['status', 'updated_at']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status', 'updated_at']) THEN
      RAISE EXCEPTION 'Technicians may only update the status of their active assigned jobs';
    END IF;
  ELSIF actor_role NOT IN ('ADMIN', 'SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Not authorized to update this booking';
  END IF;

  RETURN NEW;
END;
$$;

-- A customer promoted back from staff retains a usable customer record.
CREATE OR REPLACE FUNCTION public.provision_customer_on_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'CUSTOMER' AND OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.customers (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_provision_customer_on_role_change ON public.profiles;
CREATE TRIGGER trg_provision_customer_on_role_change
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.provision_customer_on_role_change();

-- Keep assignment and booking status changes within one database transaction.
CREATE OR REPLACE FUNCTION public.assign_booking_technician(
  target_booking_id UUID,
  target_technician_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_assignment_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can assign technicians';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.technicians
    WHERE id = target_technician_id AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'The selected technician is not active';
  END IF;

  PERFORM 1 FROM public.bookings WHERE id = target_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The selected booking does not exist';
  END IF;

  SELECT id INTO existing_assignment_id
  FROM public.technician_assignments
  WHERE booking_id = target_booking_id
    AND status IN ('ASSIGNED', 'ACCEPTED')
  ORDER BY assigned_at DESC
  LIMIT 1
  FOR UPDATE;

  IF existing_assignment_id IS NULL THEN
    INSERT INTO public.technician_assignments (booking_id, technician_id, status)
    VALUES (target_booking_id, target_technician_id, 'ASSIGNED');
  ELSE
    UPDATE public.technician_assignments
    SET technician_id = target_technician_id, status = 'ASSIGNED', assigned_at = NOW()
    WHERE id = existing_assignment_id;
  END IF;

  UPDATE public.bookings SET status = 'ASSIGNED' WHERE id = target_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_booking_technician(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_booking_technician(UUID, UUID) TO authenticated;
