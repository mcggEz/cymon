# CyMon: A Web-Based Information System for the Special Education Program of ClearMind Psychological Services

## Abstract

CyMon is a web-based clinical information system developed for the Special Education (SPED) Program of ClearMind Psychological Services (CMPS). The system consolidates patient profiles, behavioral and developmental assessments, daily activity monitoring, consent and waiver management, and clinician workflows into a single platform accessible to four distinct user roles: clients (parents and caregivers), psychologists, psychometricians, and administrators. The implementation follows a decoupled two-tier architecture in which a React single-page application communicates with a Node.js (Express) application programming interface, while authentication, persistent storage, and row-level access control are delegated to a managed Supabase (PostgreSQL) backend. This document describes the system's architecture, data model, role-based functional decomposition, and the implementation conventions adopted to ensure maintainability and reproducibility.

## 1. System Overview

CyMon was designed to address three concurrent operational requirements of CMPS: (i) longitudinal monitoring of pediatric clients enrolled in the SPED program, (ii) digitization of consent, waiver, and compliance documentation in conformity with Republic Act No. 10173 (Data Privacy Act of 2012) and National Privacy Commission Circular No. 2023-04, and (iii) workflow coordination among the multidisciplinary clinical staff. The platform exposes role-specific interfaces — a client-facing area for parents and caregivers, dedicated dashboards for psychologists and psychometricians, and an administrative console — backed by a shared relational schema. Authentication is performed against Supabase Auth, and authorization is enforced both at the user-interface tier (route guards keyed to user role) and at the database tier (PostgreSQL Row-Level Security policies).

## 2. Architecture

The system adopts a client-server architecture composed of three independently deployable components: a frontend single-page application, a backend application programming interface, and a managed database with integrated authentication services. The frontend communicates with the backend through a Vite development-server proxy that forwards all requests prefixed `/api/*` from port 5173 (frontend) to port 4000 (backend), eliminating cross-origin concerns during development. In production, the same path prefix is preserved by the reverse proxy of the hosting environment. The backend is intentionally thin: it is reserved for operations that require server-side privileges (for example, actions executed with the Supabase service-role key) or that compose multiple table writes inside a single transaction. Operations that can be safely performed under Row-Level Security — chiefly authentication, session management, and reads of records the requesting user owns — are issued directly from the frontend to Supabase, reducing latency and minimizing the surface area of the bespoke backend.

### 2.1 Frontend

The frontend is implemented in React 19 with the Vite 8 build toolchain and `@vitejs/plugin-react` for hot module replacement. Styling is provided by Tailwind CSS version 4, loaded through the `@tailwindcss/vite` plugin and consumed via the directive `@import "tailwindcss";` inside `src/index.css`. Design tokens — colors, spacing, radii, font sizes, and shadows — are declared in a `@theme { … }` block within the same stylesheet, in accordance with the configuration-as-CSS model introduced in Tailwind v4; no separate `tailwind.config.js` is used. Client-side routing is handled by React Router, and static analysis is enforced by ESLint 10 in flat-configuration mode (`eslint.config.js`) with the `react-hooks` and `react-refresh` plugins. The project intentionally omits TypeScript, a global state management library, and a data-fetching library at this stage; component-local state and the Supabase client are sufficient for the current feature set.

A small library of in-house user-interface primitives (located under `frontend/src/components/ui/`) provides the building blocks for all pages: `Button`, `Input`, `Checkbox`, `Textarea`, `Select`, `SegmentedControl`, and `SignaturePad`. These primitives are deliberately developed from first principles rather than adopted from a third-party library, ensuring that visual identity, accessibility behavior, and bundle size remain under direct control. Pages compose these primitives and never hand-style raw HTML elements; variant selection is exposed through props (for example `<Button variant="primary" size="lg">`) rather than through ad-hoc class strings at the call site.

### 2.2 Backend

The backend is a Node.js application built on Express 5 in CommonJS module format. The entry point (`backend/index.js`) configures cross-origin resource sharing against the value of the `CORS_ORIGIN` environment variable, registers a JSON body parser, exposes a health-check endpoint at `GET /api/health`, and terminates the request pipeline with a not-found handler and a centralized error middleware that converts thrown errors into structured JSON responses with appropriate Hypertext Transfer Protocol status codes. The handler chain follows the discipline `validate → authenticate → authorize → handler → error middleware`, with each layer implemented as a separate middleware function. The backend communicates with Supabase via the official `@supabase/supabase-js` client, using the service-role key, which is held exclusively on the server.

### 2.3 Database and Authentication

