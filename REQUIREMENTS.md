# TutorDesk — Requirements Document

> Tuition Center Dashboard (MERN). A portfolio / POC project demonstrating auth, password hashing, role-based access, CRUD, and medium-complexity business logic.

### Repositories
The project is split into **two separate repositories**:

| Repo | Purpose | Deploy target |
|---|---|---|
| `tutordesk-fe` (TutorDesk FE) | React frontend | Vercel |
| `tutordesk-be` (TutorDesk BE) | Node/Express REST API | Render / Railway |

- The FE talks to the BE only over HTTP via a configurable base URL (`VITE_API_BASE_URL`).
- Each repo has its own `package.json`, `.env.example`, README and a copy of this `REQUIREMENTS.md`.
- The API contract in Section 7 is the shared agreement between the two repos — update it in both when it changes.

---

## 1. Overview

TutorDesk helps a single tutor or a small tuition center manage **students, batches, attendance and fees** from one dashboard. Students/parents get a read-only portal to view their own attendance and fee status.

### Goals
- Demonstrate full-stack MERN skills: auth, security, CRUD, aggregations, role-based UI.
- Keep dependencies minimal — no paid services or third-party APIs in the core version.
- Be deployable and demo-able (demo login on the landing page).

### Out of scope (core version)
- Payment gateway (payments are recorded manually by the admin)
- SMS / WhatsApp notifications
- File uploads
- Real-time features (Socket.io)
- Multi-center / multi-tenant support

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend (`tutordesk-fe`) | React (Vite), React Router, Redux Toolkit (RTK Query for server data), Tailwind CSS, shadcn/ui |
| Backend (`tutordesk-be`) | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | bcrypt (password hashing), jsonwebtoken (JWT in httpOnly cookie) |
| Validation | Zod or Joi (server), inline form validation (client) |
| Charts | Recharts (or Chart.js) |
| Optional (later) | Nodemailer (email reminders), node-cron (scheduled reminders), PDF receipts |

---

## 3. User Roles

Only two roles exist, stored as a constrained enum: **`ADMIN`** and **`STUDENT`** (`USER_ROLES` in the FE). "Tutor" is just the UI word for the admin.

| Role | Description | Access |
|---|---|---|
| **ADMIN (Tutor)** | The tuition center owner. **Exactly one admin account exists**, created by a BE database seeder — there is no signup or registration. Logs in with **email + password**. | Admin Portal only: full access to all data and pages; the only role that can create and manage student accounts. |
| **STUDENT** | Created by the admin from the Admin Portal; students cannot register. Logs in with **Student ID + password** (never email); must change the temporary password on first login. | Student Portal only: read-only access to their own attendance, fees, batches and notifications; can change own password. Cannot create, modify or delete any user or the admin. |

---

## 4. Functional Requirements

### 4.1 Authentication & User Management

**Home & login**
- FR-1: Admin and students share the same Home page (`/`) and the same Login page (`/login`). The Home page has a **Login** button only — **no public signup or registration** anywhere in the FE, and no public registration API.
- FR-2: Users must log in before reaching their portal. The login request is `{ identifier, password }` and the **BE works out who is logging in from the identifier**: an email (contains `@`) is checked against the ADMIN account only; a Student ID (`S` + 9 digits) is checked against STUDENT accounts only. A student's email (if stored) can never be used to log in.
- FR-3: Login issues a JWT stored in an **httpOnly cookie**.
- FR-4: Logout clears the cookie.
- FR-5: After login, users are redirected based on role (ADMIN → `/admin/dashboard`, STUDENT → `/student/home`).
- FR-6: Authorization is enforced by the **backend** — auth + role middleware on every protected route, so only ADMIN reaches admin APIs and only STUDENT reaches student APIs. FE route guards (`ProtectedRoute`) are for UX only.
- FR-7: Students can only access their own records (ownership check in middleware/queries) and have no permission to create, modify or delete users.
- FR-8: Change password requires the current password.

