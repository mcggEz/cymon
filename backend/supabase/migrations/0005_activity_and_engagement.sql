-- 0005_activity_and_engagement.sql
-- Daily activity logs, announcements, appointments.

-- ---------- daily_activity_logs ----------

create table public.daily_activity_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  log_date date not null,
  mood mood_enum not null,
  task_completion task_completion_enum,
  behavioral_episodes behavioral_enum,
  sleep_quality sleep_enum,
  appetite appetite_enum,
  observations text,
  submitted_by_id uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, log_date)
);

create index daily_activity_logs_patient_date_idx on public.daily_activity_logs (patient_id, log_date desc);

create trigger daily_activity_logs_set_updated_at
  before update on public.daily_activity_logs
  for each row execute function public.set_updated_at();

-- ---------- announcements ----------

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  title text not null,
  type announcement_type not null default 'info',
  body text not null,
  publish_date date not null default current_date,
  expires_on date,
  audience text[] not null default array['all']::text[],
  image_url text,
  created_by_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index announcements_clinic_publish_idx on public.announcements (clinic_id, publish_date desc);

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- ---------- appointments ----------

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id) on delete cascade,
  practitioner_id uuid references public.staff(profile_id),
  starts_at timestamptz not null,
  duration_minutes int not null default 60,
  session_type session_type_enum not null,
  location text,
  notes text,
  color_tag color_enum not null default 'purple',
  status appointment_status not null default 'scheduled',
  created_by_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_patient_starts_idx on public.appointments (patient_id, starts_at desc);
create index appointments_practitioner_starts_idx on public.appointments (practitioner_id, starts_at desc);
create index appointments_clinic_starts_idx on public.appointments (clinic_id, starts_at desc);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();
