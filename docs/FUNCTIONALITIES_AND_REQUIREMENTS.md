# COOLO Functionalities and Requirements

## Document status

This is derived from the current source and SQL migrations. “Implemented” means code/database workflows exist; it does not imply the latest web build is deployed everywhere or that Supabase/Google/SMTP settings are complete.

## Roles

| Role | Provisioning | Main access |
|---|---|---|
| Visitor | None | Browse services/areas, submit a guest booking, contact support |
| Customer | Email sign-up or Google OAuth; defaults to `CUSTOMER` | Own linked bookings, eligible cancellation, estimate decisions, service/payment records, review and own notifications |
| Technician | Invited/promoted by super-admin | Active assigned jobs, assignment response, job progression, estimates and service reports |
| Admin | Invited/promoted by super-admin | Booking operations, assignments, customer enquiries, cash collection reconciliation |
| Super-admin | Trusted bootstrap or super-admin invitation | Admin access plus staff invitations and role management |

Public sign-up cannot select a staff role.

## Functional requirements

### Public website and intake

| ID | Requirement | Current behavior / acceptance condition |
|---|---|---|
| FR-01 | Browse service and company information | Public home, service catalog/details, service areas, about, contact, legal and SEO pages are available. |
| FR-02 | Quick-book a service | Widget submits service, area, date/time, name and mobile. Server validates and returns a booking number only after a successful database write. |
| FR-03 | Detailed booking | Wizard collects service, AC type/brand/age, issue, contact, address/PIN/landmark and schedule; API stores the submitted fields. |
| FR-04 | Validate intake | Server restricts services, areas and slots; validates future/valid dates and contact data; bounds free text. Failed persistence is returned as failure, not success. |
| FR-05 | Contact support | Validated contact request is saved with `NEW` status. Success is shown only after persistence. |

### Authentication and authorization

| ID | Requirement | Current behavior / acceptance condition |
|---|---|---|
| FR-06 | Email/password auth | `/portal/login` supports sign-in and customer registration. Auth-user triggers provision customers. |
| FR-07 | Google OAuth | Supabase Auth performs Google sign-in; callback exchanges the code and rejects unsafe external redirects. Google provider and callback allowlists are operator configuration. |
| FR-08 | Role enforcement | Portal route and every server action require an authenticated account and allowed role. RLS/database functions independently enforce data ownership. |
| FR-09 | Staff onboarding | Super-admin can invite technician/admin/super-admin by email or change an existing role. Recipient sets their own password through Auth. Role transitions are atomic; technician profiles synchronize; self-demotion and demotion of the last super-admin are blocked. |

### Customer workflows

| ID | Requirement | Current behavior / acceptance condition |
|---|---|---|
| FR-10 | See own bookings | Only bookings linked to the signed-in customer's profile are listed. Guest requests are not automatically claimed later. |
| FR-11 | Cancel eligible booking | Only `REQUESTED` or `CONFIRMED` bookings can be cancelled online; server and database enforce this. |
| FR-12 | Decide estimate | Customer approves or declines a pending estimate; database records the decision and returns the booking to `IN_PROGRESS`. |
| FR-13 | View service information | Customer may view authorized estimates/items, service report, payment status, booking history and notifications. |
| FR-14 | Review completed service | Customer can submit one 1–5 rating and optional comment for their completed booking. |

### Technician workflows

| ID | Requirement | Current behavior / acceptance condition |
|---|---|---|
| FR-15 | View assigned jobs | Active technicians see jobs associated with their assignments, including completed jobs for reference. |
| FR-16 | Respond to assignment | Technician accepts or declines an assignment. A declined assignment is available for admin reassignment. |
| FR-17 | Progress work | Accepted technician moves `ASSIGNED → TECHNICIAN_ON_THE_WAY → IN_PROGRESS`; invalid direct transitions fail. |
| FR-18 | Submit estimate | Active accepted technician can submit an estimate while a linked-customer booking is in progress. Database computes totals, stores lines atomically and changes booking to `WAITING_FOR_APPROVAL`. Current UI submits one line per estimate. |
| FR-19 | Complete service | Technician submits diagnosis, work performed and final amount. Pending estimates block completion. Successful completion writes a service report, closes assignment, marks booking `COMPLETED`, and creates a pending cash payment. |

