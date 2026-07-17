-- 0023_add_assigned_to_assignments.sql
-- Add assigned_to_id to assessment_assignments table.

alter table public.assessment_assignments
  add column if not exists assigned_to_id uuid references public.profiles(id) on delete set null;