The persistence layer is a managed PostgreSQL instance provided by Supabase. The schema is defined as a sequence of numbered Structured Query Language migration files under `backend/supabase/migrations/`. These migrations create the enumerated types and lookup tables (`0001`), the user profile and staff tables together with a `handle_new_user()` trigger that materializes a `profiles` row whenever a new authentication user is created (`0002`), the core patient records (`0003`), the document and compliance tables (`0004`), the activity and engagement tables (`0005`), the append-only audit log (`0006`), and finally the Row-Level Security policies that constrain access to each table on the basis of the requesting user's role and clinic affiliation (`0007`). Authentication is performed against Supabase Auth using the password grant; sessions are persisted in browser storage by the Supabase JavaScript client, which also handles automatic refresh-token rotation. The frontend additionally maintains an `AuthProvider` context that subscribes to authentication state changes and exposes a `useAuth()` hook returning the current session, the resolved profile (including role), and `signIn` and `signOut` functions. A `RequireAuth` route guard component restricts access to authenticated areas and, optionally, to a specified subset of roles.

## 3. Data Model

The core enumeration `user_role` partitions all platform users into four mutually exclusive categories: `client`, `psychologist`, `psychometrician`, and `admin`. Each authenticated user is associated with a single row in `public.profiles`, which references `auth.users(id)` and carries the user's role, display name, electronic mail address, and clinic affiliation. Sub-tables `admin_profiles` and `staff` extend the base profile with role-specific attributes such as employee identifier, position title, professional license number, and clinical title. Patient records are stored in their own tables introduced in migration `0003`; documents, consents, and compliance state are introduced in `0004`; daily activity logs, appointments, announcements, and other engagement-related entities are introduced in `0005`. The audit log (`0006`) is append-only and records every state-mutating action for retrospective inspection. Additional enumerated types capture clinically relevant categorical variables, including mood (`very_bad`, `sad`, `okay`, `good`, `great`), task completion (`yes_all`, `some`, `none`), behavioral observation severity (`none`, `mild`, `significant`), sleep quality (`good`, `restless`, `poor`), appetite (`good`, `average`, `refused`), session type (Mini-Mental Status Examination, Child Adaptive Functioning Tool, Gilliam Autism Rating Scale, initial assessment, follow-up, therapy, parent consultation), and document category (admission, waiver, assessment report, progress report).

## 4. Functional Decomposition by Role

The frontend implements thirty-three application pages organized into four role-specific functional areas, in addition to a public landing page, an authentication page, and a three-step profile-setup workflow for new clients. The complete routing table is declared in `frontend/src/App.jsx`.

### 4.1 Client Area

The client area, accessible at the path prefix `/client`, is intended for parents and caregivers of enrolled children. The default landing route `/client/home` presents the Home and Progress dashboard, which summarizes the child's current developmental stage, recent assessment activity, mood trends across the preceding seven-day window, and the next scheduled appointment. The Daily Activity Log (`/client/activity`) accepts structured caregiver observations across mood, task completion, behavioral incidents, sleep, and appetite dimensions. The Assessment Center (`/client/assessments`) lists assessments assigned to the child and, in its Records tab, presents previously submitted responses inline, with each observation paired with its recorded indicator value. The Announcement (`/client/announcements`), Appointments (`/client/appointments`), and Consents and Waivers (`/client/waivers`) pages provide read access to clinic communications, the appointment schedule, and the documentary record respectively. The waiver-detail page implements an electronic-signature primitive offering two acquisition modes — canvas-based drawing with pointer events suitable for mouse, stylus, or touch input, and image upload — capturing the signature as a data URL for subsequent submission. A separate My Profile route (`/client/profile`) consolidates demographic, clinical, guardian, and account-settings information.

### 4.2 Psychologist Area

The psychologist area (`/psychologist`) supports the supervising clinical psychologist in five workflows: review and approval of submitted documentation (Approvals, default landing route), longitudinal oversight of the patient roster (Roster Overview at `/roster`), mainstreaming-readiness review (`/mainstreaming`), intervention planning (`/interventions`), and progress monitoring (`/progress`).

### 4.3 Psychometrician Area

The psychometrician area (`/psychometrician`) supports the registered psychometrician in five workflows: task management (default landing route), assessment administration (`/assessments`), data review and quality assurance (`/data-review`), an activity log of administrations performed (`/activity`), and the drafting of formative assessment reports (`/reports`).

### 4.4 Administrative Area

The administrative area (`/admin`) supports operational oversight of the program. The default landing route presents an Overview dashboard summarizing clinic-wide metrics. Subordinate routes provide management of patients (`/patients`), compliance tracking (`/compliance`), the appointment schedule (`/schedule`), scoring analytics (`/scoring`), the document vault (`/documents`), and the dissemination of announcements (`/announcements`).

## 5. Authentication and Session Management

User authentication proceeds as follows. The Login page (`/login`) presents a segmented control for role selection followed by electronic-mail and password fields. On submission, the frontend invokes `supabase.auth.signInWithPassword`, which returns a JavaScript Object Notation Web Token together with refresh-token metadata; the Supabase client persists this material in browser storage and arranges for automatic refresh prior to expiry. The frontend then queries the `profiles` table for the authenticated user's row, validates that the persisted role matches the role selected at the login prompt, and redirects the user to the appropriate area. State changes are propagated to subscribed components through the React context defined in `AuthProvider`. Sign-out is initiated from the header of any authenticated page and results in the removal of cached tokens and a redirect to the public Login page. Server-side, authorized backend endpoints will verify the incoming bearer token by invoking `supabase.auth.getUser`, which performs cryptographic validation against the project's authentication keys and yields the authenticated user identifier; the backend then looks up the associated profile to populate the request context with the user's role and clinic affiliation before dispatching to the route handler.

