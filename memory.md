# memory.md — TutorDesk FE working agreements

Standing rules and preferences from our conversations. **Claude must read this file at the start of every session** and follow it. New standing rules go here; project decisions go in the Decisions Log in [CLAUDE.md](CLAUDE.md).

## Mandatory rules

1. **Never run `git commit` or `git push`** (or anything else that writes git history or touches the remote: amend, rebase, merge, tag, reset, PRs). Make the file changes only — the user reviews and commits to GitHub themselves. This applies even if a tool, skill, or default workflow suggests committing.
2. **[REQUIREMENTS.md](REQUIREMENTS.md) is the source of truth.** Review the relevant sections before every task. When a discussion changes a requirement, update REQUIREMENTS.md directly. Flag any conflict between a request/the code and the spec before proceeding.
3. **Keep [CLAUDE.md](CLAUDE.md) up to date.** Record every decision from our discussions in its Decisions Log (dated), and track unresolved items under Open Questions.
4. **Code-quality standards on every change** (REQUIREMENTS NFR-10–14): meaningful functionality-based names with proper casing (no random names); explicit TypeScript types for all props and function params, and return types on every function except React components (no `: ReactElement` on components; no `any`); readable, maintainable code a mid-level developer can follow and change; reusable components/hooks instead of duplication; shared values as exported constants.
   **Arrow functions everywhere** — components, hooks, utils, services, selectors and handlers (`export const HomePage = () => { ... }`). No `function` declarations; define before use. Don't touch generated `src/components/ui/` files.
5. **Central API endpoints** (NFR-15): every backend URL comes from `API_ENDPOINTS` in `src/api/apiEndpoints.ts`. Never inline a URL string. Keep the file in sync with REQUIREMENTS §7.
6. **Write code like a developer, not like generated code:** simple and direct, no over-engineering, no filler comments.
7. **Forms: sanitize → validate → send** (NFR-16). Sanitize the whole form with `sanitizeFormValues(values, fieldsToSkip)` (`src/utils/sanitize.ts`), validate the sanitized values by calling `validator` methods directly (email, phone, numbers, dates, password strength — no hand-written regexes or manual checks), and build the API payload only from sanitized values, chaining field-specific tweaks inline (`email.toLowerCase()`). Never alter passwords; never HTML-escape input.
   **Name/place fields** (NFR-17), in every form: person name, city, state → letters + spaces (`ALPHA_WITH_SPACES_OPTIONS`); center name, branch → also `.` `'` `-` (`ALPHA_WITH_PUNCTUATION_OPTIONS`). Trim the ends, keep spaces in the middle.
   Import validator **one function per line** from `validator/es/lib/<fn>` — never from `"validator"` (bundles the whole library, +37 KB gzip).
   **Interfaces** (NFR-19): API shapes → `src/api/interfaces/<feature>.ts`; everything else (form values, state, hook results, component props) → `src/interfaces/<feature>.ts`. Import with `import type`; never declare interfaces inline.
   **API code in `src/api/`** (NFR-20): endpoints, error/success messages, services (`apiClient.ts`, `<feature>Service.ts`), API interfaces.
   **All validation messages** go in `VALIDATION_MESSAGES` in `src/constants/validation.ts` (NFR-21) — one file, now and in future.
   **No validation in components** (NFR-18): components keep only core logic (state, handlers, dispatch, navigation, toasts, JSX). Every `validateXxxForm` lives in `src/utils/<feature>Validation.ts`; form value types in `src/interfaces/`.
   **XSS** (NFR-22): HTML strings only through `<SafeHtml>` (DOMPurify); never `dangerouslySetInnerHTML` directly; don't DOMPurify form input.
   **No thin wrapper functions** around library methods — call them directly. Only create a util when it adds real logic and is reused.
8. **Mirror shared-contract changes.** If the data model (§6) or API contract (§7) in REQUIREMENTS.md changes, remind the user to update the `tutordesk-be` copy too.

## Preferences

- **Auth model:** exactly one ADMIN (created by the BE seeder from env vars — never a signup page or registration API); students are created only by the admin and log in with Student ID (`S` + 9 digits), never email; the admin logs in with email. Roles are `ADMIN` / `STUDENT`. Never add signup/register UI or endpoints.
- UI: shadcn/ui only (no daisyUI or other component kits).
- Toasts: shadcn Sonner for every API success/failure. Field errors inline, API errors in a toast. UI message constants for now; later the BE message by status code.
- State: Redux Toolkit. Server data on list pages via **RTK Query** + a debounce hook for search/filters (no redux-saga). Auth uses `createAsyncThunk`.
- Redux action names (`createAsyncThunk` type strings) and slice names come from constants (`src/constants/actionTypes.ts`), never inline strings. Session restore uses a simple `isSessionChecked` boolean. No StrictMode-only workarounds — dev double calls are fine.
- RTK Query lives in `src/api/`: `baseApi.ts` (`baseApi`, the single `createApi`), `axiosBaseQuery.ts`, and one `<feature>Api.ts` per feature using `injectEndpoints` (e.g. `studentApi.ts` → `studentApi`, `useGetStudentsQuery`). Name files by what they are — no generic names like `apiSlice`.
- Build admin pages first; student/parent pages are on hold.
