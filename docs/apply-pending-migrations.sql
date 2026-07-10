-- ============================================================================
-- ClearMind / CyMon — pending migrations (0017 → 0020)
-- ----------------------------------------------------------------------------
-- Paste this whole file into the Supabase SQL editor and run it once.
-- Safe to re-run: every statement is guarded (IF NOT EXISTS / DROP ... IF EXISTS).
-- Assumes 0001–0016 are already applied (they define clinics, profiles,
-- assessment_templates, the RLS helpers is_admin()/current_role()/current_clinic(),
-- the set_updated_at() trigger fn, and the user_role enum).
--
-- Covers: #13 multi-role employees, #16 announcement priority,
--         #11 assessment activation workflow, patient research survey.
-- ============================================================================


-- ─── 0017: employee multi-roles (#13) ──────────────────────────────────────
alter table public.profiles
  add column if not exists extra_roles user_role[] not null default '{}';


-- ─── 0018: announcement priority (#16) ─────────────────────────────────────
alter table public.announcements
  add column if not exists priority text not null default 'normal'
    check (priority in ('normal', 'important', 'urgent'));


-- ─── 0019: assessment activation requests (#11) ────────────────────────────
do $$ begin
  if not exists (select 1 from pg_type where typname = 'activation_request_status') then
    create type activation_request_status as enum ('pending', 'approved', 'declined');
  end if;
end $$;

create table if not exists public.assessment_activation_requests (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  template_id uuid not null references public.assessment_templates(id) on delete cascade,
  requested_by_id uuid references public.profiles(id) on delete set null,
  note text,
  status activation_request_status not null default 'pending',
  resolved_by_id uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activation_requests_clinic_idx
  on public.assessment_activation_requests (clinic_id, status);

drop trigger if exists activation_requests_set_updated_at on public.assessment_activation_requests;
create trigger activation_requests_set_updated_at
  before update on public.assessment_activation_requests
  for each row execute function public.set_updated_at();

alter table public.assessment_activation_requests enable row level security;

drop policy if exists activation_requests_access on public.assessment_activation_requests;
create policy activation_requests_access on public.assessment_activation_requests
  for all to authenticated
  using (
    public.is_admin()
    or (
      public.current_role() in ('psychologist', 'psychometrician', 'speech_therapist')
      and assessment_activation_requests.clinic_id = public.current_clinic()
    )
  )
  with check (
    public.is_admin()
    or (
      public.current_role() in ('psychologist', 'psychometrician', 'speech_therapist')
      and assessment_activation_requests.clinic_id = public.current_clinic()
    )
  );


-- ─── 0020: patient research/usability survey ───────────────────────────────
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  respondent_profile_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists survey_responses_respondent_uniq
  on public.survey_responses (respondent_profile_id);
create index if not exists survey_responses_clinic_idx
  on public.survey_responses (clinic_id, created_at desc);

alter table public.survey_responses enable row level security;

drop policy if exists survey_responses_access on public.survey_responses;
create policy survey_responses_access on public.survey_responses
  for all to authenticated
  using (respondent_profile_id = auth.uid() or public.is_admin())
  with check (respondent_profile_id = auth.uid() or public.is_admin());

-- ============================================================================
-- Done. If any statement errored on a missing helper/table, an earlier
-- migration (0001–0016) has not been applied — run those first.
-- ============================================================================
