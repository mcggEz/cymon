-- 0010_assessment_reports.sql
-- Assessment reports + routing/sign-off lifecycle.
--
-- A psychometrician drafts a report (behavioral FO-06 or progress-summary FO-08),
-- routes it to a psychologist who "notes"/approves it, after which it is finalized
-- into the document vault. Powers: psychometrician DraftingReports,
-- psychologist Approvals + Progress, admin Document Vault.
--
-- Re-runnable: guarded enums, IF NOT EXISTS tables/indexes, drop-before-create
-- policies. Adds the shared helper staff_can_access_patient() used here and in
-- 0011 — it takes a named uuid param, so the patients.patient_id (text) column
-- can never shadow it (the 0009 "uuid = text" trap).

-- ---------- shared access helper ----------
-- True when the current user is an admin, or a psychologist/psychometrician whose
-- clinic owns the given patient. SECURITY DEFINER so its read of patients bypasses
-- RLS (see 0008) and does not recurse.

create or replace function public.staff_can_access_patient(p_patient uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or (
    public.current_role() in ('psychologist', 'psychometrician')
    and exists (
      select 1 from public.patients p
      where p.id = p_patient and p.clinic_id = public.current_clinic()
    )
  )
$$;

-- ---------- enums ----------

do $$ begin
  if not exists (select 1 from pg_type where typname = 'report_type') then
    create type report_type as enum ('behavioral', 'progress_summary');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type report_status as enum ('draft', 'in_progress', 'ready_for_review', 'revise_requested', 'approved', 'finalized');
  end if;
end $$;

-- ---------- assessment_reports ----------

create table if not exists public.assessment_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  report_type report_type not null,
  document_type_code text references public.document_types(code),
  title text not null,
  period text,
  status report_status not null default 'draft',
  completeness int not null default 0,
  priority text not null default 'normal',
  trend text,
  content text,
  source_submission_id uuid references public.assessment_submissions(id) on delete set null,
  prepared_by_id uuid references public.profiles(id) on delete set null,
  noted_by_id uuid references public.profiles(id) on delete set null,
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessment_reports_patient_idx on public.assessment_reports (patient_id, created_at desc);
create index if not exists assessment_reports_status_idx on public.assessment_reports (status);
create index if not exists assessment_reports_type_idx on public.assessment_reports (report_type);

drop trigger if exists assessment_reports_set_updated_at on public.assessment_reports;
create trigger assessment_reports_set_updated_at
  before update on public.assessment_reports
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
-- Reports are staff-internal (clients see results onsite only). Staff-in-clinic
-- and admins via the shared helper; the patient_id is qualified for clarity.

alter table public.assessment_reports enable row level security;

drop policy if exists assessment_reports_staff on public.assessment_reports;
create policy assessment_reports_staff on public.assessment_reports
  for all to authenticated
  using (public.staff_can_access_patient(assessment_reports.patient_id))
  with check (public.staff_can_access_patient(assessment_reports.patient_id));
