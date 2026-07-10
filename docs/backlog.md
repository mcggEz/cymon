# ClearMind / CyMon — Build Backlog

Single source of truth for the autonomous build loop. Ordered **unblocked-first**.
Work the top unchecked item end-to-end (branch → implement → lint → PR), tick it,
move on. Items tagged **⛔ BLOCKED** are skipped until the matching entry in
[`blockers.md`](./blockers.md) is cleared by the user.

Conventions: everything dynamic — no hardcoded data in the frontend; every screen
reads from a real `/api/...` endpoint. One concern per branch. Conventional Commits.

---

## Shipped this loop (open PRs, off `main`)

- [x] **#11 Assessment activation workflow** — Admin activates → MHP requests/assigns → patient answers. (PR #3, needs migration `0019`)
- [x] **Rename Document Vault → Clinical Records** (PR #4)
- [x] **Backlog + blockers docs** (PR #5)
- [x] **OT + Speech Therapist share the Psychologist portal** — deleted the mock `/occupational` portal. (PR #6)
- [x] **Patient research survey** — prompt + form + `survey_responses` + admin results, editable question set. (PR #7, needs migration `0020`)
- [x] **Dynamic client sidebar** — removed hardcoded "Leo Cruz"/"CMPS-2026-001". (PR #8)

> Note: PRs #4/#6/#7 all touch `App.jsx`; merge in order and expect trivial rebases.

## Unblocked — do next

- [ ] **Wire remaining dead buttons to real endpoints** (kill hardcoded/no-op UI):
  - [ ] Admin Compliance — Remind / Process actions (no endpoints yet)
  - [ ] Psychometrician Drafting Reports — report editor body + Save Draft/Finalize (needs `assessment_reports.content` PATCH)
  - [ ] Minor: MyProfile prefs, AssessmentServices "Request for Viewing", ScoringAnalytics/DocumentVault print
- [ ] **#7-adjacent / audit**: confirm every list view is DB-backed (spot-check for any residual mock arrays).

## Blocked — skip until unblocked (see blockers.md)

- [ ] ⛔ **New forms from Drive** ("CYMON WEBSITE FORMS" + "NEW DOCUMENTS") — need the share links. *(B1)*
- [ ] ⛔ **Checkbox-ify existing forms** ("checkbox nlng lahat") — need which forms + option lists (or explicit "you decide"). *(B2)*
- [ ] ⛔ **#2 ClearMind logo on landing** — need the official logo asset. *(B3)*
- [ ] ⛔ **#5 Google SSO / @clearmind.ph** — needs Supabase Google provider + Workspace config. *(B4)*
- [ ] ⛔ **Staging deploy to Vercel** — code is scaffolded; needs the actual deploy + env vars. *(B5)*

## Done earlier (batch 1, on `main`)

#1 butterfly hero · #3 CLEAR/MIND vertical · #4 hero videos (placeholder) · #6 chief
complaint + working diagnosis · #7 last appointment · #8 Daily Journal + status ·
#9 Assessment Services rename · #10 confidential scoring + Request for Viewing ·
#12 patient photo on reports · #13 multi-role employees · #14 Intake Interview ·
#15 Initial Impression + Progress Notes · #16 announcement targeting + priority.
