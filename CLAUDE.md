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
- **HTTP: axios** — single instance in `src/api/services/apiClient.ts` (`withCredentials: true`).
- **Validation/sanitization: `validator`** (+ `@types/validator`). Import each function on its own line from `validator/es/lib/<fn>` (e.g. `import isEmail from "validator/es/lib/isEmail"`) and call it directly, no wrapper functions. Don't import from the package root `"validator"`: it bundles the whole library (+37 KB gzip). This is the one exception to the "group imports" rule.
- **XSS: `dompurify`** — used only inside `src/components/SafeHtml.tsx` to render HTML strings. ESLint (`no-restricted-syntax`) blocks `dangerouslySetInnerHTML` elsewhere.
- Path alias: `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.json`).
- **Toasts: shadcn Sonner** (`src/components/ui/sonner.tsx`, `<Toaster />` in `App`, top-center, 5 s auto-close). Type colours are `--toast-*` tokens in `src/index.css`, mapped to Sonner's `richColors` variables in `sonner.tsx`. Call `toast.success(...)` / `toast.error(...)` from `sonner` directly.
- Not yet installed but planned: Recharts.

## Commands

- `npm run dev` — dev server (http://localhost:5173). With `VITE_USE_MOCK_API=true` in `.env.local` (git-ignored) it uses **demo logins** instead of the BE: admin `admin@tutordesk.dev` / `Demo@1234`, student `S100000001` / `Demo@1234`. Ignored in production builds (`IS_MOCK_API_ENABLED` requires `import.meta.env.DEV`).
- `npm run build` — type-check (`tsc -b`) + production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build
- Add shadcn components: `npx shadcn@latest add <component>` (lands in `src/components/ui/`)

## Code layout

Current:
- `src/components/ui/` — shadcn primitives (`button`, `card`, `input`, `label`, `sonner`, `dropdown-menu`, `sheet`, `avatar`). Generated code; lint rule `react-refresh/only-export-components` is off for this folder.
- `src/components/` — shared app components (`AppLogo`, `PlaceholderPage`, `layout/SidebarNav`, `layout/AdminUserMenu`, `FormField`, `FullPageLoader`, `TextLink`, `SafeHtml` (DOMPurify-sanitized HTML), `AuthFormCard` — card + form + submit button used by login, later change password)
- `src/constants/` — `app.ts` (`APP_NAME`, `DEFAULT_API_BASE_URL`), `userRoles.ts` (`USER_ROLES`), `navigation.ts` (`ADMIN_PAGE_TITLES`, `ADMIN_NAV_ITEMS`), `actionTypes.ts` (`AUTH_SLICE_NAME`, `AUTH_ACTION_TYPES` — Redux action names, not URLs), `validation.ts` (`ALPHA_LOCALE`, `ALPHA_WITH_SPACES_OPTIONS`, `ALPHA_WITH_PUNCTUATION_OPTIONS`, `STUDENT_CODE_PREFIX`, `STUDENT_CODE_DIGIT_COUNT`, `VALIDATION_MESSAGES` — the one file for all validation messages))
- `src/hooks/` — `useForm` (form values + errors + `getFieldProps(fieldName)` for `FormField`), `useLogout` (logout + redirect to login)
- `src/layouts/` — `PublicLayout` (background image for Home, Login, 404, Unauthorized), `AuthLayout` (logo + centred login card), `AdminLayout` (sidebar + top bar with center name and `AdminUserMenu`; sidebar is a `Sheet` drawer on phones)
- `src/pages/public/` — `HomePage` (Login button only), `LoginPage` (one form: admin email or Student ID), `StatusPage` (404 + Unauthorized). On submit: `sanitizeFormValues` → `validateXxxForm` (imported from `utils/authValidation.ts`) → payload built from sanitized values.
- `src/pages/admin/DashboardPage.tsx`, `src/pages/student/StudentHomePage.tsx` — placeholders
- `src/routes/` — `router.tsx` (route config), `paths.ts` (`PATHS`, `getHomePathForRole`, `isPathAllowedForRole`, `getPathAfterLogin`), `ProtectedRoute` (auth + `allowedRoles`), `PublicOnlyRoute` (redirects logged-in users home)
- `src/store/` — Redux store, typed hooks (`useAppDispatch`, `useAppSelector`), `authSlice` (thunks + `selectCurrentUser`, `selectIsSessionChecked`)
- `src/api/` — everything API-related (incl. `mocks/mockAuthService.ts` — DEV-only demo logins, see Commands): `apiEndpoints.ts` (`API_ENDPOINTS`, all §7 endpoints), `errorMessages.ts` (`ERROR_MESSAGES`), `successMessages.ts` (`SUCCESS_MESSAGES`), `services/apiClient.ts` (axios instance `api` + `getErrorMessage`), `services/authService.ts`, `interfaces/auth.ts` (`UserRole`, `User`, `LoginPayload`, `AuthResponse`), `interfaces/common.ts` (`ApiErrorResponse`)
- `src/interfaces/` — non-API interfaces and shared types, one file per feature: `auth.ts` (`LoginFormValues`, `AuthState`, `AuthFormCardProps`), `form.ts` (`FormErrors<T>`, `FormFieldProps`, `FormFieldBindings`, `UseFormResult`), `routes.ts` (`ProtectedRouteProps`, `LoginRedirectState`), `common.ts` (`TextLinkProps`, `StatusPageProps`, `SafeHtmlProps`, `AppLogoProps`, `PlaceholderPageProps`), `layout.ts` (`NavItem`, `SidebarNavProps`). API shapes are in `src/api/interfaces/`.
- `src/utils/format.ts` (`getInitials`), `src/utils/sanitize.ts` (`sanitizeFormValues`), `src/utils/validation.ts` (`hasValidationErrors`, `isValidStudentCode`), `src/utils/authValidation.ts` (`validateLoginForm`), `src/utils/authPayload.ts` (`buildLoginPayload` — turns sanitized form values into the API request), `src/lib/utils.ts` (`cn()`)

