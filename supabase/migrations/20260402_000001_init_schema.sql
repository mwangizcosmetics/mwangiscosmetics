create extension if not exists "pgcrypto";
create extension if not exists "citext";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'currency_code') then
    create type public.currency_code as enum ('KES', 'USD');
  end if;

  if not exists (select 1 from pg_type where typname = 'coupon_type') then
    create type public.coupon_type as enum ('percentage', 'fixed');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    );
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email citext,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  loyalty_tier text not null default 'Classic',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  brand text not null default 'MWANGIZ Cosmetics',
  category_id uuid not null references public.categories(id) on delete restrict,
  tags text[] not null default '{}',
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= price),
  currency public.currency_code not null default 'KES',
  stock integer not null default 0 check (stock >= 0),
  sku text not null unique,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  is_featured boolean not null default false,
  highlights text[] not null default '{}',
  ingredients text[] not null default '{}',
  benefits text[] not null default '{}',
  how_to_use text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  user_name text not null,
  user_avatar text,
  rating numeric(2, 1) not null check (rating >= 1 and rating <= 5),
  title text not null,
  comment text not null,
  verified_purchase boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  selected_shade text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id, selected_shade)
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  line1 text not null,
  line2 text,
  city text not null,
  region text not null,
  postal_code text,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending',
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  shipping integer not null default 0 check (shipping >= 0),
  tax integer not null default 0 check (tax >= 0),
  total integer not null check (total >= 0),
  currency public.currency_code not null default 'KES',
  shipping_address jsonb not null,
  payment_method text not null,
  placed_at timestamptz not null default timezone('utc', now()),
  estimated_delivery timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  product_snapshot jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  type public.coupon_type not null,
  value numeric(10, 2) not null check (value >= 0),
  min_subtotal integer check (min_subtotal is null or min_subtotal >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_label text,
  href text,
  badge text,
  image_url text not null,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_is_featured on public.products(is_featured);
create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_cart_user_id on public.cart_items(user_id);
create index if not exists idx_wishlist_user_id on public.wishlists(user_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_coupons_updated_at on public.coupons;
create trigger trg_coupons_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

drop trigger if exists trg_banners_updated_at on public.banners;
create trigger trg_banners_updated_at
before update on public.banners
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories
for select
using (true);

drop policy if exists "categories_admin_manage" on public.categories;
create policy "categories_admin_manage"
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
on public.products
for select
using (true);

drop policy if exists "products_admin_manage" on public.products;
create policy "products_admin_manage"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
on public.product_images
for select
using (true);

drop policy if exists "product_images_admin_manage" on public.product_images;
create policy "product_images_admin_manage"
on public.product_images
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read"
on public.reviews
for select
using (true);

drop policy if exists "reviews_insert_own_user" on public.reviews;
create policy "reviews_insert_own_user"
on public.reviews
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_update_delete_admin" on public.reviews;
create policy "reviews_update_delete_admin"
on public.reviews
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "wishlists_own_access" on public.wishlists;
create policy "wishlists_own_access"
on public.wishlists
for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "cart_items_own_access" on public.cart_items;
create policy "cart_items_own_access"
on public.cart_items
for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "addresses_own_access" on public.addresses;
create policy "addresses_own_access"
on public.addresses
for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_insert_own_or_admin" on public.orders;
create policy "orders_insert_own_or_admin"
on public.orders
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_admin_manage" on public.orders;
create policy "orders_admin_manage"
on public.orders
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
on public.order_items
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders order_record
    where order_record.id = order_id
      and order_record.user_id = auth.uid()
  )
);

drop policy if exists "order_items_admin_manage" on public.order_items;
create policy "order_items_admin_manage"
on public.order_items
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "coupons_public_read" on public.coupons;
create policy "coupons_public_read"
on public.coupons
for select
using (
  active = true
  and (expires_at is null or expires_at > timezone('utc', now()))
);

drop policy if exists "coupons_admin_manage" on public.coupons;
create policy "coupons_admin_manage"
on public.coupons
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "banners_public_read" on public.banners;
create policy "banners_public_read"
on public.banners
for select
using (
  active = true
  and (starts_at is null or starts_at <= timezone('utc', now()))
  and (ends_at is null or ends_at >= timezone('utc', now()))
);

drop policy if exists "banners_admin_manage" on public.banners;
create policy "banners_admin_manage"
on public.banners
for all
using (public.is_admin())
with check (public.is_admin());
