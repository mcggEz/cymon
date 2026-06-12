# Database migrations

This folder is the single source of truth for the CyMon database schema. Every
schema change ships as a new, numbered, immutable SQL file. To bring a fresh
Supabase project up to the current schema, paste each file (in order) into the
Supabase SQL editor and run it.

## How to apply

**Supabase dashboard (quickest for prototyping):**
1. Open your project → **SQL Editor** → **New query**.
2. Paste the contents of one migration file.
3. Run it. Repeat for the next file in order.

**Supabase CLI (recommended once the project is set up):**
```bash
supabase db push
```
The CLI reads this folder, tracks which migrations have already been applied
in the `supabase_migrations.schema_migrations` table, and runs only the new
ones. Do **not** edit a migration after it has been applied to a real
database — write a new migration that alters the schema instead.

## Naming convention

```
NNNN_short_snake_case_description.sql
```

- `NNNN` — zero-padded sequence number (`0001`, `0002`, …). Always one greater
  than the last file in the folder. Never reuse a number, never insert in the
  middle.
- `short_snake_case_description` — what the migration changes, in 2–5 words.

Examples: `0008_add_therapist_roles.sql`, `0009_extend_patient_demographics.sql`.

## File template

Every migration begins with a header comment that explains **what** the file
adds and **why**. Anyone reading the migration in isolation should understand
the intent without opening other files.

```sql
-- NNNN_short_description.sql
-- One-line summary of what this migration introduces.
-- Optional second line: motivation, the issue it closes, or the workflow it
-- enables. Keep this block under ~5 lines.

-- ---------- <table or feature> ----------
-- Brief comment above each non-trivial create/alter explaining its role.

create table public.example (
  id uuid primary key default gen_random_uuid(),
  ...
);
```

Inline guidelines:
- Group related statements under a `-- ---------- name ----------` divider.
- Always add a `set_updated_at` trigger on tables that carry an `updated_at`
  column (the function is defined in `0001`).
- New ENUM values go in their own migration so that the dependent code can
  ship independently. Use `alter type ... add value '...'` rather than
  recreating the type.
- When a migration enables or alters RLS policies, mirror the convention
  established in `0007` (clients see only their own rows; staff see clinic-
  scoped rows; admins see everything within the clinic).
- Never drop a column without first marking it deprecated in code and
  shipping at least one release that no longer references it.

## Migration catalogue

The following files compose the current schema. Each entry describes the
scope of the file so future changes can be placed correctly.

### `0001_init_enums_and_lookups.sql`
Bootstraps the database. Enables the `pgcrypto` extension (required for
`gen_random_uuid()`), defines every shared ENUM (`user_role`, `sex_enum`,
`patient_status`, `admission_status`, `doc_category`, `compliance_status`,
`mood_enum`, `task_completion_enum`, `behavioral_enum`, `sleep_enum`,
`appetite_enum`, `announcement_type`, `session_type_enum`, `color_enum`,
`appointment_status`, `severity_enum`), creates the lookup tables (`clinics`,
`document_types`), and installs the shared `set_updated_at()` trigger
function reused by every other migration.

### `0002_profiles_and_staff.sql`
Introduces the identity model. Creates `public.profiles` (one row per
`auth.users` entry, carrying role, display name, email, clinic affiliation),
plus the role-extension tables `admin_profiles` (employee ID, position) and
`staff` (license number, title). The `handle_new_user()` `security definer`
function and the `on_auth_user_created` trigger automatically materialize a
`profiles` row from `raw_user_meta_data` (`role`, `display_name`,
`clinic_code`) whenever a Supabase auth user is created. This is what allows
the frontend `signUp` call to provision a fully-formed profile in one round
trip.

### `0003_patients_core.sql`
Defines the patient (child) domain: `patients`, `clinical_profiles`,
`guardians`, and `emergency_contacts`. Establishes the patient identifier
format `CMPS-YYYY-NNN` (zero-padded, per-clinic per-year sequence) used
throughout the user interface.

### `0004_documents_and_compliance.sql`
Models the consent-and-waiver lifecycle. `waiver_submissions` tracks the
compliance state of each consent the parent must sign; finalized documents
land in a document vault for retrieval by clinicians and administrators.

### `0005_activity_and_engagement.sql`
Captures the day-to-day operational data: `daily_activity_logs` (caregiver
observations of mood, task completion, behavior, sleep, appetite),
`announcements` (clinic-wide messages displayed in the client portal), and
`appointments` (scheduled sessions and their statuses).

### `0006_audit_log.sql`
Append-only `audit_log` table that records every state-mutating action.
Powers the administrator "Recent Activity" feed and the compliance counters,
and supports retrospective forensic review.

### `0007_rls_policies.sql`
Enables Row-Level Security on every `public` table and installs the access
policies. Conventions:
- **Clients** (`role='client'`) see only rows tied to patients they own.
- **Staff** (`psychologist`, `psychometrician`, future `occupational_therapist`,
  `speech_therapist`) see rows scoped to their clinic.
- **Admins** see everything within their clinic.
This is the security boundary that allows the frontend to query Supabase
directly (using the anon key) without exposing other clinics' data.

## Next migrations on the roadmap

These are queued based on the latest requirements review. Each will be its
own numbered file when implemented:

1. **Add therapist roles** — `alter type user_role add value
   'occupational_therapist'; alter type user_role add value
   'speech_therapist';`
2. **Extend patient demographics** — add `middle_name`, `name_suffix`,
   `address` to `patients`; introduce `prior_diagnoses` (physician name,
   institution).
3. **Guardian photo** — add `photo_url` column on `guardians`, plus a
   Supabase Storage bucket policy for `guardian-photos`.
4. **Assessment routing & sign-off** — introduce
   `assessment_reports` (`prepared_by`, `noted_by`, `status` enum
   `draft|submitted|approved|revise_requested`, `routed_to`) plus an
   `assessment_assignments` table modeling the online/onsite modality and
   clinician approval.
5. **Document requests** — `document_requests` table for the client-portal
   "Request for Document" feature.
