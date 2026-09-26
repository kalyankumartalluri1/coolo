This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Cloudflare production deployment

`wrangler.jsonc` contains the production Supabase URL and public anon key. Keep
`SUPABASE_SERVICE_ROLE_KEY` out of this file; configure it as a Cloudflare
Worker secret instead:

1. Authenticate with `pnpm exec wrangler login`.
2. Rotate the Supabase service-role key if it was previously committed, then
	set the replacement with `pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name coolo`.
3. Build and deploy with `pnpm run deploy:cloudflare`.

The business phone is also set in `wrangler.jsonc`; its fallback in
`src/lib/constants/brand.ts` is kept in sync. Since `NEXT_PUBLIC_*` values are
embedded during the Next.js build, rebuild and redeploy after changing them.

## Role-based portal setup

The portal is available at `/portal/login`. Customer accounts can self-register;
technician and administrator access must be granted by a super administrator.
Before deploying the portal:

1. Apply `supabase/migrations/20260926000001_portal_roles_and_security.sql` to
	the production Supabase project (after the initial schema migration).
2. Register the first trusted operator as a customer, then promote that account
	to `SUPER_ADMIN` from the Supabase SQL Editor:

	```sql
	UPDATE public.profiles
	SET role = 'SUPER_ADMIN'
	WHERE email = 'trusted-operator@example.com';
	```

3. Deploy with `pnpm run deploy:cloudflare`. Keep the service-role key configured
	only as a Cloudflare Worker secret; the portal uses it only in server-side,
	super-admin-authorized operations.

Customers can track/cancel eligible bookings; technicians can update assigned
jobs; admins can manage booking statuses, assignments, and customer enquiries;
super admins can also manage account roles.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
