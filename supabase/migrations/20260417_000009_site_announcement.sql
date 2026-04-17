create table if not exists public.site_announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null default '',
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_site_announcements_is_active
  on public.site_announcements(is_active);

drop trigger if exists trg_site_announcements_updated_at on public.site_announcements;
create trigger trg_site_announcements_updated_at
before update on public.site_announcements
for each row execute function public.set_updated_at();

alter table public.site_announcements enable row level security;

drop policy if exists "site_announcements_public_read_active" on public.site_announcements;
create policy "site_announcements_public_read_active"
on public.site_announcements
for select
using (is_active = true or public.is_admin_ops());

drop policy if exists "site_announcements_admin_manage" on public.site_announcements;
create policy "site_announcements_admin_manage"
on public.site_announcements
for all
using (public.is_admin_ops())
with check (public.is_admin_ops());