**Admin account (seeded, single admin)**
- FR-9: The one admin account is created by a **BE database seeder**, never from the FE.
  - Credentials (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) are read from **environment variables** during seeding. Production credentials are never hard-coded or committed to Git (only placeholders in `.env.example`). Center details (center name, branch, city, state, fee due day) may come from optional env vars and are editable later in Settings.
  - The password is hashed with **bcrypt** before storing.
  - The seeder is **idempotent**: it checks whether an admin already exists and does nothing if one does, so running it again never creates a duplicate.
  - The **database enforces the single-admin rule** (e.g. a unique partial index on `role` where `role = 'ADMIN'`). Admin email is unique.

**Student accounts (created by the admin)**
- FR-9a: Students cannot register or create their own accounts. Only the authenticated admin can create them, from the Admin Portal (Students page), by entering the required student details.
- FR-9b: The BE generates a unique **Student ID** (`studentCode`): `S` + a 9-digit sequential number, e.g. `S100000001`, `S100000002`, `S100000003`.
  - The starting number is configured at system setup (env var `STUDENT_CODE_START`, default `100000001`; the seeder uses it to initialise the counter).
  - The next number is taken **atomically** (a single `$inc` on a counter document), so concurrent requests never get the same ID.
  - Student IDs are unique and **never reused**, even after a student is deleted.
- FR-9c: The BE also generates a random temporary password, hashed with bcrypt before storing. The Student ID and temporary password are shown to the admin **once** (with copy buttons) to share with the student/parent — no SMS/email.
- FR-9d: A student must change the temporary password on first login (`mustChangePassword`). Until they do, they are redirected to `/student/change-password` and cannot use other student pages.
- FR-9e: The admin can look up a student's Student ID and reset their password from the student detail page; this issues a new temporary password and sets `mustChangePassword` again. No self-service "forgot password" for now.

**Data rules**
- FR-9f: Every account uses an **internal UUID as its primary key**. The externally visible Student ID is a separate field and is never used as a key or in URLs. Admin email and Student ID are both unique. Only bcrypt hashes are stored — plain passwords are never stored, logged or returned.

### 4.2 Students (Admin)
- FR-10: Create, read, update, delete students.
- FR-11: Student fields: name, email (optional — many students have none), phone, parent name, parent phone, class/grade, monthly fee, join date, active status.
- FR-12: List with search (name/phone), filters (batch, fee status), and pagination.
- FR-13: Deleting a student requires confirmation (prefer soft delete / mark inactive).

### 4.3 Batches (Admin)
- FR-14: Create, read, update, delete batches.
- FR-15: Batch fields: name, subject, days of week, start time, end time, assigned students.
- FR-16: Add/remove students to/from a batch.
- FR-17: **Batch clash check** — prevent assigning a student to two batches whose schedules overlap (same day and overlapping time).

### 4.4 Attendance (Admin)
- FR-18: Select a batch and a date → load all students in that batch.
- FR-19: Mark each student Present / Absent, with a "Mark all present" shortcut.
- FR-20: Saving is a **bulk upsert** (one attendance record per batch per date; re-saving updates it).
- FR-21: Past dates can be edited; show "last updated" timestamp.
- FR-22: Future dates cannot be marked.

### 4.5 Fees (Admin)
- FR-23: Select a month → show each active student with amount due, amount paid, and status.
- FR-24: Record a payment: student, month, amount, payment date, mode (cash / UPI / bank transfer), note.
- FR-25: Multiple partial payments per month are allowed.
- FR-26: Fee status per student per month:
  - **Paid** — total paid ≥ amount due
  - **Partial** — 0 < total paid < amount due
  - **Pending** — nothing paid, due date not yet passed
  - **Overdue** — not fully paid and due date has passed
- FR-27: Fee due day is configurable in Settings (e.g. 10th of each month).
- FR-28: **Pro-rated first month** — if a student joins mid-month, the first month's fee is pro-rated by remaining days.
- FR-29: Money is stored as **integers in the smallest unit** (paise/fils), never as floats.

### 4.6 Attendance & Fee Logic / Reports
- FR-30: Attendance % per student = present sessions ÷ total marked sessions.
- FR-31: Attendance % per batch.
- FR-32: "Low attendance" list — students below 75%.
- FR-33: Dashboard stats computed with MongoDB aggregation pipelines.

