-- Complete guarded role workflows for staff onboarding, assignments, estimates,
-- service completion, cash reconciliation, reviews, notifications, and audit history.
ALTER FUNCTION public.current_user_role() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;

-- Role changes are performed atomically and cannot remove the final super-admin.
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id UUID,
  target_role public.user_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  previous_role public.user_role;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only a super administrator may change user roles';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Use another super administrator to change your own role';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('coolo-role-management', 0));
  SELECT role INTO previous_role
  FROM public.profiles
  WHERE id = target_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The selected user does not exist';
  END IF;

  IF previous_role = 'SUPER_ADMIN' AND target_role <> 'SUPER_ADMIN'
     AND (SELECT COUNT(*) FROM public.profiles WHERE role = 'SUPER_ADMIN') <= 1 THEN
    RAISE EXCEPTION 'The final super administrator cannot be demoted';
  END IF;

  IF target_role = 'TECHNICIAN' THEN
    INSERT INTO public.technicians (user_id, employee_code, is_active)
    VALUES (
      target_user_id,
      'COOLO-' || UPPER(LEFT(REPLACE(target_user_id::TEXT, '-', ''), 12)),
      TRUE
    )
    ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE, updated_at = NOW();
  ELSIF previous_role = 'TECHNICIAN' THEN
    UPDATE public.technicians
    SET is_active = FALSE, updated_at = NOW()
    WHERE user_id = target_user_id;
  END IF;

  UPDATE public.profiles
  SET role = target_role, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_user_role(UUID, public.user_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, public.user_role) TO authenticated;

