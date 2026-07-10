# Blockers — action needed from you (manual)

The build loop skips anything here until you clear it. Each has an ID referenced
from [`backlog.md`](./backlog.md). When you resolve one, tell me the ID.

---

## B1 — Drive form links (blocks: new forms)
The client referenced Google Drive folders **"CYMON WEBSITE FORMS"** and
**"NEW DOCUMENTS"**. I searched the connected Drive and could not find them (only
old university registration/consent PDFs surfaced).
**You do:** share the exact Drive links (or drop the exports into `docs/designs/`).

## B2 — Which forms become checkboxes (blocks: checkbox refactor)
Radyn asked to make forms "checkbox nlng lahat" (convert text inputs / dropdowns to
checkbox / multi-select grids).
**You do:** list which forms and the option values for each — OR reply "you decide"
and I'll convert the obvious candidates (patient registration diagnoses, Daily
Journal, waiver provisions) with sensible option sets.

## B3 — Official ClearMind logo (blocks: #2 landing logo)
Landing currently shows the CyMon logo mislabeled "ClearMind". The client said the
official logo is in their Drive; I couldn't find it.
**You do:** drop the logo file into `frontend/public/` (e.g. `logo-clearmind.png`)
or share the Drive link. CyMon logo stays on Login/Sign-up as the "powered by" mark.

## B4 — Google SSO / Workspace (blocks: #5)
Requires configuration outside the codebase.
**You do (Supabase dashboard):** Authentication → Providers → enable **Google**, add
the OAuth client ID/secret, and restrict to the `@clearmind.ph` domain. Then tell me
and I'll wire the "Sign in with Google" button (`supabase.auth.signInWithOAuth`).

## B5 — Staging deploy to Vercel (blocks: public survey URL)
Code is already scaffolded: `frontend/vercel.json`, `backend/vercel.json`,
`backend/api/index`, and `.env.example` documents the prod URLs. It just needs to be
deployed.
**You do:**
1. Import the `cymon` repo into Vercel **twice** — one project rooted at `frontend/`,
   one at `backend/`.
2. Backend env vars: `PORT`, `CORS_ORIGIN` (= the frontend prod URL),
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Frontend env var: `VITE_API_BASE_URL` = the backend prod URL.
4. Apply pending SQL migrations to Supabase (see below), then share the public URL.

## Supabase migrations to apply (blocks those features working in any env)
Run these in the Supabase SQL editor / CLI, in order:
- `0017_employee_multi_roles.sql` — multi-role employees (#13)
- `0018_announcement_priority.sql` — announcement priority (#16)
- `0019_assessment_activation_requests.sql` — assessment activation (#11)
- *(any new migration this loop adds — e.g. the survey table — will be listed here)*
