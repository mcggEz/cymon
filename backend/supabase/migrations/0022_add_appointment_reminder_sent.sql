-- 0022_add_appointment_reminder_sent.sql
-- Add a flag to track whether an appointment reminder email has been sent.

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false;

-- Create an index to make querying unreminded scheduled appointments fast
CREATE INDEX IF NOT EXISTS appointments_reminder_sent_idx
  ON public.appointments (reminder_sent, starts_at)
  WHERE status = 'scheduled';
