-- 0001_init_enums_and_lookups.sql
-- Extensions, ENUMs, and lookup tables (clinics, document_types).

create extension if not exists pgcrypto;

-- ---------- ENUMs ----------

create type user_role as enum ('client', 'psychologist', 'psychometrician', 'admin');
create type sex_enum as enum ('male', 'female');
create type patient_status as enum ('active', 'pending', 'inactive');
create type admission_status as enum ('complete', 'pending', 'in_progress');
create type doc_category as enum ('admission', 'waiver', 'assessment_report', 'progress_report');
create type compliance_status as enum ('submitted', 'pending_signature', 'overdue', 'approved');
create type mood_enum as enum ('very_bad', 'sad', 'okay', 'good', 'great');
create type task_completion_enum as enum ('yes_all', 'some', 'none');
create type behavioral_enum as enum ('none', 'mild', 'significant');
create type sleep_enum as enum ('good', 'restless', 'poor');
create type appetite_enum as enum ('good', 'average', 'refused');
create type announcement_type as enum ('urgent', 'event', 'info');
create type session_type_enum as enum (
  'mmse', 'cafat', 'gars', 'initial_assessment', 'follow_up', 'therapy', 'parent_consultation'
);
create type color_enum as enum ('purple', 'sky', 'emerald', 'amber', 'rose');
create type appointment_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type severity_enum as enum ('info', 'warn', 'alert');

-- ---------- Shared trigger: set_updated_at ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- clinics ----------

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  address text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clinics_set_updated_at
  before update on public.clinics
  for each row execute function public.set_updated_at();

insert into public.clinics (code, name, address, phone, email)
values (
  'CLEARMIND',
  'ClearMind Psychological Services',
  'Blk 1 Lot 7 Painsville Subdivision, Brgy. Banilo, Calauan City, Laguna 4025',
  '+63 992-918-4078',
  'clearmind.psychservices@gmail.com'
);

-- ---------- document_types ----------

create table public.document_types (
  code text primary key,
  title text not null,
  category doc_category not null,
  current_revision text,
  description text,
  created_at timestamptz not null default now()
);

insert into public.document_types (code, title, category, current_revision, description) values
  ('CMPS:SE-FO-01', 'Student Admission Form', 'admission', 'rev.1', 'Personal info, parents details, diagnosis, disability, enrollment program selection.'),
  ('CMPS:SE-FO-02', 'SPED Consent and Waiver', 'waiver', 'rev.1', 'Parent / caregiver consent for the Special Education Program.'),
  ('CMPS:SE-FO-03', 'Caregiver Observation Checklist', 'assessment_report', 'rev.1', 'Behavioral observation checklist completed by the primary caregiver.'),
  ('CMPS:SE-FO-04', 'Mini-Mental Status Examination', 'assessment_report', 'rev.1', 'Evaluates practical, conceptual, social, motor domains.'),
  ('CMPS:SE-FO-05', 'Child Adaptive Functioning Tool', 'assessment_report', 'rev.1', 'Math, colors, shapes, literacy, word recognition, writing, verbal interpretation.'),
  ('CMPS:SE-FO-06', 'Behavioral Assessment Report', 'assessment_report', 'rev.6', 'Synthesis of assessment data into a behavioral report.'),
  ('CMPS:SE-FO-07', 'Daily Activity Report', 'progress_report', 'rev.4', 'Session-level activity log for the psychometrician.'),
  ('CMPS:SE-FO-08', 'Progress Summary Report', 'progress_report', 'rev.1', 'Monthly progress summary for parents.'),
  ('CMPS:SE-FO-12', 'SummerScape Waiver', 'waiver', 'rev.1', 'SummerScape program waiver.'),
  ('CMPS:SE-FO-13', 'SummerScape Enrollment', 'admission', 'rev.1', 'SummerScape program enrollment form.');
