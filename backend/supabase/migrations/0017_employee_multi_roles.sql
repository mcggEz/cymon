-- 0017_employee_multi_roles.sql
-- Lets one employee hold more than one role (e.g. Psychologist + Speech
-- Therapist, or Psychologist + Admin). The primary `role` column still drives
-- login routing and RLS; any additional roles are stored here for display and
-- for cross-role assignment. Additive and safe: existing rows default to '{}'.

alter table public.profiles
  add column if not exists extra_roles user_role[] not null default '{}';