### 4.7 Notifications & Reminders
Implemented in levels; Level 1 is part of core, others are optional.

- **Level 1 — In-app alerts (core, no new dependencies)**
  - FR-34: Notification collection; student sees a notification bell with unread count.
  - FR-35: Auto-create notification "Fee for <Month> is due by <date>" / "Fee for <Month> is overdue".
  - FR-36: Admin dashboard shows overdue badge and defaulters list.
- **Level 2 — Manual email reminders (optional, Nodemailer)**
  - FR-37: "Send reminder" button per pending student and "Remind all overdue".
  - FR-38: Store `lastRemindedAt`; block more than one reminder per student per day.
- **Level 3 — Scheduled reminders (optional, node-cron)**
  - FR-39: Daily job sends reminders at 3 days before due date, on due date, and 3 days after.
  - FR-40: Reminder log with unique index (student, month, type) to prevent duplicates.
  - FR-41: Stop reminders as soon as the fee is fully paid.
  - Note: free hosting tiers may sleep; use an external pinger or hosted cron trigger.

### 4.8 Settings (Admin)
- FR-42: Update profile (name, email), change password.
- FR-43: Update center name and fee due day.

---

## 5. Pages & UI

### 5.1 Public pages
All public pages (Home, Login, 404, Unauthorized) share `PublicLayout`: a light, clean background image (`src/assets/backgrounds/publicBackground.svg` — soft gradient, blurred colour shapes, faint dot grid that fades out behind the content) and the TutorDesk logo.
| # | Page | Route | Contents |
|---|---|---|---|
| 1 | Home | `/` | Shared by the admin and students: app name, a pitch that speaks to both ("Tutors manage students, batches, attendance and fees. Students check attendance, fee status and batch timings."), a **Login** button only (no signup/registration), and a note that students log in with the Student ID from their tutor. |
| 2 | Login | `/login` | One form for both roles: "Email or Student ID" + password (the BE works out the role from the identifier, FR-2), role-based redirect (FR-5). No role switch, no signup link. Footer: "Students: forgot your Student ID or password? Ask your tutor." |
| 3 | 404 / Unauthorized | `*`, `/unauthorized` | Friendly message with link home |

### 5.2 Admin pages
**Layout (`AdminLayout`):** left sidebar with the logo and links (Dashboard, Students, Batches, Attendance, Fees, Settings — `ADMIN_NAV_ITEMS`, active link highlighted); top bar with the center name and a profile menu (avatar initials + name → Settings, Log out); notification bell added in the notifications milestone. On phones the sidebar becomes a slide-out drawer opened from a menu button in the top bar. Sections not built yet show a "Coming soon" placeholder page until their milestone.

| # | Page | Route | Contents |
|---|---|---|---|
| 5 | Dashboard | `/admin/dashboard` | Stat cards (total students, active batches, collected this month, pending dues); today's batches with "Mark attendance"; overdue fees (top 5 + View all); charts: monthly collection (bar), attendance % by batch |
| 6 | Students list | `/admin/students` | Table (name, class, batch, fee, status badge, joined date, subject, payment status, send payment pending reminder - to send notification to student/parent), search, filters, pagination; Add/Edit modal or drawer (after Add, a one-time dialog shows the generated Student ID + temporary password with copy buttons, FR-9); delete confirm |
| 7 | Student detail | `/admin/students/:id` | Basic Profile info incl. Student ID (`studentCode`) and a "Reset password" action (FR-9e); tabs: Attendance (calendar + %), Fees (payment history), Batches |
| 8 | Batches list | `/admin/batches` | Cards (name, subject, schedule, student count); Add/Edit/Delete |
| 9 | Batch detail | `/admin/batches/:id` | Schedule, assigned students, add/remove students (clash warning), batch attendance % |
| 10 | Attendance | `/admin/attendance` | Batch + date picker → student list with Present/Absent toggles; "Mark all present"; Save; last updated note |
| 11 | Fees | `/admin/fees` | Month picker → table (student, due, paid, status); "Record payment" modal; status filter; "Send reminder" (if Level 2) |
| 12 | Settings | `/admin/settings` | Profile, change password, center name, center branch, fee due day |