-- Assignment rows can be read by their technician but only changed through
-- security-definer workflows or administrator assignment RPCs.
DROP POLICY IF EXISTS "Active technicians can update assigned jobs" ON public.technician_assignments;
DROP POLICY IF EXISTS "Technicians can update job status" ON public.technician_assignments;
REVOKE INSERT, UPDATE, DELETE ON public.technician_assignments FROM anon, authenticated;

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
  current_status public.booking_status;
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

  SELECT status INTO current_status
  FROM public.bookings
  WHERE id = target_booking_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'The selected booking does not exist';
  END IF;
  IF current_status NOT IN ('REQUESTED', 'CONFIRMED', 'ASSIGNED') THEN
    RAISE EXCEPTION 'Only requested or confirmed bookings can be assigned';
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
    SET technician_id = target_technician_id, status = 'ASSIGNED', assigned_at = NOW(), rejection_reason = NULL
    WHERE id = existing_assignment_id;
  END IF;

  IF current_status <> 'ASSIGNED' THEN
    UPDATE public.bookings SET status = 'ASSIGNED', updated_at = NOW() WHERE id = target_booking_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_booking_technician(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_booking_technician(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_to_assignment(
  target_assignment_id UUID,
  accept_assignment BOOLEAN,
  decline_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  technician_id UUID;
  assignment_state public.assignment_status;
  booking_state public.booking_status;
BEGIN
  IF actor_id IS NULL OR public.current_user_role() <> 'TECHNICIAN' THEN
    RAISE EXCEPTION 'Only technicians can respond to assignments';
  END IF;

  SELECT t.id, ta.status, b.status
  INTO technician_id, assignment_state, booking_state
  FROM public.technicians AS t
  JOIN public.technician_assignments AS ta ON ta.technician_id = t.id
  JOIN public.bookings AS b ON b.id = ta.booking_id
  WHERE t.user_id = actor_id AND t.is_active = TRUE AND ta.id = target_assignment_id
  FOR UPDATE OF ta, b;

  IF NOT FOUND OR assignment_state <> 'ASSIGNED' OR booking_state <> 'ASSIGNED' THEN
    RAISE EXCEPTION 'This assignment is no longer awaiting your response';
  END IF;

  UPDATE public.technician_assignments
  SET status = CASE WHEN accept_assignment THEN 'ACCEPTED'::public.assignment_status ELSE 'REJECTED'::public.assignment_status END,
      rejection_reason = CASE WHEN accept_assignment THEN NULL ELSE LEFT(BTRIM(COALESCE(decline_reason, '')), 500) END
  WHERE id = target_assignment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.respond_to_assignment(UUID, BOOLEAN, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.respond_to_assignment(UUID, BOOLEAN, TEXT) TO authenticated;

-- Portal reads for operational records; writes are restricted to the RPCs below.
DROP POLICY IF EXISTS "Portal participants can read estimates" ON public.service_estimates;
CREATE POLICY "Portal participants can read estimates"
  ON public.service_estimates FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.bookings AS b
      JOIN public.customers AS c ON c.id = b.customer_id
      WHERE b.id = service_estimates.booking_id AND c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = service_estimates.booking_id
        AND t.user_id = auth.uid() AND t.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Portal participants can read estimate items" ON public.estimate_items;
CREATE POLICY "Portal participants can read estimate items"
  ON public.estimate_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.service_estimates AS e
      JOIN public.bookings AS b ON b.id = e.booking_id
      WHERE e.id = estimate_items.estimate_id
        AND (
          public.is_admin()
          OR EXISTS (
            SELECT 1 FROM public.customers AS c
            WHERE c.id = b.customer_id AND c.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1
            FROM public.technician_assignments AS ta
            JOIN public.technicians AS t ON t.id = ta.technician_id
            WHERE ta.booking_id = b.id AND t.user_id = auth.uid() AND t.is_active = TRUE
          )
        )
    )
  );

DROP POLICY IF EXISTS "Portal participants can read service records" ON public.service_records;
CREATE POLICY "Portal participants can read service records"
  ON public.service_records FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bookings AS b
      JOIN public.customers AS c ON c.id = b.customer_id
      WHERE b.id = service_records.booking_id AND c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.technicians AS t
      WHERE t.id = service_records.technician_id AND t.user_id = auth.uid() AND t.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Portal participants can read payments" ON public.payments;
CREATE POLICY "Portal participants can read payments"
  ON public.payments FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bookings AS b
      JOIN public.customers AS c ON c.id = b.customer_id
      WHERE b.id = payments.booking_id AND c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = payments.booking_id AND t.user_id = auth.uid() AND t.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Portal participants can read booking history" ON public.booking_status_history;
CREATE POLICY "Portal participants can read booking history"
  ON public.booking_status_history FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bookings AS b
      JOIN public.customers AS c ON c.id = b.customer_id
      WHERE b.id = booking_status_history.booking_id AND c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = booking_status_history.booking_id
        AND t.user_id = auth.uid() AND t.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications"
  ON public.notifications FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Users can mark their own notifications read" ON public.notifications;
CREATE POLICY "Users can mark their own notifications read"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Customers can create their own reviews" ON public.reviews;
CREATE POLICY "Customers can create their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.bookings AS b
      WHERE b.id = reviews.booking_id
        AND b.customer_id = reviews.customer_id
        AND b.status = 'COMPLETED'
    )
  );

