do $$
begin
  if not exists (select 1 from pg_type where typname = 'eta_unit') then
    create type public.eta_unit as enum ('hours', 'days');
  end if;
end $$;

do $$
declare
  status_value text;
begin
  foreach status_value in array array['confirmed', 'preparing', 'left_shop', 'in_transit', 'out_for_delivery']
  loop
    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'order_status'
        and e.enumlabel = status_value
    ) then
      execute format('alter type public.order_status add value %L', status_value);
    end if;
  end loop;
end $$;

alter table public.categories
  add column if not exists is_active boolean not null default true;

alter table public.products
  add column if not exists is_active boolean not null default true;

alter table public.coupons
  add column if not exists usage_limit integer,
  add column if not exists usage_count integer not null default 0;

alter table public.banners
  add column if not exists position integer not null default 1,
  add column if not exists is_deleted boolean not null default false;

alter table public.service_towns
  add column if not exists eta_min_value integer,
  add column if not exists eta_max_value integer,
  add column if not exists eta_unit public.eta_unit;

update public.service_towns
set
  eta_min_value = coalesce(eta_min_value, greatest(coalesce(estimated_delivery_days, 1), 1)),
  eta_max_value = coalesce(eta_max_value, greatest(coalesce(estimated_delivery_days, 1), 1) + 1),
  eta_unit = coalesce(eta_unit, 'days'::public.eta_unit)
where eta_min_value is null or eta_max_value is null or eta_unit is null;

alter table public.service_towns
  add constraint service_towns_eta_bounds check (
    eta_min_value is null
    or eta_max_value is null
    or eta_min_value <= eta_max_value
  );

alter table public.orders
  add column if not exists delivery_snapshot jsonb;

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  note text,
  status text not null check (status in ('requested', 'under_review', 'approved', 'declined', 'refunded')),
  admin_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_refunds_order_id on public.refunds(order_id);
create index if not exists idx_refunds_user_id on public.refunds(user_id);
create index if not exists idx_refunds_status on public.refunds(status);
create index if not exists idx_order_events_order_id on public.order_events(order_id);
create index if not exists idx_categories_is_active on public.categories(is_active);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_banners_position on public.banners(position);

drop trigger if exists trg_refunds_updated_at on public.refunds;
create trigger trg_refunds_updated_at
before update on public.refunds
for each row execute function public.set_updated_at();

alter table public.refunds enable row level security;
alter table public.order_events enable row level security;

drop policy if exists "refunds_select_own_or_admin" on public.refunds;
create policy "refunds_select_own_or_admin"
on public.refunds
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "refunds_insert_own_or_admin" on public.refunds;
create policy "refunds_insert_own_or_admin"
on public.refunds
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "refunds_admin_manage" on public.refunds;
create policy "refunds_admin_manage"
on public.refunds
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "order_events_select_own_or_admin" on public.order_events;
create policy "order_events_select_own_or_admin"
on public.order_events
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders order_record
    where order_record.id = order_events.order_id
      and order_record.user_id = auth.uid()
  )
);

drop policy if exists "order_events_admin_manage" on public.order_events;
create policy "order_events_admin_manage"
on public.order_events
for all
using (public.is_admin())
with check (public.is_admin());
