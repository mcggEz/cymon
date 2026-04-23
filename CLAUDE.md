# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two sibling workspaces at the repo root, each with its own `package.json` — no root package manifest or workspace config. Run commands from inside the workspace they target.

- `frontend/` — React 19 + Vite 8 SPA, styled with Tailwind CSS v4 (via `@tailwindcss/vite`, loaded in `src/index.css` with `@import "tailwindcss";` — no `tailwind.config.js`).
- `backend/` — Express 5 server entry point is `index.js`. Listens on `process.env.PORT` (defaults to `4000`). CORS allows `process.env.CORS_ORIGIN` (defaults to `http://localhost:5173`).

The two sides talk via a Vite dev-server proxy: `/api/*` on the frontend (`:5173`) is forwarded to the backend (`:4000`). Call the API from the frontend with plain `fetch('/api/...')` — never hard-code `localhost:4000` in the frontend.

## Tech stack

**Frontend** (`frontend/`, ESM)
- React 19 + React DOM 19
- Vite 8 (`@vitejs/plugin-react`) for dev server, HMR, and production build
- Tailwind CSS v4 via `@tailwindcss/vite` — no `tailwind.config.js`; loaded by `@import "tailwindcss";` in `src/index.css`
- ESLint 10 flat config (`eslint.config.js`) with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`
- No TypeScript, router, state library, or data-fetching library yet

**Backend** (`backend/`, CommonJS)
- Node.js + Express 5
- **Database & auth: Supabase (Postgres)** — via `@supabase/supabase-js`. Service-role key on the backend only; anon key on the frontend. No other ORM / query builder — write SQL (or use the Supabase client) directly.
- No validator or test runner yet

When adding a new dependency, update this section so the stack stays discoverable in one place.

## Commands

Frontend (`cd frontend`):
- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/`
- `npm run lint` — ESLint across the workspace (flat config in `eslint.config.js`, ignores `dist`)

Backend (`cd backend`):
- `npm run dev` — `nodemon index.js` (auto-restart on changes)
- `npm start` — `node index.js`
- Requires `.env` (copy from `.env.example`) with `PORT`, `CORS_ORIGIN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Health check: `GET /api/health` returns `{ status: "ok", uptime }`.

## Coding practices

### General

- **Small, scoped changes.** One concern per commit, one issue per branch. If you notice unrelated cleanup, open a separate issue — don't pile it on.
- **No speculative code.** No abstractions, helpers, or options "for later." Wait for the third duplicate before extracting.
- **No dead code or commented-out code.** Delete it — `git` remembers.
- **Comments explain *why*, not *what*.** Code with good names needs no narration. Only comment when the reason is non-obvious (a workaround, an invariant, a subtle bug).
- **No error handling for impossible cases.** Validate at boundaries (user input, network, DB). Trust internal calls.
- **Lint must be green.** `npm run lint` in `frontend/` passes before every PR.

### Frontend (React 19 + Vite + Tailwind v4)

- Function components + hooks only. No class components.
- One component per file. Components are `PascalCase.jsx`; hooks are `useCamelCase.js`.
- Style with Tailwind utilities inline — don't create per-component CSS files. `src/index.css` stays as just `@import "tailwindcss";`.
- **Responsive tier pattern** (from the `#141` regression — don't repeat that mistake):
  - 3-tier layout: **XS base** (e.g. `gap-2 px-2`) → **phone** `min-[360px]:` (e.g. `gap-3 px-4`) → **tablet+** `sm:` (e.g. `gap-4 px-6`).
  - Never jump straight from XS to desktop padding. Always include the `sm:` middle tier.
  - Sanity-check at 320 / 360 / 640 / 768 / 1024 px.
- Keep JSX shallow. If a component's return grows past ~40 lines or nests >3 deep, extract a child component.
- Imports ordered: external packages → alias/absolute → relative.

**UI primitives & theme (build from scratch — no shadcn, no MUI, no Radix).**

