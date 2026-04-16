do $$
declare
  status_value text;
begin
  foreach status_value in array array['pending_payment', 'failed_payment', 'refund_requested']
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

alter table public.orders
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'success', 'failed', 'refunded')),
  add column if not exists payment_reference text,
  add column if not exists inventory_committed_at timestamptz;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  method text not null check (method in ('mpesa', 'card', 'cash')),
  provider text not null,
  status text not null check (status in ('initiated', 'pending', 'success', 'failed', 'cancelled', 'timed_out')),
  amount integer not null check (amount >= 0),
  currency public.currency_code not null default 'KES',
  phone text,
  checkout_request_id text,
  merchant_request_id text,
  provider_reference text,
  raw_response jsonb,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  confirmed_at timestamptz
);

create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_checkout_request_id on public.payments(checkout_request_id);
create unique index if not exists idx_payments_checkout_request_unique
  on public.payments(checkout_request_id)
  where checkout_request_id is not null;

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

drop policy if exists "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin"
on public.payments
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "payments_insert_own_or_admin" on public.payments;
create policy "payments_insert_own_or_admin"
on public.payments
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "payments_update_admin_manage" on public.payments;
create policy "payments_update_admin_manage"
on public.payments
for update
using (public.is_admin())
with check (public.is_admin());

