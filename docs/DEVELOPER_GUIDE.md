# COOLO Developer Guide

This guide covers local development, Supabase migrations, and Cloudflare Workers deployment for this repository. Use separate Supabase projects and credentials for development, QA/staging, and production.

## 1. Prerequisites

- Node.js version supported by the installed Next.js 16 toolchain.
- `pnpm` (the repository declares pnpm as its package manager).
- Supabase CLI for local/remote migration work.
- Docker Desktop only if running the full local Supabase stack (`supabase start`).
- Cloudflare account and Wrangler authentication for preview/deployment.

## 2. Install and configure local development

1. Install project dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Set the Supabase project URL and anon key for a **development** Supabase project. Set the service-role key as a server-only local secret; do not commit it or add a `NEXT_PUBLIC_` prefix.
4. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local auth redirects.
5. Start Next.js with `pnpm dev` and open `http://localhost:3000`.

The browser/session client needs only the public URL and anon key, with RLS enabled. Public booking/contact API routes and a few privileged server operations also require the server-only service-role key. Missing/invalid configuration should be treated as an environment setup issue, not bypassed by fake success responses.

### Local Supabase option

The repository includes `supabase/config.toml` and ordered migrations. With Docker available:

1. Start the local stack with `supabase start`.
2. Read local URLs and keys from `supabase status` and configure `.env.local` for the local project.
3. Apply/reset the local database with `supabase db reset` when intentionally rebuilding local data.
4. Stop the stack with `supabase stop`.

The base migration seeds service/catalog and Bangalore-area rows. The app also contains service/area constants; keep database data and constants aligned when changing the catalog. Do not use production credentials or production data for routine local development.

If Docker is unavailable, use a dedicated non-production hosted Supabase project instead. Do not point local development or a preview Worker at production accidentally.

## 3. Supabase Auth setup

### Google OAuth

1. Create a Google OAuth web client in Google Cloud Console.
2. Configure the Supabase Auth provider with the client ID and secret.
3. Add Supabase's Auth callback URI to the Google OAuth client's authorized redirect URIs.
4. In Supabase Auth URL Configuration, set the site URL and allow the exact app callback URLs for the relevant environment. The checked-in local config uses `http://127.0.0.1:3000`; if you use `localhost`, a different scheme, or port, update the local Auth `site_url`/`additional_redirect_urls` to match the actual `/auth/callback` URL. Add the deployed site's callback separately.
5. Test customer sign-in and verify new Auth users receive a `CUSTOMER` profile.

Provider secrets belong in Supabase Auth settings, not source control. The application never receives a Google password.

The login form enforces an eight-character minimum on customer sign-up. The checked-in local Supabase config currently permits six characters. Set the Auth-side minimum to at least eight (or stronger) in each environment; server/provider policy is authoritative.

The checked-in local Supabase config has TOTP enrollment and verification disabled, and the app does not enforce MFA by role. Treat MFA for privileged production accounts as an unmet security requirement until Supabase MFA is enabled and the operational policy is enforced.

### Email invitations and recovery

Supabase Auth sends account invitations and confirmation/recovery mail. Production requires an appropriately configured SMTP provider, sender, and redirect allowlist; default send limits may be restrictive. There is no application-owned email sender or self-service password-reset screen in the current UI. Never put user passwords in `.env`, migrations, docs, or scripts committed to the repository.

## 4. Database migration workflow

