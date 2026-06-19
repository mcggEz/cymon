-- 0011_interventions_and_roster.sql
-- Psychologist domain: intervention plans, mainstreaming readiness, and the
-- roster support-level / progress classification.
--
-- Powers: psychologist Interventions, Mainstreaming, RosterOverview (and the
-- client Home "support level"/progress badge).
--
-- Re-runnable: guarded enums, IF NOT EXISTS tables/columns/indexes,
-- drop-before-create policies. Reuses staff_can_access_patient() from 0010, so
-- all RLS subqueries take a named uuid param (no patient_id shadowing).

-- ---------- enums ----------

do $$ begin
  if not exists (select 1 from pg_type where typname = 'support_level') then
    create type support_level as enum ('HSN', 'MSN', 'LSN');
  end if;
  if not exists (select 1 from pg_type where typname = 'intervention_status') then
    create type intervention_status as enum ('planned', 'in_progress', 'completed');
  end if;
  if not exists (select 1 from pg_type where typname = 'mainstreaming_status') then
    create type mainstreaming_status as enum ('not_ready', 'approaching', 'ready');
  end if;
end $$;

-- ---------- roster classification on clinical_profiles ----------
-- HSN/MSN/LSN support level and milestone completion % drive RosterOverview.

alter table public.clinical_profiles
  add column if not exists support_level support_level;
alter table public.clinical_profiles
  add column if not exists milestone_progress int not null default 0;

-- ---------- interventions ----------
-- Master's-level intervention plans with a procedure-documentation count.

create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  plan_date date not null default current_date,
  procedure_count int not null default 0,
  status intervention_status not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interventions_patient_idx on public.interventions (patient_id, plan_date desc);

drop trigger if exists interventions_set_updated_at on public.interventions;
create trigger interventions_set_updated_at
  before update on public.interventions
  for each row execute function public.set_updated_at();

-- ---------- mainstreaming_assessments ----------
-- Transition-readiness scoring for moving a child toward mainstream schooling.

create table if not exists public.mainstreaming_assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  evaluated_by_id uuid references public.profiles(id) on delete set null,
  readiness_score int,
  status mainstreaming_status not null default 'not_ready',
  evaluated_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mainstreaming_patient_idx on public.mainstreaming_assessments (patient_id, evaluated_on desc);

drop trigger if exists mainstreaming_set_updated_at on public.mainstreaming_assessments;
create trigger mainstreaming_set_updated_at
  before update on public.mainstreaming_assessments
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
-- Staff-in-clinic and admins via the shared helper from 0010.

alter table public.interventions enable row level security;
alter table public.mainstreaming_assessments enable row level security;

drop policy if exists interventions_staff on public.interventions;
create policy interventions_staff on public.interventions
  for all to authenticated
  using (public.staff_can_access_patient(interventions.patient_id))
  with check (public.staff_can_access_patient(interventions.patient_id));

drop policy if exists mainstreaming_staff on public.mainstreaming_assessments;
create policy mainstreaming_staff on public.mainstreaming_assessments
  for all to authenticated
  using (public.staff_can_access_patient(mainstreaming_assessments.patient_id))
  with check (public.staff_can_access_patient(mainstreaming_assessments.patient_id));
