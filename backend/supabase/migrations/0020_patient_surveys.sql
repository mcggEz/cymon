-- 0020_patient_surveys.sql
-- Research / usability survey filled by caregivers after using the app.
-- One response per respondent (unique index). Answers are JSONB keyed by the
-- question `key` defined server-side in backend/lib/survey.js.
--
-- Re-runnable: table/index use IF NOT EXISTS, policy is dropped before recreate.

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

-- ---------- RLS ----------
-- A respondent reads/writes only their own row; admins read every row in their clinic.
alter table public.survey_responses enable row level security;

drop policy if exists survey_responses_access on public.survey_responses;
create policy survey_responses_access on public.survey_responses
  for all to authenticated
  using (respondent_profile_id = auth.uid() or public.is_admin())
  with check (respondent_profile_id = auth.uid() or public.is_admin());
