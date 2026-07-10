-- 0019_assessment_activation_requests.sql
-- Feature #11: assessment activation workflow.
-- A Mental Health Professional asks Admin to make an assessment "available";
-- Admin activates it (flips assessment_templates.is_active) and the MHP can then
-- assign it to a patient. This table is the request queue joining those two roles.
--
-- Re-runnable: enum is guarded, table/index/policy use IF NOT EXISTS or are dropped
-- before being recreated.

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

-- ---------- RLS ----------
-- Admin manages all requests in every clinic; an MHP sees and files requests only
-- within their own clinic. Helpers are SECURITY DEFINER (see 0008) so they do not recurse.
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
