-- 0020_admission_extra_fields.sql
-- Adds the remaining Student Admission Form (FO-01) fields that the schema did
-- not yet hold, so the admission form can persist (and the detail view can show)
-- everything it captures. Re-runnable via ADD COLUMN IF NOT EXISTS.

alter table public.patients add column if not exists place_of_birth text;
alter table public.patients add column if not exists citizenship text;
alter table public.patients add column if not exists religion text;

alter table public.clinical_profiles add column if not exists allergies text;
