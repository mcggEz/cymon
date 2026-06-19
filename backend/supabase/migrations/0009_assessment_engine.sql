-- 0009_assessment_engine.sql
-- Assessment engine: templates, per-patient assignments, and filled submissions.
--
-- Design (JSONB hybrid): each form's structure (domains + Yes/No items) lives as
-- JSONB on a template row; a caregiver/psychometrician's answers live as JSONB on
-- a submission row. Scores are stored as real numeric columns so the Home stats
-- and admin ScoringAnalytics page can query/aggregate them without parsing JSON.
--
-- Powers: client Assessment Center/Detail, psychometrician Tasks/DataReview,
-- admin ScoringAnalytics, and feeds the report drafting in 0010.
--
-- Re-runnable: enums are guarded, tables/indexes use IF NOT EXISTS, and policies
-- are dropped before being recreated.

-- ---------- enums ----------

do $$ begin
  if not exists (select 1 from pg_type where typname = 'assessment_respondent') then
    create type assessment_respondent as enum ('caregiver', 'psychometrician', 'psychologist');
  end if;
  if not exists (select 1 from pg_type where typname = 'assignment_status') then
    create type assignment_status as enum ('assigned', 'in_progress', 'submitted', 'processed', 'scored', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type submission_status as enum ('draft', 'submitted', 'processed', 'scored', 'flagged');
  end if;
end $$;

-- ---------- assessment_templates ----------
-- One row per assessable form (links to the document_types catalog code).
-- structure: [{ "key": "practical", "title": "PRACTICAL DOMAIN",
--               "items": [{ "key": "appearance", "label": "Appearance", "type": "yes_no" }] }]

create table if not exists public.assessment_templates (
  id uuid primary key default gen_random_uuid(),
  document_type_code text not null references public.document_types(code),
  title text not null,
  respondent assessment_respondent not null default 'caregiver',
  structure jsonb not null default '[]'::jsonb,
  max_score int,
  est_minutes int,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessment_templates_code_idx on public.assessment_templates (document_type_code);

drop trigger if exists assessment_templates_set_updated_at on public.assessment_templates;
create trigger assessment_templates_set_updated_at
  before update on public.assessment_templates
  for each row execute function public.set_updated_at();

-- ---------- assessment_assignments ----------
-- An instance of a template assigned to a patient (the "2 new assessments" feed).

create table if not exists public.assessment_assignments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  template_id uuid not null references public.assessment_templates(id),
  assigned_by_id uuid references public.profiles(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  status assignment_status not null default 'assigned',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessment_assignments_patient_idx on public.assessment_assignments (patient_id, status);
create index if not exists assessment_assignments_template_idx on public.assessment_assignments (template_id);

drop trigger if exists assessment_assignments_set_updated_at on public.assessment_assignments;
create trigger assessment_assignments_set_updated_at
  before update on public.assessment_assignments
  for each row execute function public.set_updated_at();

-- ---------- assessment_submissions ----------
-- The filled response. answers: { "<itemKey>": { "response": "yes"|"no", "remarks": "" } }
-- domain_scores: { "<domainKey>": { "score": 4, "max": 5 } }

create table if not exists public.assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assessment_assignments(id) on delete set null,
  patient_id uuid not null references public.patients(id) on delete cascade,
  template_id uuid not null references public.assessment_templates(id),
  respondent_profile_id uuid references public.profiles(id) on delete set null,
  respondent_name text,
  respondent_relationship text,
  answers jsonb not null default '{}'::jsonb,
  domain_scores jsonb not null default '{}'::jsonb,
  total_score int,
  max_score int,
  status submission_status not null default 'draft',
  flagged boolean not null default false,
  processed_by_id uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessment_submissions_patient_idx on public.assessment_submissions (patient_id, created_at desc);
create index if not exists assessment_submissions_template_idx on public.assessment_submissions (template_id);
create index if not exists assessment_submissions_status_idx on public.assessment_submissions (status);

drop trigger if exists assessment_submissions_set_updated_at on public.assessment_submissions;
create trigger assessment_submissions_set_updated_at
  before update on public.assessment_submissions
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
-- Mirrors 0007: templates are read-only catalog; assignments/submissions follow
-- caregiver-owns-patient, staff-in-clinic, admin-all. Helpers are SECURITY DEFINER
-- (see 0008), so referencing patients here does not recurse.
--
-- NOTE: the EXISTS subquery qualifies the outer column as
-- assessment_*.patient_id. The patients table also has a `patient_id` (text)
-- column, so an unqualified reference would bind to that and fail with
-- "operator does not exist: uuid = text".

alter table public.assessment_templates enable row level security;
alter table public.assessment_assignments enable row level security;
alter table public.assessment_submissions enable row level security;

drop policy if exists assessment_templates_select on public.assessment_templates;
create policy assessment_templates_select on public.assessment_templates
  for select to authenticated using (true);

drop policy if exists assessment_templates_admin_write on public.assessment_templates;
create policy assessment_templates_admin_write on public.assessment_templates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists assessment_assignments_access on public.assessment_assignments;
create policy assessment_assignments_access on public.assessment_assignments
  for all to authenticated
  using (
    public.owns_patient(assessment_assignments.patient_id)
    or public.is_admin()
    or (
      public.current_role() in ('psychologist', 'psychometrician')
      and exists (
        select 1 from public.patients p
        where p.id = assessment_assignments.patient_id and p.clinic_id = public.current_clinic()
      )
    )
  )
  with check (
    public.owns_patient(assessment_assignments.patient_id)
    or public.is_admin()
    or (
      public.current_role() in ('psychologist', 'psychometrician')
      and exists (
        select 1 from public.patients p
        where p.id = assessment_assignments.patient_id and p.clinic_id = public.current_clinic()
      )
    )
  );

drop policy if exists assessment_submissions_access on public.assessment_submissions;
create policy assessment_submissions_access on public.assessment_submissions
  for all to authenticated
  using (
    public.owns_patient(assessment_submissions.patient_id)
    or public.is_admin()
    or (
      public.current_role() in ('psychologist', 'psychometrician')
      and exists (
        select 1 from public.patients p
        where p.id = assessment_submissions.patient_id and p.clinic_id = public.current_clinic()
      )
    )
  )
  with check (
    public.owns_patient(assessment_submissions.patient_id)
    or public.is_admin()
    or (
      public.current_role() in ('psychologist', 'psychometrician')
      and exists (
        select 1 from public.patients p
        where p.id = assessment_submissions.patient_id and p.clinic_id = public.current_clinic()
      )
    )
  );
