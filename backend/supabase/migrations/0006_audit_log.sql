-- 0006_audit_log.sql
-- Audit log for admin Overview "Recent Activity" feed and counters.

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  summary text not null,
  severity severity_enum not null default 'info',
  created_at timestamptz not null default now()
);

create index audit_log_clinic_created_idx on public.audit_log (clinic_id, created_at desc);
create index audit_log_severity_idx on public.audit_log (severity);