### Admin and super-admin workflows

| ID | Requirement | Current behavior / acceptance condition |
|---|---|---|
| FR-20 | Triage bookings | Admin list is limited to latest 100. Admin may confirm eligible requests or cancel/no-show according to the state machine; technician report completes work. |
| FR-21 | Assign technician | Admin can assign active technician to requested/confirmed/assigned booking through a transactional RPC. |
| FR-22 | Manage enquiries | Latest 50 contact requests are staff-only. Admin can set the status to `NEW`, `CONTACTED`, or `RESOLVED`. |
| FR-23 | Reconcile cash | Admin marks eligible pending cash payment as collected (`CASH`). No gateway verification exists. |
| FR-24 | Manage accounts | Super-admin sees latest 100 profiles, invites staff and changes roles. Final super-admin protection and technician lifecycle are enforced in SQL. |

### Cross-cutting

| ID | Requirement | Current behavior / acceptance condition |
|---|---|---|
| FR-25 | Audit status changes | Booking status history records initial and changed states; actor is stored when available. |
| FR-26 | In-app notifications | Booking, estimate and service events create user-scoped notifications. User may mark their own notification read. |
| FR-27 | Protect personal data | Queries and writes are restricted by server authorization and Supabase RLS; contact requests are administrator-only. |

## Non-functional requirements

- **Security:** Keep service-role key server-side; use HTTPS; preserve RLS; use distinct strong passwords. MFA is a production security goal but is not currently enabled/enforced by the app; enable Supabase MFA and privileged-role policy before treating it as satisfied.
- **Validation:** Validate all untrusted input on the server, regardless of browser validation.
- **Reliability:** A user-facing success response must follow a confirmed database write. Multi-row business operations should remain transactional.
- **Privacy:** Return only data needed by a role. Never commit credentials, access tokens, passwords, or customer data in docs/logs.
- **Accessibility/usability:** Label controls, show loading/error/status feedback, and present legal next steps.
- **Operations:** Apply migrations in order, inspect linked project and migration history, and deploy web code separately after database changes.

## Current limitations / not implemented

- Card, UPI, Razorpay and other online payment collection are not implemented. Current workflow is pending cash followed by admin confirmation.
- There is no in-app password-reset screen. Invite/recovery email depends on Supabase Auth and SMTP configuration.
- No outbound booking/contact email, SMS, WhatsApp or push delivery is implemented; notifications are in-app only.
- Guest bookings have no claim/link workflow and cannot enter online customer estimate approval.
- Booking/contact routes do not implement CAPTCHA or application-level rate limiting; configure Cloudflare/WAF protections before high-volume use.
- No portal workflow for inventory/parts, saved addresses, catalog/pricing administration, or review moderation, despite related schema foundations.
- No automated RLS/role integration test suite is currently configured. Release testing must include direct API access checks.
- Search/pagination is not implemented; portal lists are capped (100 bookings/users, 50 contact requests, 20 notifications).
- The portal requires at least 8 characters in its sign-up field, while the checked-in local Supabase config has a 6-character Auth minimum. Align each Supabase environment to an 8-character minimum or stronger before release; client-side validation is not a server-side password policy.

## Release acceptance checklist

- [ ] All migrations appear in the target project's remote migration history; no migration is pending.
- [ ] Google provider, site URL, callback allowlist, and SMTP are configured as required.
- [ ] Cloudflare Worker secrets are present; service-role key is absent from client/public config.
- [ ] Customer, technician, admin, super-admin allowed and denied actions are smoke-tested.
- [ ] Cross-customer access and inactive/unassigned technician access are denied.
- [ ] Linked-customer and guest booking paths are tested, including estimate/completion constraints.
- [ ] Cloudflare build/preview passes before production deploy.
- [ ] No temporary passwords/access tokens are committed or reused across environments.
