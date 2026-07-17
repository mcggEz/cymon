-- 0024_assessment_permissions.sql
-- Table to manage psychologists permitting psychometricians to assess students.

do $$ begin
  if not exists (select 1 from pg_type where typname = 'assessment_permission_status') then
    create type assessment_permission_status as enum ('pending', 'granted', 'none');
  end if;
end $$;

create table if not exists public.assessment_permissions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  requested_by_id uuid references public.profiles(id) on delete set null,
  granted_by_id uuid references public.profiles(id) on delete set null,
  status assessment_permission_status not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (clinic_id, patient_id)
);

alter table public.assessment_permissions enable row level security;

drop policy if exists assessment_permissions_access on public.assessment_permissions;
create policy assessment_permissions_access on public.assessment_permissions
  for all to authenticated
  using (
    public.is_admin()
    or assessment_permissions.clinic_id = public.current_clinic()
  )
  with check (
    public.is_admin()
    or assessment_permissions.clinic_id = public.current_clinic()
  );

drop trigger if exists assessment_permissions_set_updated_at on public.assessment_permissions;
create trigger assessment_permissions_set_updated_at
  before update on public.assessment_permissions
  for each row execute function public.set_updated_at();