### Auth flow
- On load, `App` dispatches `fetchCurrentUser` (`GET /auth/me`) to restore the session from the cookie. `auth.isSessionChecked` starts `false` and becomes `true` when that check finishes (success or failure); guards show a loader until then so a logged-in user isn't sent to `/login` on refresh. No StrictMode guard — the double call in dev is accepted.
- The login thunk sets `auth.user`; logout clears it even if the request fails. There is no signup: the single ADMIN is created by the BE seeder, students by the admin.
- After login: go back to the page they were trying to open (`LoginRedirectState.requestedPath`) if it belongs to their role, otherwise to `getHomePathForRole(role)`.
- New protected pages: add the path to `PATHS`, then add the route under the `/admin` (or `/student`) branch in `router.tsx` using that constant.
- Read the user with `useAppSelector(selectCurrentUser)`, not inline selectors.

Target structure (REQUIREMENTS §9.1): `components/`, `layouts/` (AdminLayout, StudentLayout, PublicLayout), `pages/{public,admin,student}/`, `store/`, `api/` (axios instance, services, endpoints, API interfaces, API messages), `hooks/`, `utils/`, `routes/` (route config + guards).

## Conventions & key rules

### Code quality (mandatory — REQUIREMENTS NFR-10 to NFR-16)
- **Forms: sanitize → validate → build payload** (NFR-16). `sanitizeFormValues(values, ["password", ...])`, then validate with `validator` methods called directly (no manual regexes/checks), then build the payload from sanitized values with inline chaining for field-specific tweaks (`email.toLowerCase()`). Never alter passwords; never HTML-escape input.
- **Name/place fields letters only** (NFR-17), in every form: person name, city, state → `isAlpha(value, ALPHA_LOCALE, ALPHA_WITH_SPACES_OPTIONS)`; center name, branch → `ALPHA_WITH_PUNCTUATION_OPTIONS` (also `.` `'` `-`). Ends trimmed, middle spaces kept. Optional fields only when filled.
- **Arrow functions everywhere** (components, hooks, utils, services, selectors, handlers): `export const HomePage = () => { ... }`, `const handleSubmit = async (...): Promise<void> => { ... }`. No `function` declarations; define before use (no hoisting). Leave generated `src/components/ui/` files alone.
- **Group imports**: one import statement per module with named imports (`import { a, b } from "x"`), not one line per function. Exception: `validator`, which is imported per function to keep the bundle small.
- **Interfaces** (NFR-19): API shapes (models, payloads, responses, API errors) → `src/api/interfaces/<feature>.ts`; everything else (form values, state, hook results, component props) → `src/interfaces/<feature>.ts`. Import with `import type`; no inline interfaces anywhere.
- **API code in `src/api/`** (NFR-20): endpoints, `ERROR_MESSAGES`, `SUCCESS_MESSAGES`, `services/` (`apiClient.ts` + `<feature>Service.ts`), `interfaces/`. New API things go here.
- **Validation messages** (NFR-21): all of them, now and in future, in `VALIDATION_MESSAGES` in `src/constants/validation.ts`.
- **No validation in components** (NFR-18): components keep only core logic (state, handlers, dispatch, navigation, toasts, JSX). Validation goes in `src/utils/<feature>Validation.ts`; form value types in `src/interfaces/`. Components never import `validator` or `VALIDATION_MESSAGES`.
- **XSS** (NFR-22): render text with plain JSX; HTML strings only via `<SafeHtml html={...} />` (DOMPurify). Never `dangerouslySetInnerHTML` directly; never DOMPurify/HTML-escape form input before sending.
- **No thin wrappers** around library methods — call them directly. A util must add real logic and be reused.
- **Write it like a developer would, not like generated code**: plain, direct code; no over-engineering, no filler JSDoc on obvious things, no boilerplate comments.
- **API endpoints**: every URL comes from `API_ENDPOINTS` in `src/api/apiEndpoints.ts` (id paths are functions, e.g. `API_ENDPOINTS.STUDENTS.DETAILS(studentId)`). Never inline a URL string in a service or RTK Query endpoint.
- **Meaningful names only**, named by functionality: `PascalCase` components/types, `camelCase` functions/variables (functions start with a verb, booleans `is/has/can`, handlers `handleX`, props `onX`), `use*` hooks, `UPPER_SNAKE_CASE` constants. Component file name = component name.
- **Type everything**: named props type per component (`XxxProps`), typed function params, return types on every function except React components (components have no `: ReactElement`), all interfaces in `src/interfaces/` (NFR-19). No `any`.
- **Readable for a mid-level dev**: small single-purpose components/functions, early returns, no clever one-liners, comments only for the non-obvious *why*.
- **Reuse**: anything used in 2+ places → shared component (`src/components/`) or hook (`src/hooks/`).
- **Constants**: repeated values (statuses, roles, limits, labels, messages) defined once and exported from `src/constants/` (or a feature `constants.ts`); no duplicated literals.