-- Technician-submitted estimates are atomic and always require customer approval.
CREATE OR REPLACE FUNCTION public.submit_service_estimate(
  target_booking_id UUID,
  estimate_items JSONB,
  tax_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  estimate_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  active_technician_id UUID;
  customer_user_id UUID;
  estimate_id UUID;
  subtotal NUMERIC(10, 2);
  total NUMERIC(10, 2);
BEGIN
  IF actor_id IS NULL OR public.current_user_role() <> 'TECHNICIAN' THEN
    RAISE EXCEPTION 'Only technicians can submit service estimates';
  END IF;
  IF jsonb_typeof(estimate_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Estimate line items must be a JSON array';
  END IF;
  IF jsonb_array_length(estimate_items) NOT BETWEEN 1 AND 30 THEN
    RAISE EXCEPTION 'An estimate must contain between 1 and 30 line items';
  END IF;
    IF COALESCE(tax_amount, 0) < 0 OR COALESCE(tax_amount, 0) > 10000000
      OR COALESCE(discount_amount, 0) < 0 OR COALESCE(discount_amount, 0) > 10000000 THEN
    RAISE EXCEPTION 'Tax and discount cannot be negative';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(estimate_items) AS i(item_type TEXT, description TEXT, quantity INTEGER, unit_price NUMERIC)
    WHERE i.item_type NOT IN ('PART', 'LABOUR', 'GAS', 'OTHER')
       OR NULLIF(BTRIM(i.description), '') IS NULL
       OR LENGTH(i.description) > 300
       OR i.quantity IS NULL OR i.quantity < 1 OR i.quantity > 1000
       OR i.unit_price IS NULL OR i.unit_price < 0 OR i.unit_price > 1000000
  ) THEN
    RAISE EXCEPTION 'Estimate line items contain invalid values';
  END IF;

  SELECT t.id, c.user_id
  INTO active_technician_id, customer_user_id
  FROM public.technicians AS t
  JOIN public.technician_assignments AS ta ON ta.technician_id = t.id
  JOIN public.bookings AS b ON b.id = ta.booking_id
  LEFT JOIN public.customers AS c ON c.id = b.customer_id
  WHERE t.user_id = actor_id AND t.is_active = TRUE
    AND ta.booking_id = target_booking_id AND ta.status = 'ACCEPTED'
    AND b.status = 'IN_PROGRESS' AND b.customer_id IS NOT NULL
  FOR UPDATE OF b;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only an accepted technician on an account booking can submit an estimate';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.service_estimates
    WHERE booking_id = target_booking_id AND status = 'PENDING_APPROVAL'
  ) THEN
    RAISE EXCEPTION 'There is already an estimate awaiting customer approval';
  END IF;

  SELECT COALESCE(SUM(i.quantity * i.unit_price), 0)::NUMERIC(10, 2)
  INTO subtotal
  FROM jsonb_to_recordset(estimate_items) AS i(item_type TEXT, description TEXT, quantity INTEGER, unit_price NUMERIC);
  total := subtotal + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0);
  IF total < 0 THEN RAISE EXCEPTION 'Discount cannot exceed the estimate total'; END IF;

  INSERT INTO public.service_estimates (
    booking_id, technician_id, subtotal, tax_amount, discount_amount, total_amount, notes
  ) VALUES (
    target_booking_id, active_technician_id, subtotal, COALESCE(tax_amount, 0),
    COALESCE(discount_amount, 0), total, LEFT(BTRIM(COALESCE(estimate_notes, '')), 1000)
  ) RETURNING id INTO estimate_id;

  INSERT INTO public.estimate_items (estimate_id, item_type, description, quantity, unit_price, total_price)
  SELECT estimate_id, i.item_type, BTRIM(i.description), i.quantity, i.unit_price,
         (i.quantity * i.unit_price)::NUMERIC(10, 2)
  FROM jsonb_to_recordset(estimate_items) AS i(item_type TEXT, description TEXT, quantity INTEGER, unit_price NUMERIC);

  PERFORM set_config('coolo.portal_workflow', 'on', TRUE);
  UPDATE public.bookings
  SET status = 'WAITING_FOR_APPROVAL', estimated_price = total, updated_at = NOW()
  WHERE id = target_booking_id;

  IF customer_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (customer_user_id, 'ESTIMATE', 'Estimate ready for review', 'Your technician submitted a service estimate for approval.', '/portal');
  END IF;
  RETURN estimate_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_service_estimate(UUID, JSONB, NUMERIC, NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_service_estimate(UUID, JSONB, NUMERIC, NUMERIC, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.decide_service_estimate(
  target_estimate_id UUID,
  approve_estimate BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  booking_id UUID;
  technician_user_id UUID;
  customer_user_id UUID;
BEGIN
  IF actor_id IS NULL OR public.current_user_role() <> 'CUSTOMER' THEN
    RAISE EXCEPTION 'Only the booking customer can decide an estimate';
  END IF;

  SELECT e.booking_id, t.user_id, c.user_id
  INTO booking_id, technician_user_id, customer_user_id
  FROM public.service_estimates AS e
  JOIN public.bookings AS b ON b.id = e.booking_id
  JOIN public.customers AS c ON c.id = b.customer_id
  JOIN public.technicians AS t ON t.id = e.technician_id
  WHERE e.id = target_estimate_id AND c.user_id = actor_id
    AND b.status = 'WAITING_FOR_APPROVAL' AND e.status = 'PENDING_APPROVAL'
  FOR UPDATE OF e, b;

  IF NOT FOUND THEN RAISE EXCEPTION 'This estimate is not awaiting your decision'; END IF;

  UPDATE public.service_estimates
  SET status = CASE WHEN approve_estimate THEN 'APPROVED'::public.estimate_status ELSE 'REJECTED'::public.estimate_status END,
      updated_at = NOW()
  WHERE id = target_estimate_id;

  PERFORM set_config('coolo.portal_workflow', 'on', TRUE);
  UPDATE public.bookings SET status = 'IN_PROGRESS', updated_at = NOW() WHERE id = booking_id;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    technician_user_id,
    'ESTIMATE_DECISION',
    CASE WHEN approve_estimate THEN 'Estimate approved' ELSE 'Estimate declined' END,
    CASE WHEN approve_estimate THEN 'The customer approved your estimate.' ELSE 'The customer declined your estimate. Review the job before proceeding.' END,
    '/portal'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.decide_service_estimate(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_service_estimate(UUID, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_service_job(
  target_booking_id UUID,
  diagnosis_notes TEXT,
  work_performed TEXT,
  service_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  active_technician_id UUID;
  customer_user_id UUID;
BEGIN
  IF actor_id IS NULL OR public.current_user_role() <> 'TECHNICIAN' THEN
    RAISE EXCEPTION 'Only the assigned technician can complete this service report';
  END IF;
  IF NULLIF(BTRIM(work_performed), '') IS NULL OR LENGTH(work_performed) > 5000
     OR LENGTH(COALESCE(diagnosis_notes, '')) > 5000
    OR service_amount IS NULL OR service_amount < 0 OR service_amount > 10000000 THEN
    RAISE EXCEPTION 'Service report or final amount is invalid';
  END IF;

  SELECT t.id, c.user_id
  INTO active_technician_id, customer_user_id
  FROM public.technicians AS t
  JOIN public.technician_assignments AS ta ON ta.technician_id = t.id
  JOIN public.bookings AS b ON b.id = ta.booking_id
  LEFT JOIN public.customers AS c ON c.id = b.customer_id
  WHERE t.user_id = actor_id AND t.is_active = TRUE
    AND ta.booking_id = target_booking_id AND ta.status = 'ACCEPTED'
    AND b.status = 'IN_PROGRESS'
  FOR UPDATE OF b;

  IF NOT FOUND THEN RAISE EXCEPTION 'Only an active assigned technician can complete an in-progress job'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.service_estimates
    WHERE booking_id = target_booking_id AND status = 'PENDING_APPROVAL'
  ) THEN
    RAISE EXCEPTION 'Wait for the customer to decide the pending estimate before completing this job';
  END IF;

  INSERT INTO public.service_records (
    booking_id, technician_id, diagnosis_notes, work_performed, final_amount
  ) VALUES (
    target_booking_id, active_technician_id, NULLIF(BTRIM(diagnosis_notes), ''), BTRIM(work_performed), service_amount
  )
  ON CONFLICT (booking_id) DO UPDATE SET
    technician_id = EXCLUDED.technician_id,
    diagnosis_notes = EXCLUDED.diagnosis_notes,
    work_performed = EXCLUDED.work_performed,
    final_amount = EXCLUDED.final_amount,
    completed_at = NOW();

  PERFORM set_config('coolo.portal_workflow', 'on', TRUE);
  UPDATE public.bookings
  SET status = 'COMPLETED', final_amount = service_amount, updated_at = NOW()
  WHERE id = target_booking_id;

  UPDATE public.technician_assignments AS ta
  SET status = 'COMPLETED'
  WHERE ta.booking_id = target_booking_id
    AND ta.technician_id = active_technician_id
    AND ta.status = 'ACCEPTED';

  INSERT INTO public.payments (booking_id, amount, payment_method, status, notes)
  SELECT target_booking_id, service_amount, 'CASH', 'PENDING', 'Cash collection pending'
  WHERE NOT EXISTS (SELECT 1 FROM public.payments WHERE booking_id = target_booking_id AND status IN ('PENDING', 'AUTHORIZED', 'PAID', 'CASH'));

  IF customer_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (customer_user_id, 'SERVICE_COMPLETED', 'Service completed', 'Your technician submitted the service report.', '/portal');
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_service_job(UUID, TEXT, TEXT, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_service_job(UUID, TEXT, TEXT, NUMERIC) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_cash_payment(target_payment_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can reconcile cash payments';
  END IF;
  UPDATE public.payments AS p
  SET status = 'CASH', notes = 'Cash collection confirmed', updated_at = NOW()
  FROM public.bookings AS b
  WHERE p.id = target_payment_id AND p.booking_id = b.id
    AND b.status = 'COMPLETED' AND p.payment_method = 'CASH' AND p.status = 'PENDING';
  IF NOT FOUND THEN RAISE EXCEPTION 'No pending cash payment exists for a completed booking'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.record_cash_payment(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_cash_payment(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_booking_review(
  target_booking_id UUID,
  review_rating INTEGER,
  review_comment TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  customer_id UUID;
BEGIN
  IF actor_id IS NULL OR public.current_user_role() <> 'CUSTOMER' THEN
    RAISE EXCEPTION 'Only customers can review completed services';
  END IF;
  IF review_rating < 1 OR review_rating > 5 OR LENGTH(COALESCE(review_comment, '')) > 2000 THEN
    RAISE EXCEPTION 'Review rating or comment is invalid';
  END IF;

  SELECT c.id INTO customer_id
  FROM public.customers AS c
  JOIN public.bookings AS b ON b.customer_id = c.id
  WHERE b.id = target_booking_id AND c.user_id = actor_id AND b.status = 'COMPLETED';
  IF NOT FOUND THEN RAISE EXCEPTION 'Only the customer of a completed booking can submit a review'; END IF;

  INSERT INTO public.reviews (booking_id, customer_id, rating, comment, is_moderated, is_published)
  VALUES (target_booking_id, customer_id, review_rating, NULLIF(BTRIM(review_comment), ''), TRUE, TRUE);
END;
$$;

REVOKE ALL ON FUNCTION public.submit_booking_review(UUID, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_booking_review(UUID, INTEGER, TEXT) TO authenticated;

-- Enforce the booking state machine for direct REST calls as well as portal actions.
CREATE OR REPLACE FUNCTION public.guard_booking_portal_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_role public.user_role;
  is_assigned_technician BOOLEAN;
  valid_transition BOOLEAN := FALSE;
BEGIN
  IF COALESCE(auth.role(), '') = 'service_role'
     OR COALESCE(current_setting('coolo.portal_workflow', TRUE), '') = 'on' THEN
    RETURN NEW;
  END IF;

  actor_role := public.current_user_role();
  IF (to_jsonb(NEW) - ARRAY['status', 'updated_at']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status', 'updated_at']) THEN
    RAISE EXCEPTION 'Portal users may only update a booking through its role workflow';
  END IF;
  IF NEW.status = OLD.status THEN RETURN NEW; END IF;

  IF actor_role = 'CUSTOMER' THEN
    IF OLD.status IN ('REQUESTED', 'CONFIRMED') AND NEW.status = 'CANCELLED' THEN
      RETURN NEW;
    END IF;
    IF OLD.status = 'WAITING_FOR_APPROVAL' AND NEW.status = 'IN_PROGRESS'
       AND EXISTS (
         SELECT 1 FROM public.service_estimates
         WHERE booking_id = OLD.id AND status IN ('APPROVED', 'REJECTED')
       ) THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Customers may only cancel eligible bookings or decide an estimate';
  ELSIF actor_role = 'TECHNICIAN' THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.technician_assignments AS ta
      JOIN public.technicians AS t ON t.id = ta.technician_id
      WHERE ta.booking_id = OLD.id AND t.user_id = auth.uid() AND t.is_active = TRUE
        AND ta.status = 'ACCEPTED'
    ) INTO is_assigned_technician;
    IF NOT is_assigned_technician THEN RAISE EXCEPTION 'Active assignment required'; END IF;

    valid_transition :=
      (OLD.status = 'ASSIGNED' AND NEW.status = 'TECHNICIAN_ON_THE_WAY') OR
      (OLD.status = 'TECHNICIAN_ON_THE_WAY' AND NEW.status = 'IN_PROGRESS') OR
      (OLD.status = 'IN_PROGRESS' AND NEW.status = 'WAITING_FOR_APPROVAL'
        AND EXISTS (SELECT 1 FROM public.service_estimates WHERE booking_id = OLD.id AND status = 'PENDING_APPROVAL')) OR
      (OLD.status = 'IN_PROGRESS' AND NEW.status = 'COMPLETED'
        AND EXISTS (SELECT 1 FROM public.service_records WHERE booking_id = OLD.id));
    IF NOT valid_transition THEN RAISE EXCEPTION 'Invalid technician booking status transition'; END IF;
  ELSIF actor_role IN ('ADMIN', 'SUPER_ADMIN') THEN
    valid_transition :=
      (OLD.status = 'REQUESTED' AND NEW.status IN ('CONFIRMED', 'ASSIGNED', 'CANCELLED', 'NO_SHOW')) OR
      (OLD.status = 'CONFIRMED' AND NEW.status IN ('ASSIGNED', 'CANCELLED', 'NO_SHOW')) OR
      (OLD.status = 'ASSIGNED' AND NEW.status IN ('CONFIRMED', 'CANCELLED', 'NO_SHOW')) OR
      (OLD.status = 'TECHNICIAN_ON_THE_WAY' AND NEW.status IN ('CANCELLED', 'NO_SHOW')) OR
      (OLD.status = 'IN_PROGRESS' AND NEW.status IN ('CANCELLED', 'NO_SHOW')) OR
      (OLD.status = 'WAITING_FOR_APPROVAL' AND NEW.status IN ('CANCELLED', 'NO_SHOW'));
    IF NOT valid_transition THEN RAISE EXCEPTION 'Invalid administrator booking status transition'; END IF;
  ELSE
    RAISE EXCEPTION 'Not authorized to update this booking';
  END IF;

  RETURN NEW;
END;
$$;

-- History records include the authenticated actor, and each transition notifies
-- the linked customer and currently assigned technician in-app.
CREATE OR REPLACE FUNCTION public.record_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_user_id UUID;
  technician_user_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.booking_status_history (booking_id, from_status, to_status, changed_by, notes)
    VALUES (NEW.id, NULL, NEW.status, auth.uid(), 'Initial booking created');
    RETURN NEW;
  END IF;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_status_history (booking_id, from_status, to_status, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), 'Status updated');

    SELECT c.user_id INTO customer_user_id
    FROM public.customers AS c WHERE c.id = NEW.customer_id;
    IF customer_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (customer_user_id, 'BOOKING_STATUS', 'Booking status updated',
        'Booking ' || NEW.booking_number || ' is now ' || REPLACE(LOWER(NEW.status::TEXT), '_', ' ') || '.', '/portal');
    END IF;

    SELECT t.user_id INTO technician_user_id
    FROM public.technician_assignments AS ta
    JOIN public.technicians AS t ON t.id = ta.technician_id
    WHERE ta.booking_id = NEW.id AND ta.status IN ('ASSIGNED', 'ACCEPTED') AND t.is_active = TRUE
    ORDER BY ta.assigned_at DESC LIMIT 1;
    IF technician_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (technician_user_id, 'BOOKING_STATUS', 'Assigned job updated',
        'Booking ' || NEW.booking_number || ' is now ' || REPLACE(LOWER(NEW.status::TEXT), '_', ' ') || '.', '/portal');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