### 5.3 Student / Parent pages (HOLD for now until Admin pages are done)
**Layout:** simple top nav (Home, Attendance, Fees, Profile) + notification bell.

| # | Page | Route | Contents |
|---|---|---|---|
| 13 | Home | `/student/home` | Batch timings, attendance %, current month fee status, notifications |
| 13a | Change password (first login) | `/student/change-password` | Shown right after login when `mustChangePassword` is true (FR-9d): current (temporary) password, new password, confirm. Student can't open other student pages until it's done. Built with the student portal. |
| 14 | My Attendance | `/student/attendance` | Calendar with present/absent colours, low-attendance warning |
| 15 | My Fees | `/student/fees` | Month-wise paid/pending list and payment history |
| 16 | Profile | `/student/profile` | View details, change password |

### 5.4 Shared UI components
- Reusable `DataTable` (search, filter, pagination)
- `Modal`, `ConfirmDialog`, `Drawer`, `card`, `sidebar`
- `StatusBadge` (Paid / Partial / Pending / Overdue / Present / Absent)
- `StatCard`, chart wrappers
- `AppLogo` (graduation-cap mark + "TutorDesk"; used on Home, Login, admin sidebar/top bar; same mark as `public/favicon.svg`), `PlaceholderPage` ("Coming soon" for admin sections not built yet)
- Toast notifications (success / error) using **shadcn Sonner** (`toast.success` / `toast.error` from `sonner`; `<Toaster />` is mounted once in `App`). Every API action (login, logout, create/update/delete) shows a success or failure toast. Field validation errors stay inline under the field; API errors go in a toast.
  - **Look:** top-center, auto-close after 5 s (`TOAST_POSITION`, `TOAST_DURATION_MS` in `src/constants/app.ts`). Colours per type (background / text+icon / border): success `#ECFDF3` / `#067647` / `#ABEFC6`; error `#FEF3F2` / `#B42318` / `#FECDCA`; warning `#FFFAEB` / `#B54708` / `#FEDF89`; info `#EFF8FF` / `#175CD3` / `#B2DDFF`; loading `#F8FAFC` / `#475569` / `#E2E8F0`. Defined as `--toast-*` tokens in `src/index.css` and applied through Sonner's `richColors` variables in `src/components/ui/sonner.tsx`.
  - **For now:** messages come from the UI constants `SUCCESS_MESSAGES` / `ERROR_MESSAGES` (`src/api/successMessages.ts`, `src/api/errorMessages.ts`).
  - **Later (once the BE is built):** show the message returned by the API, chosen by status code and response message, falling back to the UI constants.
- Skeleton loaders and empty states ("No students yet — add your first one")
- Inline form validation errors
- Fully responsive (tutors often use phones)

---

## 6. Data Model (Mongoose Schemas)

```text
User
  _id: UUID (internal primary key — never shown to users or used as the Student ID),
  name, role: 'ADMIN' | 'STUDENT' (constrained enum),
  email (ADMIN: required, unique, used to log in; STUDENT: optional contact info, never used to log in),
  passwordHash (bcrypt only),
  centerName, branch (optional), city, state, feeDueDay (default 10) — ADMIN only,
  studentId (ref Student, STUDENT only),
  studentCode (STUDENT only, unique + sparse): login "Student ID", S + 9 digits (e.g. S100000001), generated by the BE, never reused,
  mustChangePassword (boolean, default false; true for new students and after an admin password reset),
  createdAt, updatedAt
  -- single admin enforced in the DB: unique partial index on role where role = 'ADMIN'

Student
  name, email, phone, parentName, parentPhone, grade,
  monthlyFee (integer, smallest unit), joinDate, isActive,
  adminId (ref User), createdAt, updatedAt

Batch
  name, subject, days: ['Mon','Wed','Fri'], startTime: 'HH:mm', endTime: 'HH:mm',
  students: [ref Student], adminId (ref User), createdAt, updatedAt

Attendance
  batchId (ref Batch), date (Date, day precision),
  records: [{ studentId (ref Student), status: 'present' | 'absent' }],
  markedBy (ref User), createdAt, updatedAt
  -- unique index: (batchId, date)

Payment
  studentId (ref Student), month: 'YYYY-MM', amount (integer),
  paidOn (Date), mode: 'cash' | 'upi' | 'bank', note,
  recordedBy (ref User), createdAt

Notification
  userId (ref User), type: 'fee_due' | 'fee_overdue' | 'general',
  message, isRead (default false), createdAt

Counter
  name (unique, e.g. 'studentCode'), value (number)
  -- used to generate Student IDs: S + next value. Initialised by the seeder from STUDENT_CODE_START (default 100000001); incremented with a single atomic $inc; values are never reused

ReminderLog (optional, Level 2/3)
  studentId, month, type: 'manual' | 'before_due' | 'on_due' | 'after_due', sentAt
  -- unique index: (studentId, month, type) for scheduled types
```

