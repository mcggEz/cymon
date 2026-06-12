# CyMon

ClearMind Psychological Services (CMPS) platform for SPED program management — patient profiles, assessments, daily activity logs, consents, and clinician workflows.

## Repository layout

Two sibling workspaces, each with its own `package.json`. No root manifest — run commands from inside the workspace they target.

```
cymon/
├── frontend/                 # React 19 + Vite 8 SPA
│   └── src/
│       ├── components/ui/    # Reusable primitives (Button, Input, SignaturePad, …)
│       └── pages/            # Routed pages (client / staff areas)
├── backend/                  # Express 5 API
│   ├── index.js              # Server entry
│   └── supabase/
│       └── migrations/       # SQL migrations (0001 … 0007)
└── docs/
    └── designs/              # Figma exports — one screen per file, kebab-case
```

The frontend and backend talk via a Vite dev-server proxy: `/api/*` on `:5173` is forwarded to `:4000`. Always call the API from the frontend with `fetch('/api/...')` — never hard-code `localhost:4000`.

## Tech stack

**Frontend** (`frontend/`, ESM)
- React 19 + React DOM 19
- Vite 8 (`@vitejs/plugin-react`)
- Tailwind CSS v4 via `@tailwindcss/vite` — no `tailwind.config.js`; loaded by `@import "tailwindcss";` in `src/index.css`. Theme tokens live in a `@theme { ... }` block in the same file.
- React Router DOM
- ESLint 10 flat config (`eslint.config.js`) + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`
- No TypeScript, state library, or data-fetching library yet

**Backend** (`backend/`, CommonJS)
- Node.js + Express 5
- Supabase (Postgres) — `@supabase/supabase-js`. Service-role key on the backend only; anon key on the frontend. No other ORM — write SQL or use the Supabase client directly.

When you add a new dependency, update this section so the stack stays discoverable in one place.

## Getting started

Prerequisites: Node 20+, a Supabase project.

```bash
# Frontend
cd frontend
cp .env.example .env          # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev                   # http://localhost:5173

# Backend (separate terminal)
cd backend
cp .env.example .env          # fill in PORT, CORS_ORIGIN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev                   # http://localhost:4000
```

Health check: `GET http://localhost:4000/api/health` → `{ status: "ok", uptime }`.

## Commands

**Frontend** (`cd frontend`)
| Command            | What it does                                        |
|--------------------|-----------------------------------------------------|
| `npm run dev`      | Vite dev server with HMR                            |
| `npm run build`    | Production build to `dist/`                         |
| `npm run preview`  | Serve the built `dist/`                             |
| `npm run lint`     | ESLint across the workspace (ignores `dist`)        |

**Backend** (`cd backend`)
| Command         | What it does                              |
|-----------------|-------------------------------------------|
| `npm run dev`   | `nodemon index.js` — auto-restart on edit |
| `npm start`     | `node index.js`                           |

## Database

Schema lives in `backend/supabase/migrations/` as numbered SQL files. Apply via the Supabase CLI or paste into the SQL editor for prototyping.

- `0001_init_enums_and_lookups.sql` — extensions, ENUMs (`user_role`, `patient_status`, …), `clinics`, `document_types`, shared `set_updated_at` trigger
- `0002_profiles_and_staff.sql` — `profiles` (1:1 with `auth.users`), `admin_profiles`, `staff`, plus `handle_new_user()` trigger that creates a `profiles` row on signup
- `0003_patients_core.sql` — patient records
- `0004_documents_and_compliance.sql` — consent/waiver storage, compliance tracking
- `0005_activity_and_engagement.sql` — daily activity logs, appointments, announcements
- `0006_audit_log.sql` — append-only audit log
- `0007_rls_policies.sql` — Row-Level Security policies (RLS is on)

`user_role` enum: `client | psychologist | psychometrician | admin`.

## Routing map (frontend)

Wired in `frontend/src/App.jsx`:

- **Public:** `/`, `/login`, `*` → `/login`
- **Profile setup:** `/setup/personal`, `/setup/guardian`, `/setup/clinical`
- **Client** (under `ClientLayout`): `/client` → `/client/home`, `/client/activity`, `/client/profile`, `/client/assessments`, `/client/assessments/:id`, `/client/announcements`, `/client/appointments`, `/client/waivers`, `/client/waivers/:id`
- **Psychologist:** `/psychologist` (Approvals index), `/roster`, `/mainstreaming`, `/interventions`, `/progress`
- **Psychometrician:** `/psychometrician` (Tasks index), `/assessments`, `/data-review`, `/activity`, `/reports`
- **Admin:** `/admin` (Overview index), `/patients`, `/compliance`, `/schedule`, `/scoring`, `/documents`, `/announcements`

