-- Phase 1: add enum values only.
-- Do not use new enum labels in this transaction.
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'user_role'
      and e.enumlabel = 'super_admin'
  ) then
    alter type public.user_role add value 'super_admin';
  end if;

  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'user_role'
      and e.enumlabel = 'staff_admin'
  ) then
    alter type public.user_role add value 'staff_admin';
  end if;

  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'user_role'
      and e.enumlabel = 'beba'
  ) then
    alter type public.user_role add value 'beba';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'order_status'
      and e.enumlabel = 'ready_for_dispatch'
  ) then
    alter type public.order_status add value 'ready_for_dispatch';
  end if;

  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'order_status'
      and e.enumlabel = 'delivery_failed'
  ) then
    alter type public.order_status add value 'delivery_failed';
  end if;

  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'order_status'
      and e.enumlabel = 'returned'
  ) then
    alter type public.order_status add value 'returned';
  end if;
end $$;

-- Transaction boundary required by PostgreSQL before using new enum values.
commit;

-- Phase 2: safe to use new enum labels.

update public.profiles
set role = 'super_admin'::public.user_role
where role = 'admin'::public.user_role;

alter table public.profiles
  add column if not exists is_active boolean not null default true;

alter table public.orders
  add column if not exists delivery_agent_id uuid references public.profiles(id) on delete set null,
  add column if not exists ready_for_dispatch_at timestamptz,
  add column if not exists in_transit_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists delivery_failed_at timestamptz,
  add column if not exists returned_at timestamptz,
  add column if not exists dispatch_note text,
  add column if not exists delivery_note text;

create index if not exists idx_orders_delivery_agent_id on public.orders(delivery_agent_id);
create index if not exists idx_orders_ready_for_dispatch_at on public.orders(ready_for_dispatch_at);
create index if not exists idx_orders_in_transit_at on public.orders(in_transit_at);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_is_active on public.profiles(is_active);

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
      and profile.is_active = true
      and profile.role in ('super_admin', 'admin')
  );
$$;

create or replace function public.is_admin_ops()
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
      and profile.is_active = true
      and profile.role in ('super_admin', 'staff_admin', 'admin')
  );
$$;

create or replace function public.is_beba()
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
      and profile.is_active = true
      and profile.role = 'beba'
  );
$$;

drop policy if exists "products_admin_manage" on public.products;
create policy "products_admin_manage"
on public.products
for all
using (public.is_admin_ops())
with check (public.is_admin_ops());

drop policy if exists "categories_admin_manage" on public.categories;
create policy "categories_admin_manage"
on public.categories
for all
using (public.is_admin_ops())
with check (public.is_admin_ops());

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders
for select
using (auth.uid() = user_id or public.is_admin_ops());

drop policy if exists "orders_insert_own_or_admin" on public.orders;
create policy "orders_insert_own_or_admin"
on public.orders
for insert
with check (auth.uid() = user_id or public.is_admin_ops());

drop policy if exists "orders_admin_manage" on public.orders;
create policy "orders_admin_manage"
on public.orders
for all
using (public.is_admin_ops())
with check (public.is_admin_ops());

drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin"
on public.order_items
for select
using (
  public.is_admin_ops()
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
using (public.is_admin_ops())
with check (public.is_admin_ops());

drop policy if exists "refunds_admin_manage" on public.refunds;
create policy "refunds_admin_manage"
on public.refunds
for all
using (public.is_admin_ops())
with check (public.is_admin_ops());

drop policy if exists "order_events_admin_manage" on public.order_events;
create policy "order_events_admin_manage"
on public.order_events
for all
using (public.is_admin_ops())
with check (public.is_admin_ops());

create or replace function public.claim_delivery_order(
  p_order_id uuid,
  p_beba_user_id uuid,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_order public.orders%rowtype;
  beba_profile public.profiles%rowtype;
begin
  select *
  into beba_profile
  from public.profiles
  where id = p_beba_user_id
  limit 1;

  if beba_profile.id is null then
    return jsonb_build_object('ok', false, 'error', 'BEBA profile not found.');
  end if;

  if beba_profile.is_active is not true then
    return jsonb_build_object('ok', false, 'error', 'BEBA account is inactive.');
  end if;

  if beba_profile.role <> 'beba' then
    return jsonb_build_object('ok', false, 'error', 'User is not a BEBA account.');
  end if;

  update public.orders
  set
    delivery_agent_id = p_beba_user_id,
    status = 'in_transit'::public.order_status,
    in_transit_at = timezone('utc', now()),
    delivery_note = coalesce(p_note, delivery_note),
    updated_at = timezone('utc', now())
  where id = p_order_id
    and status = 'ready_for_dispatch'::public.order_status
    and delivery_agent_id is null
  returning *
  into updated_order;

  if updated_order.id is null then
    return jsonb_build_object(
      'ok', false,
      'error', 'Order is no longer available for claim.'
    );
  end if;

  insert into public.order_events (
    order_id,
    event_type,
    message,
    created_at
  )
  values (
    updated_order.id,
    'in_transit',
    'Delivery claimed by BEBA and moved to in transit.',
    timezone('utc', now())
  );

  return jsonb_build_object(
    'ok', true,
    'order_id', updated_order.id,
    'status', updated_order.status
  );
end;
$$;
