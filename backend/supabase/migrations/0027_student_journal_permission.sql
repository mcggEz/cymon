-- Migration: Add allow_journal_entry column to public.patients
-- Default is FALSE (locked by default until granted by Psychologist)

ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS allow_journal_entry BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.patients.allow_journal_entry IS 'Controls whether caregiver/student is permitted to write daily activity log journal entries.';
