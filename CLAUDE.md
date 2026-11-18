# CLAUDE.md — TutorDesk FE

Guidance for Claude Code when working in this repo. **Keep this file up to date:** whenever a decision, convention, or open question comes up in conversation, record it in the relevant section below (especially the Decisions Log).

## MANDATORY — read first, every session

- **Read [memory.md](memory.md) at the start of every session** and follow its rules.
- **Never `git commit` or `git push`** (nor amend/rebase/merge/tag/reset/PRs). Only make file changes; the user reviews and commits to GitHub themselves.

## Workflow — REQUIREMENTS.md is the source of truth

- **Before every task, review [REQUIREMENTS.md](REQUIREMENTS.md)** for the relevant sections (FRs, pages/routes, data model, API contract, NFRs) and build to match it.
- **Update REQUIREMENTS.md on the fly** whenever a discussion changes or clarifies a requirement — edit the spec itself, don't just note it here. Then log the change in the Decisions Log below.
- If the code and REQUIREMENTS.md disagree, or a request conflicts with it, point it out and agree on which is right before proceeding.
- Changes to the API contract (§7) or data model (§6) must also be made in the `tutordesk-be` copy — remind the user.
- This file holds FE-specific setup, conventions and decisions; requirements live in REQUIREMENTS.md (avoid duplicating them here).

## Project

TutorDesk is a tuition-center dashboard (MERN, portfolio/POC). An admin (tutor) manages students, batches, attendance and fees; students/parents get a read-only portal.

- This repo: **`tutordesk-fe`** — React frontend, deployed to Vercel.
- Sibling repo: **`tutordesk-be`** — Node/Express + MongoDB API, deployed to Render/Railway.
- FE talks to BE only over HTTP via `VITE_API_BASE_URL` (local: `http://localhost:5000/api`), with `withCredentials: true` (JWT lives in an httpOnly cookie).
- Full spec: [REQUIREMENTS.md](REQUIREMENTS.md). The API contract (Section 7) is shared with the BE repo — if it changes, update it in both repos.

## Current scope / priorities

- Build **Admin pages first**. Student/Parent pages (REQUIREMENTS §5.3) are **on hold** until admin pages are done.
- Build order follows REQUIREMENTS §10 milestones: setup → auth & roles → students & batches → attendance → fees → dashboard → student portal → notifications → polish → deploy.
- Out of scope for core: payment gateway, SMS/WhatsApp, file uploads, real-time, multi-tenant.

## Tech stack (actual, as installed)

- **Vite 8 + React 19 + TypeScript 6** (note: REQUIREMENTS shows `.jsx`/`vite.config.js`; the project is TypeScript — use `.tsx`/`.ts`).
- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config`; theme lives in `src/index.css`).
- **shadcn/ui** (style `base-vega`, built on `@base-ui/react`), icons from `lucide-react`, font `@fontsource-variable/inter`.
- **UI library: shadcn/ui only.** daisyUI was removed — don't reintroduce it or mix in other component kits.
- **State: Redux Toolkit** (`@reduxjs/toolkit` + `react-redux`) — slices go in `src/store/`.
- **Routing: React Router v7** (`react-router`, data router via `createBrowserRouter`).
- **HTTP: axios** — single instance in `src/services/api.ts` (`withCredentials: true`).
- Path alias: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.json`).
- Not yet installed but planned: Recharts, toast library.

## Commands

- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` — type-check (`tsc -b`) + production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build
- Add shadcn components: `npx shadcn@latest add <component>` (lands in `src/components/ui/`)

## Code layout

Current:
- `src/components/ui/` — shadcn primitives (`button`, `card`, `input`, `label`). Generated code; lint rule `react-refresh/only-export-components` is off for this folder.
- `src/components/` — shared app components (`FormField`, `FormError`, `FullPageLoader`)
- `src/layouts/` — `AuthLayout` (centered card for login/signup), `AdminLayout` (placeholder top bar + logout; sidebar later)
- `src/pages/public/` — `LandingPage`, `LoginPage`, `SignupPage`, `StatusPage` (404 + Unauthorized)
- `src/pages/admin/DashboardPage.tsx`, `src/pages/student/StudentHomePage.tsx` — placeholders
- `src/routes/` — `router.tsx` (route config), `paths.ts` (`PATHS`, `getHomePath(role)`), `ProtectedRoute` (auth + `allowedRoles`), `PublicOnlyRoute` (redirects logged-in users home)
- `src/store/` — Redux store, typed hooks (`useAppDispatch`, `useAppSelector`), `authSlice`
- `src/services/` — `api.ts` (axios + `getErrorMessage`), `authService.ts`
- `src/types/auth.ts`, `src/utils/validation.ts`, `src/lib/utils.ts` (`cn()`)

### Auth flow
- On load, `App` dispatches `fetchCurrentUser` (`GET /auth/me`) to restore the session from the cookie. `auth.sessionStatus` goes `idle → checking → ready`; guards show a loader until `ready`.
- Login/signup thunks set `auth.user`; logout clears it even if the request fails.
- After login: go back to the page they were trying to open if it belongs to their role, otherwise to `getHomePath(role)`.
- New protected pages: add them under the `/admin` (or `/student`) branch in `router.tsx`, and add the path to `PATHS`.

Target structure (REQUIREMENTS §9.1): `components/`, `layouts/` (AdminLayout, StudentLayout, PublicLayout), `pages/{public,admin,student}/`, `store/`, `services/` (axios instance), `hooks/`, `utils/`, `routes/` (route config + guards).

## Conventions & key rules

- Money is handled as **integers in the smallest unit** (paise) — format for display only, never use floats.
- Fee statuses: Paid / Partial / Pending / Overdue. Attendance: Present / Absent. Use a shared `StatusBadge`.
- Every data page needs loading (skeleton), empty, and error states.
- Fully responsive down to 360px — tutors often use phones. Admin sidebar collapses on mobile.
- Role-based redirect after login: admin → `/admin/dashboard`, student → `/student/home`. Frontend route guards for protected routes.
- Never store the JWT in localStorage — it's an httpOnly cookie set by the BE.

## Decisions Log

Record decisions made in conversation here (newest first, with date).

- 2026-11-18 — Built auth foundation: React Router + protected/public-only routes, Redux auth slice, axios service, Login & Signup pages on shadcn `Card`, Landing, 404/Unauthorized, placeholder admin dashboard + student home. Signup adds a client-only "Confirm password" field; branch marked optional.
- 2026-11-18 — Mandatory: Claude never commits or pushes; user reviews and commits. Created memory.md for standing rules, read every session.
- 2026-11-18 — Signup photo dropped for now (no file uploads in core); may revisit later. REQUIREMENTS §5.1 updated.
- 2026-11-18 — State management: Redux Toolkit (installed). REQUIREMENTS §2 updated.
- 2026-11-18 — UI library: shadcn/ui; daisyUI uninstalled and its `@plugin` removed from `src/index.css`.
- 2026-11-18 — REQUIREMENTS.md is the source of truth: review it before every task and update it on the fly when requirements change.
- 2026-11-18 — Created CLAUDE.md; agreed to keep a running record of project discussions in this file.

## Open Questions

- Signup fields branch, city, state (§5.1) aren't in FR-1 or the `User` schema (§6) — add them to both (and the BE), or drop them from signup? (Currently: city/state required, branch optional.)
- Auth API response shape is assumed to be `{ user: { id, name, email, role, centerName } }` for login/signup/me, with errors as `{ message }` — confirm and add to REQUIREMENTS §7.
- Does `POST /auth/signup` also log the admin in (set the cookie)? FE currently assumes yes and goes straight to the dashboard.
- `src/App.css` is leftover Vite template CSS and no longer imported — OK to delete?
