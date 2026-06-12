-- 0004_documents_and_compliance.sql
-- Waiver submissions (compliance tracker) + finalized documents (vault).

-- ---------- waiver_submissions ----------

create table public.waiver_submissions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  document_type_code text not null references public.document_types(code),
  signed_by_guardian_id uuid references public.guardians(id) on delete set null,
  signed_by_profile_id uuid references public.profiles(id) on delete set null,
  signed_at timestamptz,
  signature_text text,
  provisions_agreed jsonb not null default '{}'::jsonb,
  house_rules_agreed boolean not null default false,
  status compliance_status not null default 'pending_signature',
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index waiver_submissions_patient_idx on public.waiver_submissions (patient_id);
create index waiver_submissions_status_idx on public.waiver_submissions (status);
create index waiver_submissions_due_idx on public.waiver_submissions (due_date);

create trigger waiver_submissions_set_updated_at
  before update on public.waiver_submissions
  for each row execute function public.set_updated_at();

-- ---------- documents ----------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  document_type_code text not null references public.document_types(code),
  title text,
  file_url text,
  finalized_at timestamptz not null default now(),
  created_by_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_patient_idx on public.documents (patient_id);
create index documents_type_idx on public.documents (document_type_code);
create index documents_finalized_idx on public.documents (finalized_at desc);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();
