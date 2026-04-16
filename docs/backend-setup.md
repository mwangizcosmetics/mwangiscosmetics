# Backend Setup (Supabase)

This project now includes:

- SQL schema + RLS migration: `supabase/migrations/20260402_000001_init_schema.sql`
- Service locations + address upgrade migration: `supabase/migrations/20260403_000002_service_locations_and_address_upgrade.sql`
- Commerce operations migration (refunds, order events, status extensions): `supabase/migrations/20260403_000003_commerce_ops.sql`
- Payments + inventory hardening migration: `supabase/migrations/20260415_000004_payments_inventory_hardening.sql`
- Payment callback hardening migration: `supabase/migrations/20260415_000005_payment_callback_hardening.sql`
- Discount rules migration: `supabase/migrations/20260415_000006_discount_rules.sql`
- Seed data: `supabase/seed.sql`
- Supabase-backed catalog services with mock fallback
- Auth route protection middleware for `/account`, `/orders`, `/checkout`, `/admin`

## What Is Already Wired In Code

- Storefront catalog pages now query Supabase when env is configured:
  - `/`
  - `/shop`
  - `/category/[slug]`
  - `/product/[slug]`
  - `/search`
- Automatic fallback to mock data if Supabase is not configured or query fails.
- Login redirect support via `?next=` query parameter.

## Manual Steps You Must Do

1. Create a Supabase project.
2. In Supabase SQL Editor, run:
   - `supabase/migrations/20260402_000001_init_schema.sql`
   - `supabase/migrations/20260403_000002_service_locations_and_address_upgrade.sql`
   - `supabase/migrations/20260403_000003_commerce_ops.sql`
   - `supabase/migrations/20260415_000004_payments_inventory_hardening.sql`
   - `supabase/migrations/20260415_000005_payment_callback_hardening.sql`
   - `supabase/migrations/20260415_000006_discount_rules.sql`
   - `supabase/seed.sql`
3. In Auth settings:
   - set your site URL (local + production)
   - add redirect URLs for local dev and deployed domain
4. Configure environment variables in `.env.local` (and Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MPESA_ENV`
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_SHORTCODE`
   - `MPESA_PASSKEY`
   - `MPESA_CALLBACK_URL` (optional, auto-derived if omitted)
   - `MPESA_CALLBACK_SECRET` (recommended for callback hardening; add same token in callback URL query)
5. Create a storage bucket manually if you want media uploads (recommended name: `product-assets`).
6. Mark admin users manually:
   - set `profiles.role = 'admin'` for admin accounts
   - optionally mirror admin role in auth metadata (`app_metadata.role = 'admin'`) for middleware checks
7. Enable email auth providers you want (email/password is scaffolded now).
8. In Daraja dashboard callback config, use:
   - `https://<your-domain>/api/payments/mpesa/callback?token=<MPESA_CALLBACK_SECRET>`

## Verify After Manual Setup

1. Sign up/login.
2. Visit `/shop` and `/product/sunlit-garden-eau-de-parfum`.
3. Confirm `/admin` redirects non-admin users away and allows admins.
4. Check Supabase logs for RLS policy denials and adjust only if intended.
5. Run one checkout using `paymentMethod = mpesa` and confirm:
   - order is created as `pending_payment`
   - payment record is created
   - after payment confirmation, order is `paid` and stock is deducted.

## Environment Notes

- Keep real secrets in `.env.local` (local) and Vercel env settings (production).
- Keep `.env.example` as a safe template only (no real anon/service keys).
