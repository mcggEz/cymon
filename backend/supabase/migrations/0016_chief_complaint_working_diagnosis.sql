-- 0016_chief_complaint_working_diagnosis.sql
-- Patient record additions from the client meeting:
--   - chief_complaint   — the main reason the patient came in to consult
--   - working_diagnosis — the MHP's initial impression while evaluation is ongoing
--
-- Re-runnable: every column uses ADD COLUMN IF NOT EXISTS.

alter table public.clinical_profiles
  add column if not exists chief_complaint text;
alter table public.clinical_profiles
  add column if not exists working_diagnosis text;
