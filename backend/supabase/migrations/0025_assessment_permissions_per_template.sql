-- 0025_assessment_permissions_per_template.sql
-- Modify assessment_permissions table to be template-specific.

alter table public.assessment_permissions
  drop constraint if exists assessment_permissions_clinic_id_patient_id_key;

alter table public.assessment_permissions
  add column if not exists template_id uuid references public.assessment_templates(id) on delete cascade;

alter table public.assessment_permissions
  add constraint assessment_permissions_patient_template_unique unique (clinic_id, patient_id, template_id);
