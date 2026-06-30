-- 0015_notifications.sql
-- Per-user notifications for the client (and staff) header bell.
-- Distinct from audit_log: audit_log is the clinic-wide compliance ledger;
-- notifications are personal, actionable, and dismissible (read/unread per recipient).

create type notification_type as enum (
  'appointment', 'report', 'assessment', 'announcement', 'waiver', 'system'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null default 'system',
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create index notifications_recipient_unread_idx
  on public.notifications (recipient_id)
  where read_at is null;

-- ---------- RLS ----------

alter table public.notifications enable row level security;

create policy notifications_recipient_select on public.notifications
  for select to authenticated
  using (recipient_id = auth.uid());

create policy notifications_recipient_update on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy notifications_admin_all on public.notifications
  for all to authenticated
  using (public.is_admin() and clinic_id = public.current_clinic())
  with check (public.is_admin() and clinic_id = public.current_clinic());
