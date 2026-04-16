do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'order_status'
      and e.enumlabel = 'payment_init_failed'
  ) then
    alter type public.order_status add value 'payment_init_failed';
  end if;
end $$;

alter table public.payments
  drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (
    status in (
      'initiated',
      'pending',
      'success',
      'failed',
      'cancelled',
      'timed_out',
      'init_failed'
    )
  );

alter table public.orders
  add column if not exists follow_up_status text not null default 'new'
    check (follow_up_status in ('new', 'contacted', 'archived', 'dismissed')),
  add column if not exists follow_up_notes text,
  add column if not exists contacted_at timestamptz,
  add column if not exists recovery_archived boolean not null default false,
  add column if not exists retry_count integer not null default 0 check (retry_count >= 0),
  add column if not exists last_payment_attempt_at timestamptz,
  add column if not exists payment_init_error text;

create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_recovery_archived on public.orders(recovery_archived);
create index if not exists idx_orders_retry_count on public.orders(retry_count);
