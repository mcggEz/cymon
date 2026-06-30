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

### `0008_fix_rls_recursion.sql`
Fixes an infinite-recursion bug in the `0007` RLS layer. The helper functions
(`current_role`, `current_clinic`, `is_admin`, `owns_patient`) read base tables
but were `SECURITY INVOKER`, so a policy that called a helper re-entered the
same table's policies and called the helper again — `stack depth limit
exceeded` on any user-context query (which broke login when the profile was
read under the user's JWT). Redefines all four helpers as `SECURITY DEFINER`
with a pinned `search_path` so their internal reads bypass RLS and break the
cycle.

### `0009_assessment_engine.sql`
The assessment engine, shared by the client portal and the psychometrician/admin
staff views. Three tables: `assessment_templates` (one per assessable form, with
the domains/items structure stored as JSONB and a link to the `document_types`
code), `assessment_assignments` (a template assigned to a patient — the client's
"new assessments" feed and the psychometrician task queue), and
`assessment_submissions` (the filled answers as JSONB plus numeric
`total_score`/`max_score`/`domain_scores` so ScoringAnalytics can aggregate
without parsing JSON). RLS mirrors `0007`: templates are a read-only catalog;
assignments and submissions follow caregiver-owns-patient / staff-in-clinic /
admin-all.

### `0010_assessment_reports.sql`
Assessment reports + routing/sign-off. `assessment_reports` carries a
`report_type` (`behavioral` FO-06 / `progress_summary` FO-08), a `report_status`
lifecycle (`draft → in_progress → ready_for_review → revise_requested → approved
→ finalized`), `completeness`, `prepared_by_id` (psychometrician) and
`noted_by_id` (psychologist sign-off), plus an optional link to the source
`assessment_submissions` row. Powers psychometrician DraftingReports,
psychologist Approvals + Progress, and the admin Document Vault. Also introduces
the shared `staff_can_access_patient(uuid)` SECURITY DEFINER helper (named param,
so `patients.patient_id` can't shadow it) reused by `0011`. Reports are
staff-internal — no caregiver policy.

### `0011_interventions_and_roster.sql`
Psychologist domain. Adds `support_level` (HSN/MSN/LSN) and `milestone_progress`
to `clinical_profiles` (the RosterOverview classification), plus `interventions`
(plan with `procedure_count` + status) and `mainstreaming_assessments`
(transition `readiness_score` + status). RLS uses `staff_can_access_patient()`
from `0010`.

### `0012_session_logs.sql`
Psychometrician session activity logs (FO-07): `session_logs` with session
number/date, activity title, objectives/procedure/observations, and a
`draft → pending → approved` workflow. Powers the psychometrician ActivityLog
page. RLS via `staff_can_access_patient()`.

### `0013_add_therapist_roles.sql`
Adds `occupational_therapist` and `speech_therapist` to the `user_role` enum
(reports can be routed to them; they can hold accounts). Own migration because
new enum values must commit before being referenced.

### `0014_extend_demographics.sql`
Registration additions from the client interview: `patients.name_suffix`
(Jr/extension); `clinical_profiles.prior_diagnosis` / `prior_physician` /
`prior_institution` (already diagnosed or assessed at another institution); and
`guardians.photo_url` (onsite verification).

### `0015_notifications.sql`
Per-recipient `notifications` table powering the header bell (client portal
first; the schema is recipient-agnostic so staff bells can reuse it). Each row
carries a `notification_type` (`appointment`/`report`/`assessment`/
`announcement`/`waiver`/`system`), a `title`/`body`, an optional in-app `link`,
and a nullable `read_at` (null = unread). Distinct from `audit_log`: the audit
log is the clinic-wide, append-only compliance ledger read only by admins;
notifications are personal, actionable, and dismissible per recipient. RLS:
a recipient reads/updates only their own rows; admins manage clinic-scoped
rows. Backend writers use `lib/notify.js` `createNotification()` (best-effort,
never blocks the primary request) — first wired into admin appointment booking.

## Next migrations on the roadmap

These are queued based on the latest requirements review. Each will be its
own numbered file when implemented:

1. **Assessment modality & approval** — add `modality` (online/onsite) and
   `approved_by_id`/`approved_at` to `assessment_assignments`; online ones only
   surface to the client once a clinician approves them.
2. **Report routing notifications** — recipients for routed reports
   (psychologist → speech/occupational therapist); reuse the `notifications`
   table from `0015` to drive the "notify psychometrician/psychologist" flows.
3. **Document requests** — `document_requests` table for the client-portal
   "Request for Document" feature.