- Money is handled as **integers in the smallest unit** (paise) — format for display only, never use floats.
- Fee statuses: Paid / Partial / Pending / Overdue. Attendance: Present / Absent. Use a shared `StatusBadge`.
- Every data page needs loading (skeleton), empty, and error states.
- Fully responsive down to 360px — tutors often use phones. Admin sidebar collapses on mobile.
- Role-based redirect after login: ADMIN → `/admin/dashboard`, STUDENT → `/student/home`. FE route guards are UX only — the BE enforces authorization.
- Never store the JWT in localStorage — it's an httpOnly cookie set by the BE.

### Data fetching (list pages: students, batches, fees, attendance, etc.)
- **Use RTK Query** for server data (lists, details, create/update/delete). It lives in `src/api/` (NFR-20), named by what each file is:
  - `src/api/baseApi.ts` — the single `createApi` instance, exported as `baseApi` (no endpoints of its own; declares `tagTypes`). Registered in the store as `[baseApi.reducerPath]: baseApi.reducer` plus `baseApi.middleware`.
  - `src/api/<feature>Api.ts` — one file per feature that calls `baseApi.injectEndpoints(...)`, exported as `<feature>Api` with its generated hooks, e.g. `studentApi.ts` → `studentApi`, `useGetStudentsQuery`, `useCreateStudentMutation`.
  - Use tags (`providesTags`/`invalidatesTags`) so lists refetch after edits. Endpoint URLs come from `API_ENDPOINTS`; request/response types from `src/api/interfaces/<feature>.ts`.
  - Don't use generic names like `apiSlice` or `api.ts`.
