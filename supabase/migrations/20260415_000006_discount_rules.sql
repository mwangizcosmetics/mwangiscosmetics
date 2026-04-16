create table if not exists public.discount_rules (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('global', 'category', 'product')),
  percent integer not null check (percent >= 0 and percent <= 100),
  is_active boolean not null default true,
  category_id uuid references public.categories(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint discount_rules_scope_target_check check (
    (scope = 'global' and category_id is null and product_id is null)
    or (scope = 'category' and category_id is not null and product_id is null)
    or (scope = 'product' and product_id is not null and category_id is null)
  )
);

create unique index if not exists idx_discount_rules_global_unique
  on public.discount_rules(scope)
  where scope = 'global';
create unique index if not exists idx_discount_rules_category_unique
  on public.discount_rules(category_id)
  where scope = 'category';
create unique index if not exists idx_discount_rules_product_unique
  on public.discount_rules(product_id)
  where scope = 'product';
create index if not exists idx_discount_rules_active on public.discount_rules(is_active);

drop trigger if exists trg_discount_rules_updated_at on public.discount_rules;
create trigger trg_discount_rules_updated_at
before update on public.discount_rules
for each row execute function public.set_updated_at();

create table if not exists public.discount_audit_logs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.discount_rules(id) on delete set null,
  scope text not null check (scope in ('global', 'category', 'product')),
  action text not null check (action in ('create', 'update', 'delete', 'activate', 'deactivate')),
  summary text not null,
  previous_percent integer check (previous_percent is null or (previous_percent >= 0 and previous_percent <= 100)),
  next_percent integer check (next_percent is null or (next_percent >= 0 and next_percent <= 100)),
  affected_product_ids uuid[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_discount_audit_logs_created_at
  on public.discount_audit_logs(created_at desc);
create index if not exists idx_discount_audit_logs_rule_id
  on public.discount_audit_logs(rule_id);

alter table public.discount_rules enable row level security;
alter table public.discount_audit_logs enable row level security;

drop policy if exists "discount_rules_public_read" on public.discount_rules;
create policy "discount_rules_public_read"
on public.discount_rules
for select
using (is_active = true);

drop policy if exists "discount_rules_admin_manage" on public.discount_rules;
create policy "discount_rules_admin_manage"
on public.discount_rules
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "discount_audit_logs_admin_read" on public.discount_audit_logs;
create policy "discount_audit_logs_admin_read"
on public.discount_audit_logs
for select
using (public.is_admin());

drop policy if exists "discount_audit_logs_admin_manage" on public.discount_audit_logs;
create policy "discount_audit_logs_admin_manage"
on public.discount_audit_logs
for all
using (public.is_admin())
with check (public.is_admin());
