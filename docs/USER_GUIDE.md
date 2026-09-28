# COOLO Portal User Guide

This guide covers the current public booking experience and operations portal at `/portal`. Accounts/data belong to a specific Supabase project; a production user does not automatically exist in development or staging.

## 1. Sign in and access

1. Open `/portal/login`.
2. Sign in with email and password, or choose **Continue with Google** if Google Auth is enabled for that account.
3. Customer registration asks for full name, email and password. New sign-ups receive `CUSTOMER` access.
4. Staff accounts are invited or promoted by a super-admin. Users cannot select a staff role during public registration.
5. Use **Sign out** in the portal header to end the current session.

Email confirmation, invitations and recovery depend on Supabase Auth and SMTP configuration. The app currently has no separate password-reset screen. If locked out, contact a super-admin or follow the organization's Auth recovery process. Never put passwords in documentation or chat.

## 2. Customer tasks

### Book a service

- Use **Book a service** from your portal or the public quick-booking widget.
- The detailed wizard collects service, AC information, contact details, address/PIN/landmark and preferred schedule.
- Submit while signed in to associate the booking with your customer account. Guest bookings are saved but are not automatically attached to a later account.
- A confirmation is shown only after Supabase successfully saves the request. If saving fails, retry or contact Coolo.

### Track and manage a booking

- Your portal lists bookings linked to your account and displays status, estimates, service reports, payment status, history and notifications.
- Cancel online only while status is `REQUESTED` or `CONFIRMED`.
- For a `PENDING_APPROVAL` estimate, review the line item(s), total and notes, then choose **Approve estimate** or **Decline**. Either decision returns the job to `IN_PROGRESS`; contact support if you need to discuss a declined estimate.
- After completion, review the report/payment status and optionally submit one rating/comment.
- Select **Mark read** on a notification to acknowledge it.

## 3. Technician tasks

1. A super-admin invites your work email or grants the `TECHNICIAN` role. Complete the Auth setup before signing in.
2. Your technician profile must be active. If the portal says it is pending, ask an administrator to finish onboarding.
3. In **Assigned jobs**, choose **Accept job** or **Decline**. Declined work is available for admin reassignment.
4. For accepted work, advance in order: **Technician on the way**, then **In progress**.
5. For an account-linked booking, submit an estimate while the job is in progress. A customer decision is required before completing while an estimate is pending.
6. Submit the service report with work performed, final amount, and optional diagnosis. This records completion and creates a pending cash collection record.
7. Guest bookings have no linked customer account for online estimate approval. Coordinate the estimate with the customer outside the portal and submit the service report as appropriate.

Active technicians see assigned/accepted jobs and completed jobs for reference; declined assignments are not shown in their queue. If a job is missing, ask an administrator to check the assignment rather than changing IDs or status directly.

## 4. Admin tasks

### Booking operations

- The queue displays at most the latest 100 bookings.
- Confirm a new request or cancel/no-show an eligible job using the status control.
- Assign/reassign an active technician to a requested, confirmed, or assigned booking. The assignment and booking status are saved together.
- Job completion is recorded by the technician's service report, not a generic admin status selector.

### Contact enquiries

- Up to the latest 50 enquiries are shown; they are visible only to admins/super-admins.
- Set the status to `NEW`, `CONTACTED`, or `RESOLVED` as appropriate after follow-up.
- The application stores the enquiry but does not automatically email, text, or WhatsApp the customer.

### Cash reconciliation

- A completed service report creates a pending cash payment record.
- After cash is actually collected, choose **Confirm cash collected**. Do not use this control for online payments; no card/UPI gateway is integrated.

## 5. Super-admin tasks

### Invite staff

1. Open **User access management**.
2. Enter the staff member's name and work email.
3. Choose `TECHNICIAN`, `ADMIN`, or `SUPER_ADMIN`, then select **Invite staff**.
4. Supabase Auth sends the invitation. The recipient sets their own password. Email delivery requires SMTP and matching redirect allowlists.

### Change an existing user's role

- Choose the new role in the user list and save it.
- Promoting a user to technician creates/reactivates a technician record; changing a technician to another role deactivates that record.
- You cannot change your own role, and the final super-admin cannot be demoted. Another super-admin must handle such changes.

Customer users normally register themselves; new public sign-ups always start as customers.

## 6. Status reference

| Status | Meaning |
|---|---|
| `REQUESTED` | Booking saved; operations review is pending |
| `CONFIRMED` | Operations accepted the request |
| `ASSIGNED` | Technician assigned; technician response may be pending |
| `TECHNICIAN_ON_THE_WAY` | Accepted technician is travelling to the customer |
| `IN_PROGRESS` | Service work or estimate follow-up is underway |
| `WAITING_FOR_APPROVAL` | An estimate awaits the customer's decision |
| `COMPLETED` | Technician submitted the service report |
| `CANCELLED` | Booking was cancelled |
| `NO_SHOW` | Visit was recorded as a no-show |

## 7. Troubleshooting

- **Google sign-in fails:** verify the Google provider is enabled and both the Supabase callback URI and app callback URL are allowed.
- **No invitation/confirmation email:** verify recipient address, spam, Supabase SMTP, redirect allowlist and Auth email limits. Email is sent by Supabase, not the app.
- **Booking missing from customer portal:** it may have been submitted as a guest (`customer_id` is null) or under another account; no guest claim workflow exists.
- **Technician has no jobs:** ask an administrator to check role, active technician profile, assignment and assignment state.
- **Estimate submission fails:** booking must be in progress, technician must have accepted the assignment, and customer must have an account linked to the booking.
- **Completion fails:** resolve any pending estimate and provide a valid service report/final amount.
- **Payment question:** only cash collection reconciliation is implemented; online payment processing is unavailable.
