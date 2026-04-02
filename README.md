# MWANGIZ Cosmetics

Premium, mobile-first e-commerce foundation built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Framer Motion, Supabase-ready integration, and Zustand state stores.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Framer Motion
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Zustand (cart, wishlist, UI)
- React Hook Form + Zod
- Sonner toasts
- Lucide icons

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Checks

```bash
npm run lint
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Backend Connection

- Full backend setup guide: [docs/backend-setup.md](docs/backend-setup.md)
- SQL migration: `supabase/migrations/20260402_000001_init_schema.sql`
- SQL seed: `supabase/seed.sql`

## Core Routes

- Storefront: `/`, `/shop`, `/category/[slug]`, `/product/[slug]`, `/search`, `/cart`, `/wishlist`, `/checkout`, `/account`, `/orders`
- Auth: `/auth/login`, `/auth/signup`
- Admin: `/admin`, `/admin/products`, `/admin/orders`, `/admin/categories`, `/admin/customers`, `/admin/coupons`, `/admin/banners`, `/admin/reviews`