Migrations are in `supabase/migrations/` and must be applied in filename order. See [Architecture — migrations](ARCHITECTURE.md#migration-order) for their purpose.

### Link a non-production project

- Authenticate with `supabase login` using the interactive prompt; do not put personal access tokens in command-line arguments or shell history.
- Link the correct development/staging project with `supabase link --project-ref <project-ref>`.
- Check the target before writing with `supabase migration list --linked`.
- Preview pending migrations using `supabase db push --dry-run`.
- Apply them with `supabase db push` only after verifying that the linked project is the intended non-production target.

### Existing databases and production

An existing project may have schema applied manually while its migration ledger is empty. Before pushing, compare the live schema with the base migrations. Baseline a migration as applied only after confirming all of its objects and security rules already exist. Blindly pushing the initial schema into an existing database can fail or duplicate/conflict with policies and triggers.

For production releases:

1. Review the migration and test it against a staging project.
2. Take/verify an appropriate database backup and confirm the target project reference.
3. Inspect `supabase migration list --linked` and `supabase db push --dry-run`.
4. Apply migrations during the approved release window.
5. Verify remote migration history and smoke-test the affected role/API paths.
6. Deploy the compatible application build.

Do not repair migration history merely to silence a pending list; establish whether the schema already exists first.

## 5. Quality checks

Run before opening a pull request or deploying:

- `pnpm lint` — ESLint.
- `pnpm exec tsc --noEmit` — TypeScript checks.
- `pnpm build` — Next.js production build.
- `git diff --check` — whitespace/conflict-marker sanity check.

There is currently no `test` script or automated Supabase RLS integration test suite. Manually verify both allowed and rejected customer/technician/admin/super-admin paths in a non-production project.

## 6. Cloudflare Workers / OpenNext

`wrangler.jsonc` configures one Worker and OpenNext output, with a fixed public Supabase/site configuration and an R2 cache bucket binding. Its `NEXT_PUBLIC_*` variables are public build-time configuration; the service-role key is not a public variable. Before using another environment, add a Wrangler environment/configuration with its own worker name, public project settings, secrets, and required R2 bucket. Confirm the bucket exists in the target Cloudflare account before building/deploying.

### First-time setup

1. Authenticate with `pnpm exec wrangler login`.
2. In Cloudflare, configure `SUPABASE_SERVICE_ROLE_KEY` as a Worker secret for the target Worker. From the terminal, use `pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name <worker-name>` and enter the value at the prompt. Do not place the secret in `wrangler.jsonc`.
3. For local Wrangler preview, use an ignored local secrets file such as `.dev.vars`; never commit it. Wrangler preview also requires the configured R2 cache bucket/binding to be available or appropriately overridden for the preview environment.
4. Ensure public site URL and Supabase public config match the target environment. Build-time `NEXT_PUBLIC_*` changes require rebuilding.

### Build, preview and deploy

1. Run `pnpm run build:cloudflare`.
2. Test the Worker build using `pnpm run preview:cloudflare`.
3. Deploy only after the preview and release checks pass with `pnpm run deploy:cloudflare`.

`pnpm run deploy:cloudflare` runs the OpenNext Cloudflare build and deploy. It changes the live website; use it only for an approved release. For dev/staging Workers, use a separate Worker name, Supabase project, public configuration, and server secret rather than reusing production values.

## 7. Auth and deployment troubleshooting

- **Supabase `Invalid API key` or URL errors:** check the active environment file and selected project; never paste key values into logs or documentation.
- **Migrations all appear pending:** inspect the remote migration ledger and schema. Do not immediately push the entire chain or baseline versions without schema verification.
- **OAuth redirects to an error:** check Google provider credentials, Supabase site URL, Supabase redirect allowlist, Google callback URI, and the deployed `/auth/callback` URL.
- **Invitations do not arrive:** check Auth SMTP, sender/domain verification, rate limits, and redirect allowlist. Do not substitute a shared production password.
- **Cloudflare request fails only in production:** verify Worker secrets and public build-time settings; secrets in `.env.local` are not automatically Worker secrets.
- **Portal returns no data:** verify Auth profile role, customer/technician profile, assignment, RLS, and that migrations match the deployed code.

## 8. Release safety

- Keep production, staging, and development identities/data separate.
- Use unique temporary passwords and rotate them after initial use; do not reuse a production account password in QA/staging.
- Revoke exposed Supabase personal access tokens and rotate affected service credentials.
- Never commit `.env.local`, `.dev.vars`, Supabase `.temp` state, database passwords, OAuth secrets, or user credentials.
- Deploy schema changes and app changes as a coordinated release; avoid leaving a new UI pointed at a database that lacks its required migration.
