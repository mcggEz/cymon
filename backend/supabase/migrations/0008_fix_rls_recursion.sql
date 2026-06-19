-- 0008_fix_rls_recursion.sql
-- Fix infinite recursion in the RLS layer that broke authentication.
--
-- The helpers in 0007 (current_role, current_clinic, is_admin, owns_patient)
-- read base tables (profiles, patients) but were plain SECURITY INVOKER
-- functions, so those reads were themselves subject to RLS. Every policy that
-- calls a helper therefore re-entered the same table's policies, which called
-- the helper again -> "stack depth limit exceeded" on any user-context query
-- (e.g. a client loading its own profile during login).
--
-- SECURITY DEFINER makes the helpers' internal reads bypass RLS, breaking the
-- cycle. The pinned search_path keeps the definer functions from resolving
-- unqualified names against a caller-controlled schema.

-- ---------- helpers (redefined as SECURITY DEFINER) ----------

create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_clinic()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'admin'
$$;

create or replace function public.owns_patient(p_patient uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.patients p
    where p.id = p_patient and p.caregiver_id = auth.uid()
  )
$$;