---

## 7. API Endpoints (draft)

```text
Auth
  (no signup / registration endpoint — the admin is created by the BE seeder, students by the admin via POST /api/students)
  POST   /api/auth/login               body: { identifier, password } — identifier is the admin email (contains "@", matched against the ADMIN account only) or a Student ID like S100000001 (matched against STUDENT accounts only)
  POST   /api/auth/logout
  GET    /api/auth/me
  PATCH  /api/auth/change-password

Students (admin)
  GET    /api/students?search=&batch=&center=&city=&status=&page=&limit=
  POST   /api/students
  GET    /api/students/:id
  PATCH  /api/students/:id
  DELETE /api/students/:id
  POST   /api/students/:id/reset-password   (admin: new temporary password, returned once; sets mustChangePassword)

Batches (admin)
  GET    /api/batches
  POST   /api/batches
  GET    /api/batches/:id
  PATCH  /api/batches/:id
  DELETE /api/batches/:id
  POST   /api/batches/:id/students        (add, with clash check)
  DELETE /api/batches/:id/students/:sid   (remove)

Attendance (admin)
  GET    /api/attendance?batchId=&date=
  PUT    /api/attendance                  (bulk upsert)

Fees (admin)
  GET    /api/fees?month=YYYY-MM&status=
  POST   /api/payments
  GET    /api/students/:id/payments

Dashboard (admin)
  GET    /api/dashboard/stats

Student portal
  GET    /api/me/summary
  GET    /api/me/attendance
  GET    /api/me/fees

Notifications
  GET    /api/notifications
  PATCH  /api/notifications/:id/read
  PATCH  /api/notifications/read-all

Settings (admin)
  PATCH  /api/settings
```

---