## Coding practices

### General

- **Small, scoped changes.** One concern per commit, one issue per branch. Unrelated cleanup → separate issue.
- **No speculative code.** No abstractions or options "for later." Wait for the third duplicate before extracting.
- **No dead code or commented-out code.** Delete it — `git` remembers.
- **Comments explain *why*, not *what*.** Only comment when the reason is non-obvious (a workaround, an invariant, a subtle bug).
- **No error handling for impossible cases.** Validate at boundaries (user input, network, DB). Trust internal calls.
- **Lint must be green** before every PR (`npm run lint` in `frontend/`).

### Frontend (React 19 + Vite + Tailwind v4)

- Function components + hooks only. One component per file. Components are `PascalCase.jsx`; hooks are `useCamelCase.js`.
- Style with Tailwind utilities inline — don't create per-component CSS files.
- **Responsive tier pattern** — 3 tiers: **XS base** (`gap-2 px-2`) → **phone** `min-[360px]:` (`gap-3 px-4`) → **tablet+** `sm:` (`gap-4 px-6`). Never jump straight from XS to desktop. Sanity-check at 320 / 360 / 640 / 768 / 1024 px.
- Keep JSX shallow. If a component's return grows past ~40 lines or nests >3 deep, extract a child component.
- Imports ordered: external → alias/absolute → relative.

**UI primitives & theme** (build from scratch — no shadcn, no MUI, no Radix):

- All reusable primitives live in `frontend/src/components/ui/`, one file per primitive, `PascalCase.jsx`.
- Pages **compose** primitives. A page should never hand-style a `<button>` with raw Tailwind — if you're writing `className="bg-blue-500 px-4 py-2 rounded..."` in a page, stop and add (or reuse) a primitive.
- Variants are **props**, not class strings at the call site: `<Button variant="primary" size="sm">`.
- Design tokens (colors, spacing, radii, font sizes, shadows) live in `src/index.css` via Tailwind v4's `@theme` directive. Never hard-code a hex color inside a component.
- When a primitive grows 3+ variants or 4+ size options, split it (`IconButton.jsx` vs `Button.jsx`) instead of adding flags.
- Accessibility is on us: keyboard support, focus-visible styles, ARIA where relevant.

### Backend (Express 5, CommonJS)

- `require` / `module.exports` — `backend/package.json` is `"type": "commonjs"`, so no ESM syntax here.
- Layered handlers: `validate → authenticate → authorize → handler → error middleware`. Each layer is its own middleware function.
- Return proper HTTP status codes (`400` bad input, `401` unauth, `403` forbidden, `404` not found, `409` conflict, `500` server). Never return `200` with an `{ error }` payload.
- Don't swallow errors in route handlers — `next(err)` and let the central error middleware shape the response.
- Secrets come from `process.env`, never hard-coded. `.env` files are gitignored.

## Development workflow

All work flows through: **issue → feature branch → PR**. Never commit directly to `main`.

**Branching**
- Branch off `main`: `git checkout -b <type>/<short-slug>` (e.g. `fix/xs-responsive-regression`).
- One branch per issue. Keep branches short-lived.

**Commit & PR titles — Conventional Commits**

Format: `type(scope): short lowercase description`

- **Types:** `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`
- **Scope:** area touched — `ui`, `api`, `auth`, `admin`, `backend`, `frontend`, …
- **Description:** imperative, lowercase, no trailing period

Example: `fix(ui): responsive regression on normal phones and admin XS styling`

**Issue template** — three H2 sections, in this order:

```md
## Problem
What is broken, observably. Include screen sizes / environments / repro steps.

## Root Cause
Why it's broken — the actual mechanism. Cite the offending pattern.
If the cause is unknown, the issue is an investigation, not a fix.

## Fix
Bulleted plan, grouped by area. Each bullet should map to one or two commits.
```

**Pull requests**
- PR title matches the issue title (same Conventional Commits string).
- PR body opens with `Closes #<issue>` and mirrors the issue's **Fix** section as a checklist.
- Keep PRs scoped to one issue. Split work into follow-up issues rather than piling onto a PR.
- Squash-merge into `main` so the merge commit carries the Conventional Commits title.

## Design references

UI work tracks Figma exports in `docs/designs/`. Drop PNG/JPG/SVG there, one screen per file, kebab-case name (e.g. `client-view-assessment-answers.png`). Pair mobile + desktop exports for responsive screens; export at 2x for legible text.
