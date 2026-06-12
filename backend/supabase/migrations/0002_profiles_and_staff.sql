-- 0002_profiles_and_staff.sql
-- Profiles (extends auth.users), admin profiles, and staff stub.
-- Includes handle_new_user() trigger that creates a profiles row on signup.

-- ---------- profiles ----------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id),
  role user_role not null,
  display_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index profiles_clinic_idx on public.profiles (clinic_id);
create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- admin_profiles ----------

create table public.admin_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  employee_id text unique not null,
  position text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger admin_profiles_set_updated_at
  before update on public.admin_profiles
  for each row execute function public.set_updated_at();

-- ---------- staff ----------

create table public.staff (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  license_no text,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger staff_set_updated_at
  before update on public.staff
  for each row execute function public.set_updated_at();

-- ---------- handle_new_user() ----------
-- Creates a public.profiles row whenever a Supabase auth user signs up.
-- Expects raw_user_meta_data to contain { role, display_name, clinic_code? }.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
  meta_name text;
  meta_clinic text;
  resolved_clinic uuid;
begin
  meta_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  meta_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
  meta_clinic := coalesce(new.raw_user_meta_data->>'clinic_code', 'CLEARMIND');

  select id into resolved_clinic from public.clinics where code = meta_clinic limit 1;

  if resolved_clinic is null then
    raise exception 'Unknown clinic_code %', meta_clinic;
  end if;

  insert into public.profiles (id, clinic_id, role, display_name, email)
  values (new.id, resolved_clinic, meta_role::user_role, meta_name, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