## 8. Non-Functional Requirements
- NFR-1: Input validation on every write endpoint (Zod/Joi).
- NFR-2: Centralized error-handling middleware with consistent error response shape.
- NFR-3: Rate limiting on auth routes (e.g. express-rate-limit).
- NFR-4: CORS configured for the client origin with credentials.
- NFR-5: Environment variables via `.env` (never committed); provide `.env.example` with placeholders only. BE seeder env vars: `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `STUDENT_CODE_START` (default `100000001`), plus optional center details — production credentials are never hard-coded or committed.
- NFR-6: Passwords and hashes never returned in API responses.
- NFR-7: Responsive UI, works on mobile widths (≥ 360px).
- NFR-8: Loading, empty and error states on every data page.
- NFR-9: Basic tests (Jest + Supertest) for auth, fee status logic, and clash check.
- NFR-10: **Naming conventions.** Every name says what the thing does or holds — no random, vague or abbreviated names (`data`, `temp`, `x`, `handle2`, `obj`).
  - Components, types, interfaces: `PascalCase` (`StudentTable`, `FeeStatusBadge`, `StudentFormValues`). Component file name matches the component (`StudentTable.tsx`).
  - Functions, variables, hooks: `camelCase`; functions start with a verb (`fetchStudents`, `formatCurrency`, `calculateFeeStatus`); hooks start with `use` (`useDebouncedValue`); booleans read as yes/no (`isLoading`, `hasDues`, `canEdit`); event handlers `handleX` inside a component, `onX` as props.
  - Constants: `UPPER_SNAKE_CASE` (`MIN_PASSWORD_LENGTH`, `FEE_STATUS`, `DEFAULT_PAGE_SIZE`).
  - Non-component files and folders: `camelCase` (`authService.ts`, `validation.ts`).
- NFR-11: **Explicit TypeScript types everywhere.** Every component's props have a named type/interface (`StudentTableProps`); every function's parameters are typed, and every non-component function (utils, hooks, services, thunks, selectors, handlers) declares its return type. **React components don't declare a return type** (no `: ReactElement`) — TypeScript infers it; all interfaces and shared types live in `src/interfaces/` (NFR-19). No `any` — use `unknown` and narrow it if the type is truly unknown.
- NFR-12: **Readable, maintainable code.** A mid-level developer should understand a file at a glance and change it safely: small focused components and functions, one responsibility each, early returns over deep nesting, no clever one-liners, short comments only where the *why* isn't obvious.
  - **Arrow functions everywhere:** components, hooks, utils, services, selectors, reducer helpers and event handlers are all `const` arrow functions — e.g. `export const HomePage = () => { ... }`, `export const useLogout = (): (() => Promise<void>) => { ... }`, `const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => { ... }`. No `function` declarations. Define a function before it is used (arrow functions are not hoisted). Generated shadcn files in `src/components/ui/` are left as-is.
- NFR-13: **Reusable components.** Any UI or logic used (or clearly going to be used) in more than one place becomes a shared component in `src/components/` or a hook in `src/hooks/` — no copy-pasted markup or logic across pages.
- NFR-14: **Shared constants.** Values used in more than one place (statuses, roles, routes, limits, labels, query keys, messages, Redux slice names and action types — `AUTH_ACTION_TYPES` in `src/constants/actionTypes.ts`) are defined once and exported — from `src/constants/` (or a feature-level `constants.ts`) — never hard-coded as string/number literals in multiple files.
- NFR-15: **Central API endpoints file.** Every backend endpoint path lives in one place — `API_ENDPOINTS` in `src/api/apiEndpoints.ts`, grouped by feature (`API_ENDPOINTS.AUTH.LOGIN`, `API_ENDPOINTS.STUDENTS.DETAILS(studentId)`). Paths with an id are functions that take that id. Services and RTK Query endpoints must use these constants — never write a URL string inline. When §7 changes, update this file too.
- NFR-16: **Sanitize, then validate, then send.** Every form goes through three steps before anything reaches the API:
  1. **Sanitize** the whole form with the single util `sanitizeFormValues(values, fieldsToSkip)` in `src/utils/sanitize.ts` — it strips control characters and trims every field. Skip passwords (never altered). Don't HTML-escape input — React escapes on render, and escaping would corrupt saved data.
  2. **Validate the sanitized values** by calling `validator` methods directly in the form's `validateXxxForm` (which lives in `src/utils/<feature>Validation.ts`, see NFR-18) (`isEmpty`, `isEmail`, `isStrongPassword`, `isMobilePhone(value, "en-IN")`, `isInt`/`isNumeric`, `isDate`, …) — no hand-written regexes or manual checks.
  3. **Build the payload from the sanitized values only**, applying field-specific changes inline with method chaining (e.g. `email: values.email.toLowerCase()`) and dropping client-only fields (e.g. `confirmPassword`).
  - **No thin wrapper functions** around library methods. Only add a util when it actually does something extra (combines steps, transforms data) and is reused.
  - The backend validates again (NFR-1) — FE validation is for UX and clean data, not security.
- NFR-17: **Name and place fields: letters only, no digits.** Applies in every form (student add/edit, profile/settings, batch, etc.). Leading/trailing spaces are trimmed by `sanitizeFormValues`; spaces in the middle are kept as typed. Validate with `isAlpha` and the shared constants in `src/constants/validation.ts`:
  - **Person name, city, state** — letters and spaces: `isAlpha(value, ALPHA_LOCALE, ALPHA_WITH_SPACES_OPTIONS)`, message `VALIDATION_MESSAGES.LETTERS_ONLY`.
  - **Center name, branch** — letters, spaces and `.` `'` `-` (e.g. "St. Mary's Academy", "Navi-Mumbai"): `isAlpha(value, ALPHA_LOCALE, ALPHA_WITH_PUNCTUATION_OPTIONS)`, message `VALIDATION_MESSAGES.LETTERS_AND_PUNCTUATION_ONLY`.
  - Optional fields are checked only when filled in. The backend should apply the same rules.
