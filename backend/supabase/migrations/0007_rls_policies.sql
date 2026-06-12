-- 0007_rls_policies.sql
-- Enable RLS + policies on all public tables.
-- Conventions:
--   - Caregivers (role=client) see only rows tied to patients they own.
--   - Admins see everything in their clinic.
--   - Staff see patients they're assigned to (psychologist/psychometrician on clinical_profiles).
--   - document_types, clinics: read-only to all authenticated users.

-- ---------- helpers ----------

create or replace function public.current_role()
returns user_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_clinic()
returns uuid
language sql
stable
as $$
  select clinic_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'admin'
$$;

create or replace function public.owns_patient(p_patient uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.patients p
    where p.id = p_patient and p.caregiver_id = auth.uid()
  )
$$;

-- ---------- enable RLS ----------

alter table public.clinics enable row level security;
alter table public.document_types enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.staff enable row level security;
alter table public.patient_id_counters enable row level security;
alter table public.patients enable row level security;
alter table public.clinical_profiles enable row level security;
alter table public.guardians enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.waiver_submissions enable row level security;
alter table public.documents enable row level security;
alter table public.daily_activity_logs enable row level security;
alter table public.announcements enable row level security;
alter table public.appointments enable row level security;
alter table public.audit_log enable row level security;

-- ---------- clinics: read-only to authenticated ----------

create policy clinics_select on public.clinics
  for select to authenticated using (true);

-- ---------- document_types: read-only to authenticated ----------

create policy document_types_select on public.document_types
  for select to authenticated using (true);

-- ---------- profiles ----------

create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_admin() and clinic_id = public.current_clinic())
  with check (public.is_admin() and clinic_id = public.current_clinic());

-- ---------- admin_profiles ----------

create policy admin_profiles_select_self on public.admin_profiles
  for select to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy admin_profiles_admin_all on public.admin_profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- staff ----------

create policy staff_select_all on public.staff
  for select to authenticated using (true);

create policy staff_admin_write on public.staff
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- patient_id_counters (system-only) ----------
-- No policies created -> only service role / SECURITY DEFINER functions can touch it.

-- ---------- patients ----------

create policy patients_caregiver_select on public.patients
  for select to authenticated
  using (caregiver_id = auth.uid());

create policy patients_caregiver_insert on public.patients
  for insert to authenticated
  with check (caregiver_id = auth.uid());

create policy patients_caregiver_update on public.patients
  for update to authenticated
  using (caregiver_id = auth.uid())
  with check (caregiver_id = auth.uid());

create policy patients_admin_all on public.patients
  for all to authenticated
  using (public.is_admin() and clinic_id = public.current_clinic())
  with check (public.is_admin() and clinic_id = public.current_clinic());

-- ---------- clinical_profiles ----------

create policy clinical_profiles_caregiver_select on public.clinical_profiles
  for select to authenticated
  using (public.owns_patient(patient_id));

create policy clinical_profiles_caregiver_insert on public.clinical_profiles
  for insert to authenticated
  with check (public.owns_patient(patient_id));

create policy clinical_profiles_admin_all on public.clinical_profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy clinical_profiles_staff_update on public.clinical_profiles
  for update to authenticated
  using (
    public.current_role() in ('psychologist', 'psychometrician')
    and (
      treating_psychologist_id = auth.uid()
      or treating_psychometrician_id = auth.uid()
    )
  )
  with check (
    public.current_role() in ('psychologist', 'psychometrician')
  );

-- ---------- guardians ----------

create policy guardians_caregiver_rw on public.guardians
  for all to authenticated
  using (public.owns_patient(patient_id))
  with check (public.owns_patient(patient_id));

create policy guardians_admin_all on public.guardians
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- emergency_contacts ----------

create policy emergency_contacts_caregiver_rw on public.emergency_contacts
  for all to authenticated
  using (public.owns_patient(patient_id))
  with check (public.owns_patient(patient_id));

create policy emergency_contacts_admin_all on public.emergency_contacts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- waiver_submissions ----------

create policy waiver_submissions_caregiver_rw on public.waiver_submissions
  for all to authenticated
  using (public.owns_patient(patient_id))
  with check (public.owns_patient(patient_id));

create policy waiver_submissions_admin_all on public.waiver_submissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- documents ----------

create policy documents_caregiver_select on public.documents
  for select to authenticated
  using (public.owns_patient(patient_id));

create policy documents_admin_all on public.documents
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- daily_activity_logs ----------

create policy daily_activity_logs_caregiver_rw on public.daily_activity_logs
  for all to authenticated
  using (public.owns_patient(patient_id))
  with check (public.owns_patient(patient_id));

create policy daily_activity_logs_admin_all on public.daily_activity_logs
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------- announcements ----------
-- Authenticated users in the same clinic can read; admins can write.

create policy announcements_select on public.announcements
  for select to authenticated
  using (clinic_id = public.current_clinic());

create policy announcements_admin_all on public.announcements
  for all to authenticated
  using (public.is_admin() and clinic_id = public.current_clinic())
  with check (public.is_admin() and clinic_id = public.current_clinic());

-- ---------- appointments ----------

create policy appointments_caregiver_select on public.appointments
  for select to authenticated
  using (public.owns_patient(patient_id));

create policy appointments_practitioner_select on public.appointments
  for select to authenticated
  using (practitioner_id = auth.uid());

create policy appointments_admin_all on public.appointments
  for all to authenticated
  using (public.is_admin() and clinic_id = public.current_clinic())
  with check (public.is_admin() and clinic_id = public.current_clinic());

-- ---------- audit_log ----------

create policy audit_log_admin_select on public.audit_log
  for select to authenticated
  using (public.is_admin() and clinic_id = public.current_clinic());