- **Base query:** a small custom `axiosBaseQuery` in `src/api/axiosBaseQuery.ts` that reuses the `api` axios instance from `src/api/services/apiClient.ts` (cookie credentials, base URL, `getErrorMessage`) and passes RTK Query's `signal` to axios.
- **Debounce search/filter inputs** with a `useDebouncedValue(value, 300)` hook in `src/hooks/`. Pass the *debounced* value into the query hook so a request fires only after the user stops typing. Add `useThrottledValue` only if a case needs it.
- Use `currentData` (not `data`) when stale results for old args must not show; use `isFetching` for a subtle "updating" state, `isLoading` for the first-load skeleton.
- No redux-saga. Auth stays on `createAsyncThunk` in `authSlice` (it's session state, not cached server data).

## Decisions Log

Record decisions made in conversation here (newest first, with date).

- 2026-11-19 — Dev-only mock auth until the BE exists: `api/mocks/mockAuthService.ts` (demo admin + student), chosen in `authService.ts` via `IS_MOCK_API_ENABLED` (`import.meta.env.DEV && VITE_USE_MOCK_API === "true"`); demo session kept in `sessionStorage` (mock only — real auth still uses the httpOnly cookie). Verified the production bundle contains no demo credentials. Added `AuthService` / `DemoAccount` interfaces.

- 2026-11-19 — Branding & admin shell: `AppLogo` (cap mark + name) on Home, Login and the admin shell; matching `public/favicon.svg`; page title "TutorDesk". Public pages share `PublicLayout` with an original SVG background (`assets/backgrounds/publicBackground.svg`). `AdminLayout` is **sidebar + top bar** as in the spec (user chose this over a top-only navbar): `SidebarNav` from `ADMIN_NAV_ITEMS`, `Sheet` drawer on phones, `AdminUserMenu` (initials avatar → Settings, Log out). Unbuilt sections (Students, Batches, Attendance, Fees, Settings) route to `PlaceholderPage`. Student nav deferred (portal on hold). Added shadcn `dropdown-menu`, `sheet`, `avatar`; removed unused `public/icons.svg`.

- 2026-11-19 — XSS: added `dompurify`, used at **render time only** via `<SafeHtml>` (user chose this over also stripping HTML from form input). ESLint rule blocks `dangerouslySetInnerHTML` outside `SafeHtml.tsx`. Form input sanitizing unchanged (NFR-16). New NFR-22.

- 2026-11-19 — Toast styling: top-center, 5 s auto-close (constants in `constants/app.ts`); custom colours per type (success/error/warning/info/loading) as `--toast-*` tokens in `index.css`, applied via Sonner `richColors` CSS variables in `components/ui/sonner.tsx` (edited the generated file — config only). Light palette is used in dark mode too for now. REQUIREMENTS §5.4 updated.

- 2026-11-19 — **Auth & user management rules** (REQUIREMENTS §3, §4.1 FR-1…FR-9f, §5.1, §6, §7, NFR-5, §9.2, §10, §11): exactly **one ADMIN**, created by an idempotent BE seeder from env vars (`ADMIN_NAME/EMAIL/PASSWORD`), single-admin enforced by a DB unique partial index; **no signup/registration** in FE or API; roles are the enum `ADMIN` | `STUDENT` (`USER_ROLES` values now uppercase); admin logs in with email, students only with Student ID (`S` + 9 digits, start from `STUDENT_CODE_START`, atomic counter, never reused); BE detects the role from the login identifier; UUID primary keys, Student ID separate. FE: deleted `SignupPage`, `/signup` route, `signupUser`, `authService.signup`, `SignupPayload`/`SignupFormValues`, `validateSignupForm`, `buildSignupPayload`, signup endpoint/messages/action type; Home has a Login button only; Login footer now a "forgot details? ask your tutor" hint. Kept the generic validation messages + `isAlpha` options in `constants/validation.ts` for upcoming student/settings forms. Prefix `S` and role names `ADMIN`/`STUDENT` confirmed by user (their examples used `M` and `TUTOR`). **Mirror in `tutordesk-be`.**

- 2026-11-19 — Home/Login/Signup copy made clear for both audiences: Home pitch covers tutors and students; "Sign up" / "Create an account" renamed "Register your center"; students told (Home, Login footer, Signup note) they don't register. Signup only ever creates admin accounts, so a mistaken student signup can't create a student account. REQUIREMENTS §5.1 updated.

- 2026-11-19 — Students may not have an email: they log in with a BE-generated **Student ID** (`studentCode`, `S` + 9 digits, sequential from `S100000001`, unique across centers) + a temporary password the admin shares; forced password change on first login (`mustChangePassword`); admin can reset it. One login form for everyone: "Email or Student ID" (`identifier`) — no role switch. Field named `studentCode` because `studentId` already means the Student DB reference. Spec: §3, FR-9/9a/9b, FR-11, §5.1–5.3, §6 (User.email optional for students, `studentCode`, `mustChangePassword`, `Counter`), §7 (login body, reset-password endpoint). FE: login form/validation/payload updated, `buildSignupPayload` moved to `utils/authPayload.ts`, Home page hint for students. **Mirror in `tutordesk-be`.**

- 2026-11-19 — Simplified `authSlice`: action names now from `AUTH_ACTION_TYPES` / `AUTH_SLICE_NAME` (`constants/actionTypes.ts`); replaced 3-state `sessionStatus` (+ `SESSION_STATUS`, `SessionStatus`) with a boolean `isSessionChecked` (still needed so guards wait for `/auth/me` on refresh); removed the StrictMode-only `condition` guard (dev double call accepted); selectors now use `RootState` (dropped `StateWithAuth`); one plain `addCase` per action instead of a shared helper.

- 2026-11-19 — Extended arrow functions to hooks, utils, services, reducer helpers and handlers — no `function` declarations left in app code (shadcn `ui/` excluded). NFR-12 updated.

- 2026-11-19 — Components written as arrow functions (`export const X = () => {}`) by user preference; converted all 18 app components. Generated shadcn `ui/` files untouched. Inner handlers/helpers unchanged. Recorded in NFR-12.

- 2026-11-19 — Dropped explicit return types (`: ReactElement`) from React components only; all other functions (hooks, utils, services, thunks, handlers) keep declared return types. NFR-11 updated.

- 2026-11-19 — Renamed `LandingPage` → `HomePage` (file, component, router import; REQUIREMENTS §5.1 page name "Home"). Matches `PATHS.home`.

- 2026-11-19 — RTK Query moves to `src/api/` (was planned as `src/store/api.ts`): `baseApi.ts` (`baseApi`), `axiosBaseQuery.ts`, and one `<feature>Api.ts` per feature using `injectEndpoints` (e.g. `studentApi.ts`). No generic names like `apiSlice`. Not built yet — applies when the first list page is built.

- 2026-11-19 — Created `src/api/` for everything API-related (NFR-20): moved `apiEndpoints.ts`, `errorMessages.ts`, `successMessages.ts` from `constants/`; `services/api.ts` → `api/services/apiClient.ts`, `services/authService.ts` → `api/services/authService.ts`; API shapes (`UserRole`, `User`, `LoginPayload`, `SignupPayload`, `AuthResponse`, `ApiErrorResponse`) → `api/interfaces/`. Non-API interfaces stay in `src/interfaces/` (user chose this over moving the whole folder). All validation messages stay in the single `constants/validation.ts` (NFR-21).

- 2026-11-19 — Created `src/interfaces/` with one file per feature (`auth`, `form`, `routes`, `common`, `api`) and moved every interface into it, including component props, hook results and Redux state (NFR-19). Merged and removed `src/types/`. Exceptions: `env.d.ts`, `RootState`/`AppDispatch`.

- 2026-11-19 — Validation moved out of components (NFR-18): `validateLoginForm` / `validateSignupForm` → `src/utils/authValidation.ts`, `LoginFormValues` / `SignupFormValues` → `src/types/auth.ts`, `getPathAfterLogin` → `routes/paths.ts`. Components keep only core logic. Applies to all future forms (`<feature>Validation.ts`).

- 2026-11-19 — Toasts via shadcn Sonner (shadcn's replacement for its deprecated Toast). Login, signup and logout show success/failure toasts using `SUCCESS_MESSAGES` / `ERROR_MESSAGES`; later they'll show the BE message by status code. The inline server-error box (`FormError`) was removed — API errors go to toasts, field errors stay inline. REQUIREMENTS §5.4 updated.

- 2026-11-19 — Center name and branch also allow `.` `'` `-` (`ALPHA_WITH_PUNCTUATION_OPTIONS`, message `LETTERS_AND_PUNCTUATION_ONLY`). Spaces: trimmed at the ends, kept in the middle. Person name, city, state stay letters + spaces. NFR-17 / FR-1 updated. Mirror in `tutordesk-be`.

- 2026-11-19 — Tried grouping validator imports (`import { isEmail, ... } from "validator"`), but it bundles the whole library (JS 514 → 625 KB, +37 KB gzip). Decided to keep one `validator/es/lib/<fn>` import per function to save the size. General convention is still one import statement per module; validator is the exception.

- 2026-11-19 — Name, center name, branch, city and state accept letters and spaces only, in every form (NFR-17, FR-1). Implemented in Signup with `isAlpha` + shared `ALPHA_LOCALE` / `ALPHA_WITH_SPACES_OPTIONS`. Mirror the rule in `tutordesk-be`.

- 2026-11-19 — Removed thin wrappers (`isBlank`, `isValidEmail`, `isPasswordStrong`, `sanitizeText`, `sanitizeEmail`, per-page `sanitizeXxxForm`, `PASSWORD_STRENGTH_RULES`). Validator methods are called directly; one generic `sanitizeFormValues` cleans a whole form; email lower-casing is chained inline in the payload. Rule: no wrappers unless they add logic. Also replaced deprecated `FormEvent` with `SubmitEvent`.

- 2026-11-19 — Added the `validator` package for all validation and sanitization (NFR-16): sanitize → validate → build payload on every form. Replaced the manual email regex and min-length check. Signup password now uses `isStrongPassword` (8+ chars, upper, lower, number, symbol; FR-1 updated) and emails are lower-cased — **BE should apply the same password rule and lower-case emails** (mirror in `tutordesk-be`).
- 2026-11-19 — Deleted unused Vite template assets (`src/assets/react.svg`, `vite.svg`, `hero.png`).

- 2026-11-19 — All API endpoint paths centralised in `src/constants/apiEndpoints.ts` (`API_ENDPOINTS`, pre-filled from §7); added as REQUIREMENTS NFR-15 and a memory.md rule.
- 2026-11-19 — Refactored existing code to NFR-10–15: added `src/constants/`, `useForm` + `useLogout` hooks, `AuthFormCard` + `TextLink` components, auth selectors, explicit types/return types, clearer names (`Role` → `UserRole`, `getHomePath` → `getHomePathForRole`, `authService.me` → `getCurrentUser`, `from` → `requestedPath`, `submitting` → `isSubmitting`). Routes use `PATHS` constants for nested paths too. No behaviour change.

- 2026-11-19 — Mandatory code-quality standards added as REQUIREMENTS NFR-10–14 (naming, explicit types, readability, reusable components, shared exported constants) and `constants/` + `types/` added to §9.1. Summarised under "Code quality" in Conventions; also a standing rule in memory.md.

- 2026-11-18 — Data fetching for list pages: RTK Query + `useDebouncedValue` hook for search/filters (stale responses ignored, caching, built-in loading/error states). Chose this over redux-saga — no extra dependency or generators. Auth stays on thunks. See "Data fetching" under Conventions.
- 2026-11-18 — Signup keeps branch (optional), city, state; added to FR-1 and the `User` schema (§6) in REQUIREMENTS.md. Must be mirrored in `tutordesk-be`.
- 2026-11-18 — Deleted unused `src/App.css` (Vite template leftover).
- 2026-11-18 — BE not built yet. Auth response shape and whether signup auto-logs-in will be decided during BE development; FE assumptions below stand until then.
- 2026-11-18 — Built auth foundation: React Router + protected/public-only routes, Redux auth slice, axios service, Login & Signup pages on shadcn `Card`, Landing, 404/Unauthorized, placeholder admin dashboard + student home. Signup adds a client-only "Confirm password" field; branch marked optional.
- 2026-11-18 — Mandatory: Claude never commits or pushes; user reviews and commits. Created memory.md for standing rules, read every session.
- 2026-11-18 — Signup photo dropped for now (no file uploads in core); may revisit later. REQUIREMENTS §5.1 updated.
- 2026-11-18 — State management: Redux Toolkit (installed). REQUIREMENTS §2 updated.
- 2026-11-18 — UI library: shadcn/ui; daisyUI uninstalled and its `@plugin` removed from `src/index.css`.
- 2026-11-18 — REQUIREMENTS.md is the source of truth: review it before every task and update it on the fly when requirements change.
- 2026-11-18 — Created CLAUDE.md; agreed to keep a running record of project discussions in this file.

## Open Questions

- **Remove the dev mock auth when the BE is ready:** delete `src/api/mocks/`, the `IS_MOCK_API_ENABLED` switch in `authService.ts` / `constants/app.ts`, and `VITE_USE_MOCK_API` (env.d.ts, .env.example, .env.local).

**Deferred until BE development** (BE not built yet):
- Toast messages from the BE — toasts currently use UI constants (`SUCCESS_MESSAGES` / `ERROR_MESSAGES`); see the `TODO` in LoginPage. Once the BE exists, show the API's message based on status code and response message (thunks already pass it via `rejectWithValue(getErrorMessage(...))`), falling back to the UI constants. Agree the success-response message shape with the BE.
- Auth API response shape — FE assumes `{ user: { id, name, email?, role, centerName?, studentCode?, mustChangePassword? } }` for login/me, errors as `{ message }`; login body `{ identifier, password }`. Confirm and add to REQUIREMENTS §7.
- First-login password change (FR-9a) — FE redirect to `/student/change-password` when `user.mustChangePassword` is true (in `getPathAfterLogin` + a guard) is **not built yet**; do it with the student portal milestone, together with the page itself.