- NFR-18: **No validation logic in components.** Pages and components keep only their core logic: state, event handlers, dispatching actions, navigation, toasts and JSX. All form validation lives in `src/utils/<feature>Validation.ts` (e.g. `authValidation.ts` → `validateLoginForm`; later `studentValidation.ts`, `batchValidation.ts`). Components just call `validateXxxForm(sanitizedValues)` and never import `validator` or `VALIDATION_MESSAGES` themselves. Form value types (`XxxFormValues`) live in `src/interfaces/<feature>.ts` (NFR-19). Other non-UI helpers go to the matching module too (e.g. route helpers in `routes/paths.ts`).
- NFR-19: **Interfaces live in dedicated folders, one file per feature.** No interface is declared inline in a component, hook, slice or service; everything is imported with `import type`.
  - **API shapes** (models returned by the API, request payloads, responses, API errors) → `src/api/interfaces/<feature>.ts`. Current: `auth.ts` (`UserRole`, `User`, `LoginPayload`, `AuthResponse`), `common.ts` (`ApiErrorResponse`).
  - **Everything else** (form values, Redux state, hook results, component props, route state) → `src/interfaces/<feature>.ts`. Current: `auth.ts` (`LoginFormValues`, `AuthState`, `AuthFormCardProps`), `form.ts` (`FormErrors`, `FormFieldProps`, `FormFieldBindings`, `UseFormResult`), `routes.ts` (`ProtectedRouteProps`, `LoginRedirectState`), `common.ts` (`TextLinkProps`, `StatusPageProps`).
  - New features get a file in each folder as needed (`student.ts`, `batch.ts`, `fee.ts`, `attendance.ts`, …). Exceptions: `src/env.d.ts` (Vite env typing) and `RootState` / `AppDispatch`, derived from the store in `src/store/index.ts`.