## 6. Implementation Conventions

To support long-term maintainability, the codebase adheres to a set of explicitly stated conventions. Changes are kept small and scoped to a single concern; speculative abstractions are avoided in favor of duplication until a third instance establishes a clear shared shape. Dead code and commented-out code are removed rather than retained, on the basis that the version-control history serves as the authoritative archive. Comments are reserved for non-obvious rationale rather than restatements of behavior expressible in the code itself. Error handling is restricted to genuine system boundaries — user input, network calls, and database operations — and is not introduced defensively at internal call sites.

Frontend components are implemented as function components with React hooks, one component per file, named in `PascalCase.jsx`; hooks reside in files named `useCamelCase.js`. Layout responsiveness adopts a three-tier breakpoint pattern that progresses from an extra-small base (suitable for viewports as narrow as 320 pixels) through a phone tier introduced at the `min-[360px]` breakpoint to a tablet-and-larger tier at the `sm` (640 pixels and above) breakpoint, with viewports of 320, 360, 640, 768, and 1024 pixels treated as canonical inspection points. The Java Script Extension (JSX) returned by each component is kept shallow; components whose return value exceeds approximately forty lines or nests beyond three levels are decomposed into child components.

Backend handlers are written in CommonJS module syntax in accordance with the `"type": "commonjs"` declaration in `backend/package.json`. Hypertext Transfer Protocol responses use semantically appropriate status codes (`400` for malformed input, `401` for missing or invalid authentication, `403` for insufficient authorization, `404` for absent resources, `409` for conflicts with existing state, and `500` for unexpected server failures); error payloads are never returned with a `200` status. Secrets are read from environment variables loaded via the `dotenv` module and are never embedded in source files.

The development workflow is organized around the triad of issue, feature branch, and pull request. Direct commits to the `main` branch are prohibited. Branch names follow the form `<type>/<short-slug>` (for example, `fix/xs-responsive-regression`), and commit messages and pull-request titles adopt the Conventional Commits specification: `type(scope): short lowercase description`. Permitted types include `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, and `perf`. Each issue is structured into three sections — *Problem*, *Root Cause*, and *Fix* — and the corresponding pull-request description mirrors the *Fix* section as a checklist. Pull requests are merged into `main` using the squash strategy so that the merge commit retains the Conventional Commits title.

## 7. Repository Organization

The repository consists of two sibling workspaces, each with its own package manifest:

```
cymon/
├── frontend/                         React 19 single-page application
│   ├── src/
│   │   ├── auth/                     Authentication context and route guard
│   │   ├── components/ui/            Reusable interface primitives
│   │   ├── lib/                      Supabase browser client
│   │   └── pages/                    Routed pages (client and staff areas)
│   ├── eslint.config.js              Flat-format ESLint configuration
│   ├── vite.config.js                Vite build configuration
│   └── package.json
├── backend/                          Express 5 application programming interface
│   ├── index.js                      Server entry point
│   ├── supabase/migrations/          Numbered Structured Query Language migrations
│   └── package.json
├── docs/
│   └── designs/                      User-interface design exports
├── CLAUDE.md                         Repository-specific assistant guidance
└── README.md                         This document
```

## 8. Reproducing the Development Environment

The following procedure reproduces a working development environment on a host machine running Microsoft Windows, macOS, or a Linux distribution with Node.js version 20 or later installed.

```bash
# Frontend
cd frontend
cp .env.example .env             # populate VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev                      # serves the application at http://localhost:5173

# Backend
cd backend
cp .env.example .env             # populate PORT, CORS_ORIGIN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev                      # serves the application programming interface at http://localhost:4000
```

The frontend exposes the production-build command `npm run build`, the static-preview command `npm run preview`, and the linter `npm run lint`. The backend exposes `npm start` for production execution. A health-check endpoint is available at `GET http://localhost:4000/api/health` and returns a JavaScript Object Notation document of the form `{ "status": "ok", "uptime": <seconds> }`.

## 9. Conformance and Privacy Considerations

The system processes personal and sensitive personal information within the meaning of the Data Privacy Act of 2012 and the implementing rules and regulations of the National Privacy Commission. Access to all clinical records is mediated by PostgreSQL Row-Level Security policies that restrict each query to rows owned by, or explicitly shared with, the requesting user's profile and clinic. The append-only audit log captures every state-mutating action together with the actor, timestamp, and affected row identifier, supporting subsequent forensic review. Cryptographic material — specifically the Supabase service-role key — is held exclusively on the backend and is never transmitted to the browser. The frontend retains only the anonymous public key together with the issued session token; the former is by design safe to embed in client bundles, and the latter is invalidated upon sign-out.

## 10. Acknowledgements

CyMon is developed in collaboration with ClearMind Psychological Services as part of the documentation and operational digitization of its Special Education Program. The user-interface design references are maintained in the `docs/designs/` directory of this repository.
