-- 0014_extend_demographics.sql
-- Registration additions from the client interview:
--   - patient name suffix (Jr / extension)
--   - prior diagnosis / initial assessment done at another institution
--     (developmental pediatrician / physician name + institution)
--   - guardian photo for onsite verification
--
-- Re-runnable: every column uses ADD COLUMN IF NOT EXISTS.

alter table public.patients
  add column if not exists name_suffix text;

alter table public.clinical_profiles
  add column if not exists prior_diagnosis text;
alter table public.clinical_profiles
  add column if not exists prior_physician text;
alter table public.clinical_profiles
  add column if not exists prior_institution text;

alter table public.guardians
  add column if not exists photo_url text;
