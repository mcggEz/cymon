-- 0003_patients_core.sql
-- Patient (child) domain: patients, clinical_profiles, guardians, emergency_contacts.
-- Patient ID format: CMPS-YYYY-NNN (zero-padded, per-clinic per-year sequence).

-- ---------- patient_id counter ----------

create table public.patient_id_counters (
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  year int not null,
  counter int not null default 0,
  primary key (clinic_id, year)
);

create or replace function public.next_patient_id(p_clinic uuid)
returns text
language plpgsql
as $$
declare
  v_year int := extract(year from now())::int;
  v_clinic_code text;
  v_next int;
begin
  select code into v_clinic_code from public.clinics where id = p_clinic;
  if v_clinic_code is null then
    raise exception 'Unknown clinic %', p_clinic;
  end if;

  insert into public.patient_id_counters (clinic_id, year, counter)
  values (p_clinic, v_year, 1)
  on conflict (clinic_id, year)
  do update set counter = patient_id_counters.counter + 1
  returning counter into v_next;

  -- Format: CMPS-2026-001 (using clinic prefix that matches CMPS for CLEARMIND).
  -- The literal "CMPS" prefix is the clinic's "code abbreviation" — for ClearMind it equals CMPS.
  -- If we add another clinic, update this map.
  return 'CMPS-' || v_year::text || '-' || lpad(v_next::text, 3, '0');
end;
$$;

-- ---------- patients ----------

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  patient_id text unique not null,
  clinic_id uuid not null references public.clinics(id),
  caregiver_id uuid not null references public.profiles(id) on delete restrict,
  first_name text not null,
  middle_name text,
  last_name text not null,
  nick_name text,
  date_of_birth date not null,
  sex sex_enum not null,
  blood_type text,
  photo_url text,
  nationality text,
  preferred_language text,
  school text,
  grade_level text,
  home_address text,
  contact_number text,
  status patient_status not null default 'pending',
  admission_form_status admission_status not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index patients_clinic_idx on public.patients (clinic_id);
create index patients_caregiver_idx on public.patients (caregiver_id);

create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

-- Auto-fill patient_id on insert if not provided.
create or replace function public.patients_set_patient_id()
returns trigger
language plpgsql
as $$
begin
  if new.patient_id is null or new.patient_id = '' then
    new.patient_id := public.next_patient_id(new.clinic_id);
  end if;
  return new;
end;
$$;

create trigger patients_before_insert
  before insert on public.patients
  for each row execute function public.patients_set_patient_id();

-- ---------- clinical_profiles ----------

create table public.clinical_profiles (
  patient_id uuid primary key references public.patients(id) on delete cascade,
  primary_diagnosis text,
  iep_level text,
  secondary_diagnosis text,
  treating_psychologist_id uuid references public.staff(profile_id),
  treating_psychometrician_id uuid references public.staff(profile_id),
  date_enrolled date,
  referral_source text,
  last_assessment_at timestamptz,
  next_review_at date,
  gars3_gai_score int,
  gars3_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clinical_profiles_set_updated_at
  before update on public.clinical_profiles
  for each row execute function public.set_updated_at();

-- ---------- guardians ----------

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  full_name text not null,
  relationship text,
  contact_number text,
  email text,
  occupation text,
  employer text,
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guardians_patient_idx on public.guardians (patient_id);

create trigger guardians_set_updated_at
  before update on public.guardians
  for each row execute function public.set_updated_at();

-- ---------- emergency_contacts ----------

create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  full_name text not null,
  relationship text,
  contact_number text,
  alt_contact_number text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index emergency_contacts_patient_idx on public.emergency_contacts (patient_id);

create trigger emergency_contacts_set_updated_at
  before update on public.emergency_contacts
  for each row execute function public.set_updated_at();
