## COOLO

Next.js 16 App Router site and service-operations portal backed by Supabase.

## Project documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Functionalities and requirements](docs/FUNCTIONALITIES_AND_REQUIREMENTS.md)
- [Role-based user guide](docs/USER_GUIDE.md)
- [Developer guide (local and Cloudflare)](docs/DEVELOPER_GUIDE.md)

## Local development

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and set the Supabase project URL, anon key, and server-only service-role key. Never expose or commit the service-role key.
3. Follow the [developer guide](docs/DEVELOPER_GUIDE.md#database-migration-workflow) to verify the project, preview, and apply migrations. Do not blindly replay the initial schema against an existing project.
4. Start the site with `pnpm dev`.

The public Supabase URL and anon key are sufficient for sign-in/session handling. Booking and contact creation use the server-only service-role key and return an error instead of claiming success when persistence fails.

## Email and Google sign-in

The portal at `/portal/login` supports email/password registration and Google OAuth for Google/Gmail accounts. OAuth is handled by Supabase Auth; the app never asks for a Google password.

To enable Google sign-in:

1. Create a Google OAuth web client in Google Cloud Console. Add the Supabase Auth callback (`https://<project-ref>.supabase.co/auth/v1/callback`) as an authorized redirect URI.
2. In Supabase Dashboard, enable **Authentication → Providers → Google** and enter the Google client ID and client secret.
3. Add the exact application callback URL to Supabase **Authentication → URL Configuration → Redirect URLs**. The checked-in local Supabase config uses `http://127.0.0.1:3000`; production uses `https://<your-domain>/auth/callback`. Set the site URL to the canonical origin for each environment.
4. Use **Continue with Google** at `/portal/login`. New OAuth users are provisioned as customers by the auth-user trigger.

Supabase's email provider handles confirmation and recovery messages. Configure trusted SMTP under Supabase Auth settings for production deliverability; do not use a personal Gmail password as SMTP credentials.

## Supabase and portal setup

Apply every SQL file in `supabase/migrations/` in filename order. The migrations create the initial schema, provision role profiles, secure public intake and technician access, implement role workflows, and synchronize technician profiles. See the [architecture guide](docs/ARCHITECTURE.md#migration-order) and [developer guide](docs/DEVELOPER_GUIDE.md#database-migration-workflow) for the complete sequence and safe deployment procedure.

Customer accounts self-register. Promote the first trusted operator manually in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'SUPER_ADMIN'
WHERE email = 'trusted-operator@example.com';
```

Super administrators can then grant technician/admin roles from the portal. Customers can track and cancel eligible bookings; technicians can update assigned jobs; admins can manage booking statuses, assignments, and contact enquiries.

The `/portal` workflow also supports technician assignment acceptance/decline, itemized service estimates and customer approval, technician service reports, cash-collection reconciliation, customer reviews, in-app notifications, and booking history. Super administrators can invite staff by work email; invitees set their own passwords through Supabase Auth. Role changes are atomic, and the last super administrator cannot be demoted.

For internal role testing, use separate QA email aliases for customer, technician, admin, and super-admin accounts. Customers can register themselves; a super administrator can invite staff accounts or change existing roles. Do not use shared default passwords or seed demo users into production. Use distinct temporary passwords set by each invitee and revoke QA accounts when no longer needed. Online card/UPI payment processing is not enabled; the portal only records pending cash and administrator-confirmed cash collection.

## Cloudflare deployment

`wrangler.jsonc` currently describes the production Worker and public Supabase configuration. Keep `SUPABASE_SERVICE_ROLE_KEY` out of that file and configure it as a Worker secret:

1. Run `pnpm exec wrangler login`.
2. Set the secret with `pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name coolo`.
3. Deploy with `pnpm run deploy:cloudflare`.

`NEXT_PUBLIC_*` values are embedded at build time, so rebuild and redeploy after changing them. Keep the production application URL aligned with the Supabase Auth redirect allowlist.

## Validation

Run `pnpm lint` and `pnpm exec tsc --noEmit` before deployment.
