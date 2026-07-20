-- 0026_targeted_announcements.sql
-- Add patient_id column to announcements table to support student-specific targeted announcements.

alter table public.announcements
  add column if not exists patient_id uuid references public.patients(id) on delete cascade;
