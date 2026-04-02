# Backend Setup (Supabase)

This project now includes:

- SQL schema + RLS migration: `supabase/migrations/20260402_000001_init_schema.sql`
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
   - `supabase/seed.sql`
3. In Auth settings:
   - set your site URL (local + production)
   - add redirect URLs for local dev and deployed domain
4. Configure environment variables in `.env.local` (and Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Create a storage bucket manually if you want media uploads (recommended name: `product-assets`).
6. Mark admin users manually:
   - set `profiles.role = 'admin'` for admin accounts
   - optionally mirror admin role in auth metadata (`app_metadata.role = 'admin'`) for middleware checks
7. Enable email auth providers you want (email/password is scaffolded now).

## Verify After Manual Setup

1. Sign up/login.
2. Visit `/shop` and `/product/sunlit-garden-eau-de-parfum`.
3. Confirm `/admin` redirects non-admin users away and allows admins.
4. Check Supabase logs for RLS policy denials and adjust only if intended.

## Environment Notes

- Keep real secrets in `.env.local` (local) and Vercel env settings (production).
- Keep `.env.example` as a safe template only (no real anon/service keys).
