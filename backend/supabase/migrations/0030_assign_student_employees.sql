-- Migration: 0030_assign_student_employees.sql
-- Add treating_psychologist_id and treating_psychometrician_id columns to patients table

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS treating_psychologist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS treating_psychometrician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