- NFR-20: **All API-related code lives in `src/api/`.** `apiEndpoints.ts` (`API_ENDPOINTS`), `errorMessages.ts` (`ERROR_MESSAGES`), `successMessages.ts` (`SUCCESS_MESSAGES`), `services/` (`apiClient.ts` — the single axios instance + `getErrorMessage`; one `<feature>Service.ts` per feature, e.g. `authService.ts`) and `interfaces/` (API shapes, see NFR-19). RTK Query also lives here: `baseApi.ts` (the single `createApi`, exported as `baseApi`), `axiosBaseQuery.ts`, and one `<feature>Api.ts` per feature that injects its endpoints (e.g. `studentApi.ts` → `studentApi`, `useGetStudentsQuery`) — no generic names like `apiSlice`. New API endpoints, services, API messages and API types go here — not in `constants/`, `services/` or `interfaces/` at the root.
- NFR-21: **One file for validation messages.** Every form validation message, now and in future, goes in `VALIDATION_MESSAGES` in `src/constants/validation.ts` (along with validation options such as `ALPHA_WITH_SPACES_OPTIONS`). Don't create per-feature message files or hard-code messages in validation utils.
- NFR-22: **XSS protection.** Text is rendered with normal JSX (`{value}`) — React escapes it, so form input is not HTML-escaped or run through DOMPurify before sending (that would corrupt values like "a < b" and isn't a security boundary; the BE validates too). Any HTML string from data (e.g. rich-text notes/notifications) must be rendered only through `<SafeHtml html={...} />` (`src/components/SafeHtml.tsx`), which cleans it with **DOMPurify**. ESLint blocks `dangerouslySetInnerHTML` everywhere except that component.

---

## 9. Suggested Folder Structure

### 9.1 `tutordesk-fe` (TutorDesk FE)

```text
tutordesk-fe/
  public/
  src/
    components/      # shared UI (DataTable, Modal, StatusBadge, ...)
    layouts/         # AdminLayout, StudentLayout, PublicLayout
    pages/
      public/
      admin/
      student/
    store/           # Redux slices (auth, ...)
    api/             # everything API-related (NFR-20): apiEndpoints.ts, errorMessages.ts, successMessages.ts, services/ (apiClient.ts axios instance with baseURL from VITE_API_BASE_URL + withCredentials, authService.ts, ...), interfaces/ (API request/response shapes)
    hooks/
    utils/
    constants/       # shared exported constants (apiEndpoints, statuses, roles, limits, messages)
    interfaces/      # non-API interfaces + shared types, one file per feature (auth.ts, form.ts, routes.ts, common.ts, ...)
    routes/          # route config + guards
    App.jsx
    main.jsx
  .env.example       # VITE_API_BASE_URL=http://localhost:5000/api
  CLAUDE.md
  REQUIREMENTS.md
  README.md
  package.json
  vite.config.js
```

### 9.2 `tutordesk-be` (TutorDesk BE)

```text
tutordesk-be/
  src/
    config/          # db, env
    models/
    routes/
    controllers/
    middleware/      # auth, role, ownership, validate, error
    services/        # fee status, attendance %, clash check
    seeders/         # adminSeeder (single admin from env, idempotent) + student-code counter init (FR-9, FR-9b)
    utils/
    app.js
    server.js
  tests/
  .env.example       # PORT, MONGODB_URI, JWT_SECRET, CLIENT_URL, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, STUDENT_CODE_START (placeholders only)
  CLAUDE.md
  REQUIREMENTS.md
  README.md
  package.json
```

### 9.3 Cross-repo notes
- **CORS:** BE allows `CLIENT_URL` origin with `credentials: true`.
- **Cookies across domains:** when FE (Vercel) and BE (Render) are on different domains, the JWT cookie must be set with `httpOnly: true`, `secure: true`, `sameSite: 'none'` in production (`sameSite: 'lax'`, `secure: false` locally).
- **Local dev:** BE on `http://localhost:5000`, FE on `http://localhost:5173`.

---

## 10. Build Plan (Milestones)

1. **Setup** — create both repos; BE: Express server, MongoDB connection, env config, health route; FE: Vite React app, Tailwind, router, axios instance pointing at the BE.
2. **Auth & roles** — admin seeder (single admin, env credentials), login with email or Student ID, logout, JWT cookie, middleware, route guards, layouts.
3. **Students & batches** — CRUD, search/filter/pagination, batch assignment, clash check.
4. **Attendance** — batch/date marking, bulk upsert, attendance %.
5. **Fees** — record payments, monthly fee status, pro-rating, overdue logic.
6. **Dashboard** — aggregation-based stats and charts.
7. **Student portal** — home, attendance, fees, profile.
8. **Notifications (Level 1)** — in-app alerts and bell.
9. **Polish** — validation, error handling, rate limiting, empty/loading states, responsive checks, tests.
10. **Deploy** — `tutordesk-be` to Render/Railway, `tutordesk-fe` to Vercel, MongoDB Atlas; set production env vars and cross-domain cookie settings; demo login; README in each repo with screenshots and a link to the other repo.
11. **Optional** — Level 2 email reminders, Level 3 cron reminders, PDF fee receipts.

---

## 11. Acceptance Criteria (core)
- The single admin (seeded from env vars, idempotent seeder) can log in with email and log out; students log in with their Student ID; passwords are stored hashed; there is no public signup.
- Student accounts can only see their own data; admin routes return 403 for students.
- Admin can fully manage students and batches; overlapping batch assignment is blocked with a clear message.
- Attendance can be marked for a batch/date and edited later; percentages are correct.
- Fee status (Paid / Partial / Pending / Overdue) is correct for any month, including pro-rated first months.
- Dashboard numbers match the underlying data.
- Students see fee due/overdue notifications in-app.
- App is deployed with a working demo login.