- All reusable primitives live in `frontend/src/components/ui/` — one file per primitive, `PascalCase.jsx`. Examples: `Button.jsx`, `Input.jsx`, `Card.jsx`, `Dialog.jsx`, `Badge.jsx`.
- Pages **compose** primitives. A page should never hand-style a `<button>` with raw Tailwind classes — if you find yourself writing `className="bg-blue-500 px-4 py-2 rounded..."` in a page, stop and add (or reuse) a `<Button>` primitive.
- Variants are **props**, not class strings at the call site. `<Button variant="primary" size="sm">` — the mapping from prop → Tailwind classes lives inside the primitive.
- **Design tokens live in `src/index.css`** using Tailwind v4's `@theme` directive (colors, spacing scale, radii, font sizes, shadows). Consume them via Tailwind utilities. Never hard-code a hex color inside a component.
- When a primitive grows 3+ variants or 4+ size options, split it (`IconButton.jsx` vs `Button.jsx`) rather than adding flags.
- Accessibility is on us: every primitive needs keyboard support, focus-visible styles, ARIA where relevant. Test with Tab/Enter/Esc before marking a primitive done.

### Backend (Express 5 on Node, CommonJS)

- `require` / `module.exports` — `backend/package.json` is `"type": "commonjs"`, so no ESM syntax in this workspace.
- Layered handlers: `validate → authenticate → authorize → handler → error middleware`. Each layer is its own middleware function.
- Return proper HTTP status codes (`400` for bad input, `401` unauth, `403` forbidden, `404` not found, `409` conflict, `500` server). Never return `200` with an `{ error }` payload.
- Don't swallow errors in route handlers — `next(err)` and let a central error middleware shape the response.
- Secrets come from `process.env`, never hard-coded. `.env` files are gitignored.

## Development workflow

All work flows through: **issue → feature branch → PR**. Never commit directly to `main`.

### Branching

- Branch off `main`: `git checkout -b <type>/<short-slug>` (e.g. `fix/xs-responsive-regression`).
- One branch per issue. Keep branches short-lived — rebase or merge `main` in regularly.

### Commit & PR titles — Conventional Commits

Format: `type(scope): short lowercase description`

- **Types:** `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`
- **Scope:** area touched — `ui`, `api`, `auth`, `admin`, `backend`, `frontend`, etc.
- **Description:** imperative, lowercase, no trailing period.

Example: `fix(ui): responsive regression on normal phones and admin XS styling`

### Issue template

Every issue uses these three H2 sections, in this order:

```md
## Problem
What is broken, observably. Include screen sizes / environments / repro steps.

## Root Cause
Why it's broken — the actual mechanism. Cite the offending pattern (class names,
function, file path). If the cause is unknown, the issue is an investigation,
not a fix — label it accordingly.

## Fix
Bulleted plan, grouped by area. Each bullet should be small enough to review
and map to one or two commits.
```

Reference example: `fix(ui): responsive regression on normal phones and admin XS styling #141` — groups the Fix into *Normal phone regression*, *Admin XS styling*, and *OAuth buttons*, each with concrete bullets. Match that level of specificity.

### Pull requests

- PR title matches the issue title (same Conventional Commits string).
- PR body opens with `Closes #<issue>` and mirrors the issue's **Fix** section as a checklist, ticking items as commits land.
- Keep PRs scoped to one issue. If work grows, split into follow-up issues rather than piling onto the PR.
- Squash-merge into `main` so the merge commit carries the Conventional Commits title.

## Notes for changes

- ESLint uses the flat-config format (`eslint.config.js`) with `@eslint/js`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. JSX is enabled via `parserOptions.ecmaFeatures.jsx`. There is no Prettier config.
- Tailwind v4 is configured via the `@tailwindcss/vite` plugin in `vite.config.js`; utilities resolve from `@import "tailwindcss";` in `src/index.css`. Theme tokens go in that same file inside a `@theme { ... }` block — there is no `tailwind.config.js`.
- `backend/package.json` declares `"type": "commonjs"`; `frontend/package.json` declares `"type": "module"`. Match the module style of the workspace you are editing.
