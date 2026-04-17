create or replace function public.promote_user_to_super_admin(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  target_user_id uuid;
begin
  normalized_email := lower(trim(coalesce(p_email, '')));

  if normalized_email = '' then
    return jsonb_build_object(
      'ok', false,
      'error', 'Email is required.'
    );
  end if;

  select u.id
  into target_user_id
  from auth.users u
  where lower(u.email) = normalized_email
  limit 1;

  if target_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'error', 'No auth user found for provided email.'
    );
  end if;

  insert into public.profiles (
    id,
    email,
    role,
    is_active,
    created_at,
    updated_at
  )
  values (
    target_user_id,
    normalized_email,
    'super_admin'::public.user_role,
    true,
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = 'super_admin'::public.user_role,
    is_active = true,
    updated_at = timezone('utc', now());

  return jsonb_build_object(
    'ok', true,
    'user_id', target_user_id,
    'email', normalized_email,
    'role', 'super_admin',
    'is_active', true
  );
end;
$$;

-- Usage:
-- select public.promote_user_to_super_admin('cosmeticsmwangiz@gmail.com');
--
-- Verify:
-- select p.id, u.email, p.role, p.is_active
-- from public.profiles p
-- left join auth.users u on u.id = p.id
-- where lower(u.email) = lower('cosmeticsmwangiz@gmail.com');
