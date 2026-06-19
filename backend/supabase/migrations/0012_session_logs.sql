-- 0012_session_logs.sql
-- Psychometrician session activity logs (FO-07) with a draft → pending → approved
-- workflow. Powers the psychometrician ActivityLog page.
--
-- Re-runnable: guarded enum, IF NOT EXISTS table/indexes, drop-before-create
-- policy. RLS uses staff_can_access_patient() from 0010 (named uuid param, no
-- patient_id shadowing).

do $$ begin
  if not exists (select 1 from pg_type where typname = 'session_log_status') then
    create type session_log_status as enum ('draft', 'pending', 'approved');
  end if;
end $$;

create table if not exists public.session_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  session_number int,
  session_date date not null default current_date,
  activity_title text not null,
  target_domain text,
  objectives text,
  procedure text,
  observations text,
  status session_log_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists session_logs_patient_idx on public.session_logs (patient_id, session_date desc);
create index if not exists session_logs_status_idx on public.session_logs (status);

drop trigger if exists session_logs_set_updated_at on public.session_logs;
create trigger session_logs_set_updated_at
  before update on public.session_logs
  for each row execute function public.set_updated_at();

alter table public.session_logs enable row level security;

drop policy if exists session_logs_staff on public.session_logs;
create policy session_logs_staff on public.session_logs
  for all to authenticated
  using (public.staff_can_access_patient(session_logs.patient_id))
  with check (public.staff_can_access_patient(session_logs.patient_id));
