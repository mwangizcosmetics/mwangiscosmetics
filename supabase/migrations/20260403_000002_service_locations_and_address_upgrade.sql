create table if not exists public.service_counties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.service_towns (
  id uuid primary key default gen_random_uuid(),
  county_id uuid not null references public.service_counties(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  estimated_delivery_days integer check (
    estimated_delivery_days is null or estimated_delivery_days > 0
  ),
  delivery_fee integer check (delivery_fee is null or delivery_fee >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (county_id, name)
);

create index if not exists idx_service_counties_is_active on public.service_counties(is_active);
create index if not exists idx_service_towns_county_id on public.service_towns(county_id);
create index if not exists idx_service_towns_is_active on public.service_towns(is_active);

alter table public.addresses
  add column if not exists label text,
  add column if not exists county_id uuid references public.service_counties(id) on delete set null,
  add column if not exists county_name text not null default '',
  add column if not exists town_center_id uuid references public.service_towns(id) on delete set null,
  add column if not exists town_center_name text not null default '',
  add column if not exists street_address text not null default '',
  add column if not exists building_or_house text,
  add column if not exists landmark text,
  add column if not exists is_primary boolean not null default false;

update public.addresses
set
  county_name = coalesce(nullif(county_name, ''), coalesce(region, ''), ''),
  town_center_name = coalesce(nullif(town_center_name, ''), coalesce(city, ''), ''),
  street_address = coalesce(nullif(street_address, ''), coalesce(line1, ''), ''),
  building_or_house = coalesce(building_or_house, line2),
  is_primary = coalesce(is_primary, false) or coalesce(is_default, false);

with ranked as (
  select
    id,
    row_number() over (
      partition by user_id
      order by
        case when is_primary then 0 else 1 end,
        created_at asc
    ) as rank_in_user
  from public.addresses
)
update public.addresses address_row
set is_primary = ranked.rank_in_user = 1
from ranked
where ranked.id = address_row.id;

create unique index if not exists idx_addresses_primary_per_user
  on public.addresses(user_id)
  where is_primary = true;

create or replace function public.enforce_address_limit()
returns trigger
language plpgsql
as $$
declare
  address_count integer;
begin
  if tg_op = 'INSERT' then
    select count(*) into address_count
    from public.addresses
    where user_id = new.user_id;

    if address_count >= 2 then
      raise exception 'Address limit reached. Maximum of 2 saved addresses per user.';
    end if;
  elsif tg_op = 'UPDATE' and new.user_id <> old.user_id then
    select count(*) into address_count
    from public.addresses
    where user_id = new.user_id;

    if address_count >= 2 then
      raise exception 'Address limit reached. Maximum of 2 saved addresses per user.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_addresses_limit on public.addresses;
create trigger trg_addresses_limit
before insert or update on public.addresses
for each row execute function public.enforce_address_limit();

drop trigger if exists trg_service_counties_updated_at on public.service_counties;
create trigger trg_service_counties_updated_at
before update on public.service_counties
for each row execute function public.set_updated_at();

drop trigger if exists trg_service_towns_updated_at on public.service_towns;
create trigger trg_service_towns_updated_at
before update on public.service_towns
for each row execute function public.set_updated_at();

alter table public.service_counties enable row level security;
alter table public.service_towns enable row level security;

drop policy if exists "service_counties_public_read" on public.service_counties;
create policy "service_counties_public_read"
on public.service_counties
for select
using (is_active = true or public.is_admin());

drop policy if exists "service_counties_admin_manage" on public.service_counties;
create policy "service_counties_admin_manage"
on public.service_counties
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "service_towns_public_read" on public.service_towns;
create policy "service_towns_public_read"
on public.service_towns
for select
using (
  (
    is_active = true
    and exists (
      select 1
      from public.service_counties county
      where county.id = service_towns.county_id
        and county.is_active = true
    )
  )
  or public.is_admin()
);

drop policy if exists "service_towns_admin_manage" on public.service_towns;
create policy "service_towns_admin_manage"
on public.service_towns
for all
using (public.is_admin())
with check (public.is_admin());

insert into public.service_counties (id, name, is_active)
values
  ('4d8c6376-3069-4f17-b6cd-a3a02d95f6b1', 'Uasin Gishu', true),
  ('631ff36f-7608-430e-91ca-a8b5462ab502', 'Nairobi', true),
  ('2d6385a8-f6a8-4026-9cad-4355f188ecde', 'Nakuru', true),
  ('27c5f83a-c0ed-4cc7-8a2d-f3fbdb6b6f83', 'Kisumu', true),
  ('3adf0efc-c132-405e-af5c-6ccb37ad6f68', 'Kakamega', true),
  ('95479e93-2e98-4f95-8382-1f6d205ed0e3', 'Nandi', true)
on conflict (id) do update
set name = excluded.name,
    is_active = excluded.is_active,
    updated_at = timezone('utc', now());

insert into public.service_towns (
  id,
  county_id,
  name,
  is_active,
  estimated_delivery_days,
  delivery_fee
)
values
  (
    '5bd4ea64-dd30-47e3-b19d-8acb6abf8fdb',
    '4d8c6376-3069-4f17-b6cd-a3a02d95f6b1',
    'Eldoret',
    true,
    1,
    150
  ),
  (
    '0158cba4-3f3e-41e2-92fa-b00f2c344db2',
    '4d8c6376-3069-4f17-b6cd-a3a02d95f6b1',
    'Burnt Forest',
    true,
    2,
    250
  ),
  (
    'eeaaf494-b4d5-4fca-95cc-fcf6a4ecb675',
    '631ff36f-7608-430e-91ca-a8b5462ab502',
    'Nairobi CBD',
    true,
    2,
    350
  ),
  (
    'be1e42ca-770c-43fa-9904-7a07f3764757',
    '631ff36f-7608-430e-91ca-a8b5462ab502',
    'Westlands',
    true,
    2,
    350
  ),
  (
    'a55e15e5-ab6f-4978-aaf9-bc68ca340f0f',
    '2d6385a8-f6a8-4026-9cad-4355f188ecde',
    'Nakuru Town',
    true,
    2,
    300
  ),
  (
    'a02233a0-b27b-4756-80ad-2ca8d66e66ed',
    '27c5f83a-c0ed-4cc7-8a2d-f3fbdb6b6f83',
    'Kisumu CBD',
    true,
    3,
    350
  ),
  (
    'a2df3787-7b74-4637-a0a0-a4f0c1f30716',
    '3adf0efc-c132-405e-af5c-6ccb37ad6f68',
    'Kakamega Town',
    true,
    2,
    280
  ),
  (
    '89da9346-bfb7-4a6b-a21d-07db4fdc69f5',
    '95479e93-2e98-4f95-8382-1f6d205ed0e3',
    'Kapsabet',
    true,
    2,
    280
  )
on conflict (id) do update
set county_id = excluded.county_id,
    name = excluded.name,
    is_active = excluded.is_active,
    estimated_delivery_days = excluded.estimated_delivery_days,
    delivery_fee = excluded.delivery_fee,
    updated_at = timezone('utc', now());
