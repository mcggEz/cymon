-- Alter enum type submission_status to support 'revalidation' status
-- Since ALTER TYPE ADD VALUE cannot run inside a transaction block in older Postgres versions,
-- we check if it already exists or execute it. In standard Supabase migrations, this runs in a separate step.

ALTER TYPE public.submission_status ADD VALUE IF NOT EXISTS 'revalidation';
