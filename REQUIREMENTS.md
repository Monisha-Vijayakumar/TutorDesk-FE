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
- **This file must be identical in both repos** (§13.10). Last updated: **2026-11-20** — change this date with every edit and copy the file to the other repo in the same session.

---

## 1. Overview

TutorDesk helps a single tutor or a small tuition center manage **students, attendance and fees** from one dashboard. Students/parents get a read-only portal to view their own attendance and fee status.

### Goals
- Demonstrate full-stack MERN skills: auth, security, CRUD, aggregations, role-based UI.
- Keep dependencies minimal — no paid services or third-party APIs in the core version.
- Be deployable and demo-able (demo login on the landing page).
- Work well on every major device: small phones (360px), flip and fold phones, tablets, laptops and large desktop monitors (NFR-23).
- Be ready for a **mobile app** later (§12): keep logic and the API client-agnostic so an app can reuse them.

### Out of scope (core version)
- Payment gateway (payments are recorded manually by the admin)
- SMS, and **automated** WhatsApp messages (manual WhatsApp click-to-chat reminders ARE in scope, FR-37)
- Payment gateway / online payments and a parent self-service payment portal
- File uploads
- Real-time features (Socket.io)
- Multi-center / multi-tenant support
- **Batch management** (batches, batch schedules, assigning students to batches, clash checks) — removed from the FE for now (2026-11-20); may come back later as its own milestone (§4.3)
- Native mobile app (planned as a later phase, see §12; until then the web app must be fully responsive)

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend (`tutordesk-fe`) | React 19 + TypeScript (Vite), React Router, Redux Toolkit (`createAsyncThunk` slices, NFR-26), axios, Tailwind CSS v4, shadcn/ui, `validator` |
| Backend (`tutordesk-be`) | Node.js 20+, Express, TypeScript recommended (§13.1) |
| Database | MongoDB (Atlas in production) with Mongoose |
| Auth | bcrypt (password hashing), jsonwebtoken (JWT in httpOnly cookie) |
| Validation | Server: Zod schemas + `validator` (same rules as the FE, §13.6). Client: `validator` (NFR-16) |
| Charts | Recharts (or Chart.js) |
| Optional (later) | Nodemailer (email reminders), node-cron (scheduled reminders), PDF receipts |

---

## 3. User Roles

Only two roles exist, stored as a constrained enum: **`ADMIN`** and **`STUDENT`** (`USER_ROLES` in the FE). "Tutor" is just the UI word for the admin.

| Role | Description | Access |
|---|---|---|
| **ADMIN (Tutor)** | The tuition center owner. **Exactly one admin account exists**, created by a BE database seeder — there is no signup or registration. Logs in with **email + password**. | Admin Portal only: full access to all data and pages; the only role that can create and manage student accounts. |
| **STUDENT** | Created by the admin from the Admin Portal; students cannot register. Logs in with **Student ID + password** (never email); must change the temporary password on first login. | Student Portal only: read-only access to their own attendance, fees and notifications; can change own password. Cannot create, modify or delete any user or the admin. |

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
- FR-9c: The **admin enters the student's initial password** in the Add Student form; it must pass the password policy (8+ characters with an uppercase letter, a lowercase letter, a number and a symbol — `isStrongPassword`) and is hashed with bcrypt before storing. The admin shares the generated Student ID (shown in the success message after saving) and the password with the student/parent — no SMS/email.
- FR-9d: A student must change the initial (or reset) password on first login (`mustChangePassword`). Until they do, they are redirected to `/student/change-password` and cannot use other student pages.
- FR-9e: The admin can look up a student's Student ID and reset their password from the student detail page; this issues a new temporary password and sets `mustChangePassword` again. No self-service "forgot password" for now.

**Data rules**
- FR-9f: Every account uses an **internal UUID as its primary key**. The externally visible Student ID is a separate field and is never used as a key or in URLs. Admin email and Student ID are both unique. Only bcrypt hashes are stored — plain passwords are never stored, logged or returned.

### 4.2 Students (Admin)
- FR-10: Create, read, update, delete students.
- FR-11: Student fields (required unless marked optional):
  - Student ID (`studentCode`) — generated by the BE (FR-9b), read-only everywhere.
  - First name, last name — letters and spaces (NFR-17).
  - Email (optional — many students have none); when given it must be valid and **unique among current (not deleted) students** — a deleted student's email can be used again (BE returns 409 for a duplicate; the form shows it under the email field). Stored lower-cased.
  - **WhatsApp number** (optional; the student's own number, labelled "WhatsApp number"; API field `phone`) — valid Indian mobile number (`isMobilePhone(..., "en-IN")`) when given, optional `+91`; spaces/dashes typed are removed before saving. **If left empty, the parent's WhatsApp number is saved as the student's WhatsApp number** (on add and on edit), so every student always has a number to contact. (Only the number is stored — sending WhatsApp messages stays out of scope.)
  - Parent name (required, letters only) and **parent WhatsApp number** (required, labelled "Parent WhatsApp number"; API field `parentPhone`; same rule as above).
  - Class/grade — one of Class 1–12.
  - Enrolled subjects — at least one, from the center's subject list (fixed list in the FE for now).
  - Monthly fee — whole rupees ₹1–₹1,00,000 in the form, stored in paise (FR-29).
  - Join date — valid date, defaults to today.
  - Initial password — add form only (FR-9c).
  - There is **no active/inactive field**: a student who discontinues is deleted (FR-13).
- FR-11a: **Payment information is read-only on the Students page.** Each student shows the current month's payment status (Paid / Pending / Overdue / Partially Paid, FR-26), payment date (latest payment this month) and payment method. The BE derives them from payments recorded on the Fees page (FR-24); the Students add/edit forms never set them. A new student starts as **Pending** with no payment date or method.
- FR-12: Students list (shadcn Data Table + TanStack Table), **server-side** pagination (default 10 per page; 10 / 20 / 50), newest students first:
  - Search by Student ID or full name — partial match, case-insensitive, debounced; clear (×) button.
  - Filter by payment status (All / Paid / Pending / Overdue / Partially Paid) and payment date range (from/to both optional and inclusive; only-from = from that date on, only-to = up to that date; from later than to shows an error and isn't applied). Students with no payment are excluded when a date filter is set.
  - Search and filters combine; any change returns to page 1. A **"Reset"** button (aligned with the filter inputs, same height) clears search, status and dates; disabled when nothing is set.
  - Shows **current students only** — deleted (discontinued) students never appear, so every row can be edited and deleted.
  - Columns: Student ID, Full Name, Email ID, WhatsApp Number, Payment Status (`StatusBadge`), Payment Date (`DD MMM YYYY`, `-` if none), Payment Method (`-` if none), Enrolled Subjects (badges, first 2 + "+N more"), Actions (Edit, Delete — pinned to the right edge on wide tables). No batch column (batches are out of scope). No payment reminder action here — reminders are sent from the Fees page only. Phones and tablets get one card per student instead (NFR-23).
  - States: skeleton on first load; "No students found." + Add Student when there are none; "No students match your search or filters." + Clear filters; load error with Try again (message from the common HTTP error handling, NFR-25); error toast when create/update/delete fails, with form values kept and API field errors shown under their fields; Save disabled while saving (no duplicate submissions).
- FR-13: **Delete = the student has discontinued. Always a soft delete** — the record stays in the DB.
  - Requires confirmation ("Delete Student?" dialog). Deleting the last row on a page moves to the previous page.
  - The BE sets `deletedAt` on the Student (never removes the document); the linked User account can no longer log in. Payment and attendance history stays in the DB for records and reports.
  - Deleted students are excluded everywhere current students are listed or counted: Students list and search, attendance marking (FR-18), fees for a month (FR-23), dashboard counts, reminders. Past attendance and payment records that mention them are kept.
  - A deleted student is treated as not found: `GET`/`PATCH`/`DELETE /api/students/:id` return **404**. If the admin edits or deletes a student that was already deleted elsewhere, the FE shows the API's message (fallback "This student was already deleted. The list has been refreshed."), closes the form/dialog and refreshes the list.
  - The Student ID is never reused. The email becomes free for a new student. There is no "restore" for now — a returning student is added again and gets a new Student ID.

### 4.3 Batches (Admin) — OUT OF SCOPE for now
Removed from the FE on 2026-11-20: no Batches menu item, route, page, batch field/column/filter on Students or Fees, batch API calls, types, state or mock data. FR-14–FR-17 below are kept only as a reference in case batches come back as a later milestone; don't build them now.
- ~~FR-14: Create, read, update, delete batches.~~
- ~~FR-15: Batch fields: name, subject, days of week, start time, end time, assigned students.~~
- ~~FR-16: Add/remove students to/from a batch.~~
- ~~FR-17: Batch clash check.~~

### 4.4 Attendance (Admin)
Attendance is taken **by class** (decided 2026-11-20, replaces the old per-batch plan).
- FR-18: Select a **class** (Class 1–12, the student's `grade`) and a **date** → load **all current students of that class** (deleted students never appear, FR-13). A class with no current students shows an empty state.
- FR-19: Mark each student Present / Absent, with a "Mark all present" shortcut.
- FR-20: Saving is a **bulk upsert** (one attendance record per **class per date**; re-saving updates it). Students who joined the class after the record was first saved appear on the next load and can be added..
- FR-21: Past dates can be edited; show "last updated" timestamp.
- FR-22: Future dates cannot be marked. Dates before a student's join date don't include that student.

### 4.5 Fees / Payments (Admin) — Payment/Fee Management page
A separate admin page (`/admin/fees`) to manage monthly fees, record payments, send manual WhatsApp payment reminders and view payment history. **No Add or Delete here** — students are created, edited and deleted only on the Students page; payment records are never deleted.

- FR-23: **Monthly fee records.** Each current (not deleted) student has one fee record per month (`FeeRecord`, unique per student + month), created by the BE when first needed. Defaults: **Total Fee** = the student's monthly fee (pro-rated in the joining month, FR-28); **Due Date** = that month's fee due day (FR-27), or the join date if the student joined after the due day. Students appear from the month they joined. A **month picker** (this month + the 11 before it, default this month) chooses which month the table shows; changing it returns to page 1.
- FR-23a: **Table** (shadcn Data Table + TanStack, server-side pagination 10 / 20 / 50, Previous/Next, phone cards below 56rem of content width — same as Students): Student ID, Student Name, Parent Name, Parent WhatsApp Number, Total Fee, Paid Amount, Outstanding, Payment Status (`StatusBadge`: Paid green, Pending amber, Partially Paid blue, Overdue red), Due Date, Last Payment Date, Last Payment Method, Actions. Values always reflect the latest saved data.
- FR-23b: **Search and filters — same component and behaviour as the Students page** (`PaymentSearchFilters`): search by Student ID or student name (partial, case-insensitive, debounced), Payment Status (All / Paid / Pending / Overdue / Partially Paid), Payment Date from/to (the date the latest payment was **received**, not the due date). Filters apply instantly (no Apply button); everything combines; any change returns to page 1; **Reset** clears search, status and dates (the month stays).
- FR-23c: **Row actions — exactly three:** Edit, Send Payment Reminder (only when eligible, FR-37), Payment History. Icon buttons with tooltips in the table; labelled buttons on phone cards.
- FR-24: **Edit (side sheet)** — payment details only. Student, parent and Student ID are shown read-only; personal and parent details can't be changed here. Save is disabled while saving; API errors show as a toast (NFR-25) with field errors under their fields, and a 404 (student deleted meanwhile) closes the sheet and reloads the list.
  - Editable for the month: **Total Fee** (required, whole rupees ₹0–₹1,00,000, can't be lower than the amount already paid) and **Due Date** (required).
  - **Record a payment** (optional section): Amount received (whole rupees ≥ ₹1, can't exceed the outstanding amount after the edited total), Payment date (required when an amount is entered, not in the future, defaults to today) and Payment method (required when an amount is entered: Cash / UPI / Bank Transfer / Card / Other). Leave the amount empty when nothing was received.
  - **Paid Amount is not typed in**: it is the sum of the month's payments. Every payment is stored as its own `Payment` record, so earlier payments are never overwritten or lost. (Correcting a wrong payment is a later feature — no deletes.)
  - After saving: toast ("Payment of ₹X recorded." / "Payment details saved."), the table, the payment history and the Students page refresh.
- FR-25: Multiple partial payments per month are allowed.
- FR-26: **The BE calculates** Paid Amount (sum of payments), **Outstanding = Total Fee − Paid Amount** and the status — the FE never decides them:
  - **Paid** — outstanding is zero
  - **Overdue** — outstanding remains and the due date has passed (even if partly paid)
  - **Partially Paid** — something was paid, outstanding remains, due date not passed
  - **Pending** — nothing paid and the due date hasn't passed
- FR-26a: **Payment History (side sheet)** for the selected student, all months, with two separate lists:
  - **Payments**: amount, payment method, payment date, fee month, updated at (date + time), updated by (admin).
  - **Reminders**: channel (WhatsApp / Email), type (Manual / Upcoming / Due / Overdue 1st / 2nd), contact used, date + time initiated, status (Initiated / Sent / Delivered / Failed / Unknown).
- FR-27: Fee due day is configurable in Settings (default 10th of each month).
- FR-28: **Pro-rated first month** — if a student joins mid-month, the first month's fee is pro-rated by the remaining days (rounded to whole rupees).
- FR-29: Money is stored as **integers in the smallest unit** (paise/fils), never as floats; shown as Indian rupees (`₹2,500`, `₹1,00,000`).

### 4.6 Attendance & Fee Logic / Reports
- FR-30: Attendance % per student = present sessions ÷ total marked sessions of their class (from their join date).
- FR-31: Attendance % per class (replaces the old per-batch %).
- FR-32: "Low attendance" list — students below 75%.
- FR-33: Dashboard stats computed with MongoDB aggregation pipelines.

### 4.7 Notifications & Reminders
Implemented in levels; Level 1 is part of core, others are optional.

- **Level 1 — In-app alerts (core, no new dependencies)**
  - FR-34: Notification collection; student sees a notification bell with unread count.
  - FR-35: Auto-create notification "Fee for <Month> is due by <date>" / "Fee for <Month> is overdue".
  - FR-36: Admin dashboard shows overdue badge and defaulters list.
- **Level 2 — Manual WhatsApp payment reminders (core, click-to-chat, no API or per-message fee)**
  - FR-37: **Send Payment Reminder** on the Fees page, per student, shown only when the status is Pending, Partially Paid or Overdue **and** the outstanding amount is above zero **and** a parent WhatsApp number exists. Never for Paid / zero balance. Available again as long as a balance remains (no daily limit for manual reminders). **Duplicate prevention (manual):** while a reminder is being recorded its button is disabled and a second click is ignored, so one click opens WhatsApp once and logs one reminder. If recording fails (e.g. 409 nothing outstanding, 404 student deleted) the API message is shown and the list reloads. Not available on the Students page.
  - FR-37a: Destination is always the **parent's WhatsApp number** (`parentPhone`), never the student's. Flow: admin clicks → the FE builds the message from the latest saved fee → opens `https://wa.me/<number>?text=<message>` (number in international format, digits only — numbers without a country code get `91`) in WhatsApp / WhatsApp Business → the admin reviews and presses Send there → the FE records the initiation (`POST /api/fees/:feeId/reminders`) and shows "WhatsApp opened with the reminder. Press Send in WhatsApp to deliver it." The FE **never sends automatically**; opening WhatsApp doesn't mean it was sent or delivered.
  - FR-37b: **Message template** (`buildPaymentReminderMessage`): "Hello [Parent Name], This is a friendly reminder regarding [the pending payment / the overdue payment / the remaining balance of ₹X] for [Student Name] (Student ID: [ID]) for [Month]. Due Date, Total Fee, Amount Paid, Outstanding Amount (₹, Indian format). Kindly arrange the remaining payment at your earliest convenience. Thank you, [Institute name = center name]". When something has been paid, the message names the **remaining balance**, not the full fee.
  - FR-38: **Reminder history**: every initiation is recorded (`ReminderLog`: channel, type, contact, timestamp, status). Manual WhatsApp reminders are stored as **Initiated** and are **never** marked Sent/Delivered unless that can be verified. Shown in Payment History, separate from payments.
- **Level 3 — Automated reminders (future enhancement; email first, WhatsApp needs the WhatsApp Business Platform API)**
  - FR-39: Configurable schedule — 3 days before the due date (Upcoming), on the due date (Due), 3 days after (First Overdue), 7 days after (Second Overdue). Only students with an outstanding balance; partly paid students are reminded of the remaining balance.
  - FR-40: **Duplicate prevention** in the BE: unique index on (student, month, reminder type, channel) for automated types, so the same stage is never processed twice for a fee month, even if the job runs twice.
  - FR-41: Skip all future scheduled reminders as soon as the month is fully paid; later reminders use the updated outstanding amount.
  - Note: free hosting tiers may sleep; use an external pinger or hosted cron trigger.

### 4.8 Settings (Admin)
- FR-42: Update profile (name, email), change password.
- FR-43: Update center name and fee due day.

---

## 5. Pages & UI

### 5.1 Public pages
All public pages (Home, Login, 404, Unauthorized) share `PublicLayout`: a bright, clean background photo (`src/assets/backgrounds/publicBackground.webp` — "Glasses, notebooks, and pencils on a white desk" by Jess Bailey on Unsplash, free Unsplash License, 1920px WebP ~89 KB) with a light white overlay for readability (stronger on phones), plus the TutorDesk logo. Placeholder until a final brand image is chosen.
| # | Page | Route | Contents |
|---|---|---|---|
| 1 | Home | `/` | Shared by the admin and students: app name, a pitch that speaks to both ("Tutors manage students, attendance and fees. Students check their attendance and fee status."), a **Login** button only (no signup/registration), and a note that students log in with the Student ID from their tutor. |
| 2 | Login | `/login` | One form for both roles: "Email or Student ID" + password (the BE works out the role from the identifier, FR-2), role-based redirect (FR-5). No role switch, no signup link. Footer: "Students: forgot your Student ID or password? Ask your tutor." |
| 3 | 404 / Unauthorized | `*`, `/unauthorized` | Friendly message with link home |

### 5.2 Admin pages
**Layout (`AdminLayout`):** left sidebar with the logo and links (Dashboard, Students, Attendance, Fees, Settings — `ADMIN_NAV_ITEMS`; no Batches, active link highlighted); top bar with the center name and a profile menu (avatar initials + name → Settings, Log out); notification bell added in the notifications milestone.
- **Collapsible sidebar** (shadcn `Sidebar`, `collapsible="icon"`, from `md` up): expanded shows logo + "TutorDesk" and icon + label per link, with a left-chevron button (tooltip "Collapse sidebar") to collapse. Collapsed is a narrow icon rail: logo mark only and icons only, each icon showing its label in a tooltip; clicking the logo (tooltip "Expand sidebar") expands it. Ctrl/Cmd+B toggles. The choice is remembered across reloads (`sidebar_state` cookie). Collapsing gives the page the freed width, e.g. the Students table fits without horizontal scrolling at 1440px.
- On phones and small foldables (below `md`, 768px) the sidebar becomes a slide-out drawer (logo + name, icon + label, no collapse button) opened from a menu button in the top bar; it closes after choosing a link. The sidebar scrolls on its own on short screens.
- Page content is centred with a max width (`max-w-screen-2xl`, 1536px) so it doesn't stretch on large monitors (NFR-23). Sections not built yet show a "Coming soon" placeholder page until their milestone.

| # | Page | Route | Contents |
|---|---|---|---|
| 5 | Dashboard | `/admin/dashboard` | Stat cards (total students, collected this month, pending dues); overdue fees (top 5 + View all); charts: monthly collection (bar), attendance % by class |
| 6 | Students list | `/admin/students` | **Built.** Header "Students" + Add Student; search + payment status + payment date range + Reset filters; data table / phone cards with server-side pagination (FR-12); Add/Edit in a side sheet (full width on phones) — add shows "Student ID is generated automatically", edit shows Student ID read-only and this month's payment read-only (FR-11a); success toast after Add includes the new Student ID; delete confirm dialog (FR-13). **No payment reminder action on this page** — reminders are sent from the Fees page (FR-37). |
| 7 | Student detail | `/admin/students/:id` | Basic Profile info incl. Student ID (`studentCode`) and a "Reset password" action (FR-9e); tabs: Attendance (calendar + %), Fees (payment history) |
| ~~8~~ | ~~Batches list / 9 Batch detail~~ | — | Out of scope (§4.3); no route. |
| 10 | Attendance | `/admin/attendance` | Class select + date picker (FR-18) → list of all current students in that class with Present/Absent toggles; "Mark all present"; Save; last updated note |
| 11 | Fees | `/admin/fees` | **Built.** Header "Fees" (no Add); Month picker + same search/filters as Students + Reset; fee table / phone cards (FR-23a); row actions Edit (side sheet: total fee, due date, record a payment — FR-24), Send Payment Reminder (WhatsApp click-to-chat to the parent, FR-37) and Payment History (side sheet: payments + reminders, FR-26a). |
| 12 | Settings | `/admin/settings` | Profile, change password, center name, center branch, fee due day |

### 5.3 Student / Parent pages (HOLD for now until Admin pages are done)
**Layout:** simple top nav (Home, Attendance, Fees, Profile) + notification bell.

| # | Page | Route | Contents |
|---|---|---|---|
| 13 | Home | `/student/home` | Attendance %, current month fee status, notifications |
| 13a | Change password (first login) | `/student/change-password` | Shown right after login when `mustChangePassword` is true (FR-9d): current (temporary) password, new password, confirm. Student can't open other student pages until it's done. Built with the student portal. |
| 14 | My Attendance | `/student/attendance` | Calendar with present/absent colours, low-attendance warning |
| 15 | My Fees | `/student/fees` | Month-wise paid/pending list and payment history |
| 16 | Profile | `/student/profile` | View details, change password |

### 5.4 Shared UI components
- Reusable `DataTable` (search, filter, pagination)
- `Modal`, `ConfirmDialog`, `Drawer`, `card`, `sidebar`
- `StatusBadge` (Paid green / Partially Paid blue / Pending amber / Overdue red; Present / Absent added with attendance)
- Built so far: `DataTable` + `DataTablePagination` (`src/components/table/`, server-side pagination, phone card list via `renderMobileCard`, pinned columns via `meta.isPinnedRight`), `PageHeader`, `EmptyState`, `ConfirmDialog`, `CompactBadgeList`, `FormField`, `FormSelectField`, `FormCheckboxGroup`, `FormFieldError`
- `StatCard`, chart wrappers
- `AppLogo` (graduation-cap mark + "TutorDesk"; used on Home, Login, admin sidebar/top bar; same mark as `public/favicon.svg`), `PlaceholderPage` ("Coming soon" for admin sections not built yet)
- Toast notifications (success / error) using **shadcn Sonner** (`toast.success` / `toast.error` from `sonner`; `<Toaster />` is mounted once in `App`). Every API action (login, logout, create/update/delete) shows a success or failure toast. Field validation errors stay inline under the field; API errors go in a toast.
  - **Look:** top-center, auto-close after 5 s (`TOAST_POSITION`, `TOAST_DURATION_MS` in `src/constants/app.ts`). Colours per type (background / text+icon / border): success `#ECFDF3` / `#067647` / `#ABEFC6`; error `#FEF3F2` / `#B42318` / `#FECDCA`; warning `#FFFAEB` / `#B54708` / `#FEDF89`; info `#EFF8FF` / `#175CD3` / `#B2DDFF`; loading `#F8FAFC` / `#475569` / `#E2E8F0`. Defined as `--toast-*` tokens in `src/index.css` and applied through Sonner's `richColors` variables in `src/components/ui/sonner.tsx`.
  - **For now:** messages come from the UI constants `SUCCESS_MESSAGES` / `ERROR_MESSAGES` (`src/api/successMessages.ts`, `src/api/errorMessages.ts`).
  - **Later (once the BE is built):** show the message returned by the API, chosen by status code and response message, falling back to the UI constants.
- Skeleton loaders and empty states ("No students yet — add your first one")
- Inline form validation errors
- **Required fields are marked with a red asterisk** (`*`, `RequiredMark`, destructive colour) after the label, via the `isRequired` prop on `FormField` / `FormSelectField` / `FormCheckboxGroup` (also sets `aria-required`). Optional fields have no marker — labels never say "(optional)". **Every form with required fields shows "Fields marked * are required."** at the top (`RequiredFieldsNote`; built into `AuthFormCard` for login/change password). Applies to every existing and future form (login, student add/edit, fees, settings, student portal…). Filters and search boxes are never marked. See NFR-24.
- Fully responsive on every page (tutors often use phones), following NFR-23. Tables scroll inside their container or switch to a card list on phones; modals and drawers go full-width on phones.

---

## 6. Data Model (MongoDB + Mongoose)

**Conventions (every collection)**
- `_id` is a **UUID v4 string** (`crypto.randomUUID()`), never an ObjectId. The API always returns it as **`id`** (no `_id`, no `__v`) — use a `toJSON` transform.
- **Date-only values are stored as `"YYYY-MM-DD"` strings** (`joinDate`, `dueDate`, `paidOn`, attendance `date`) and months as `"YYYY-MM"` — exactly what the FE sends and shows, with no timezone shifts. String comparison sorts them correctly.
- **"Today" and "this month" are calculated in the center's timezone** (`APP_TIMEZONE`, default `Asia/Kolkata`), never the server's UTC clock.
- Money is an **integer in paise** (`₹2,500` = `250000`). Never floats.
- Enum values are UPPER_SNAKE_CASE strings, identical to the FE constants.
- `createdAt` / `updatedAt` from Mongoose `timestamps`, returned as ISO date-time strings.

```text
User                       (login accounts: the single admin + one per student)
  _id, name, role: 'ADMIN' | 'STUDENT',
  email: string | null      ADMIN: required, lower-case, used to log in. STUDENT: null (a student's contact email lives on Student and can never be used to log in)
  passwordHash              bcrypt (cost 10–12); never returned, logged or sent anywhere
  ADMIN only:   centerName, branch | null, city, state, feeDueDay (integer 1–28, default 10)
  STUDENT only: studentId (ref Student, unique), studentCode ('S' + 9 digits, unique), mustChangePassword (true for new students and after a reset)
  timestamps
  indexes: unique partial { role } where role = 'ADMIN'      (only one admin can ever exist)
           unique partial { email } where role = 'ADMIN'
           unique sparse  { studentCode }
  -- a STUDENT whose Student has deletedAt set can't log in and gets 401 from /auth/me (FR-13); the User document is kept

Student                    (profile; created only by the admin)
  _id, studentCode (copy of the User's, for search/display; unique),
  firstName, lastName, email: string | null (lower-case),
  phone        student's WhatsApp number — always set: the parent's number when the student has none (FR-11)
  parentName, parentPhone (parent's WhatsApp number — the payment-reminder destination),
  grade ('Class 1' … 'Class 12'), subjects: [string] (≥ 1, from the subject list, §13.6),
  monthlyFee (paise, ₹1–₹1,00,000), joinDate ('YYYY-MM-DD'),
  deletedAt: ISO date-time | null   soft delete (FR-13) — there is no isActive field
  createdBy (ref User), timestamps
  indexes: { deletedAt, createdAt: -1 }   (current students, newest first)
           { deletedAt, grade }           (attendance by class)
           email unique among current students only — partial unique index (e.g. partialFilterExpression
           { email: { $type: 'string' }, deletedAt: { $type: 'null' } }) AND a service check before insert/update (gives the 409)
  -- every query for current students filters deletedAt: null; documents are never removed
  -- the linked User.name is firstName + " " + lastName (keep in sync on edit)

Counter
  _id: name (e.g. 'studentCode'), value: number
  -- Student IDs: findOneAndUpdate({ _id: 'studentCode' }, { $inc: { value: 1 } }, { new: true, upsert: true }) → 'S' + value.
     Initialised by the seeder to STUDENT_CODE_START − 1 (default 100000000, so the first student is S100000001). Never decremented, never reused.

FeeRecord                  (one per student per month — FR-23)
  _id, studentId (ref Student), month ('YYYY-MM'),
  totalFee (paise)  default: the student's monthlyFee, pro-rated in the joining month (§13.7); editable
  dueDate ('YYYY-MM-DD')  default: the admin's feeDueDay in that month, or the join date if later; editable
  updatedBy (ref User | null), timestamps
  indexes: unique { studentId, month }, { month }
  -- created on demand (§13.7). paidAmount, outstandingAmount, status, lastPaymentDate, lastPaymentMethod are CALCULATED, never stored.

Payment                    (one document per payment received — never edited or deleted)
  _id, feeRecordId (ref FeeRecord), studentId (ref Student), month ('YYYY-MM'),
  amount (paise, > 0), paidOn ('YYYY-MM-DD', not in the future),
  method: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'OTHER',
  recordedBy (ref User), recordedByName (admin name at the time — shown in Payment History), createdAt (= "recordedAt")
  indexes: { feeRecordId }, { studentId, paidOn: -1, createdAt: -1 }
  -- the sum of a month's payments can never exceed that month's totalFee

ReminderLog                (every payment-reminder initiation — FR-38)
  _id, feeRecordId (ref FeeRecord), studentId (ref Student), month ('YYYY-MM'),
  channel: 'WHATSAPP' | 'EMAIL',
  type: 'MANUAL' | 'UPCOMING' | 'DUE' | 'FIRST_OVERDUE' | 'SECOND_OVERDUE',
  contact (the number / email used — the parent's WhatsApp number for WhatsApp),
  status: 'INITIATED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'UNKNOWN'   (manual WhatsApp is always INITIATED; never upgraded without proof)
  initiatedBy (ref User, manual only), createdAt (= "initiatedAt")
  indexes: { studentId, createdAt: -1 }
           unique partial { studentId, month, type, channel } where type != 'MANUAL'   (no duplicate automated reminders — FR-40, later)

Attendance                 (one per class per date — FR-18/20; built in the Attendance milestone)
  _id, grade ('Class 1' … 'Class 12'), date ('YYYY-MM-DD', not in the future),
  records: [{ studentId (ref Student), status: 'PRESENT' | 'ABSENT' }],
  markedBy (ref User), timestamps
  indexes: unique { grade, date }

Notification               (Level 1 notifications milestone — later)
  _id, userId (ref User), type: 'FEE_DUE' | 'FEE_OVERDUE' | 'GENERAL', message, isRead (default false), createdAt

Batch — out of scope (§4.3): no collection, no batch fields anywhere.
```

---

## 7. API Contract (shared by FE and BE)

**General rules**
- Base path **`/api`** (FE: `VITE_API_BASE_URL=http://localhost:5000/api`). JSON in and out (`Content-Type: application/json`).
- Auth: JWT in an **httpOnly cookie** (§13.4). The FE sends `withCredentials: true`; there is no `Authorization` header on the web.
- Every route except `POST /auth/login` needs a valid cookie → otherwise **401**. Admin routes need role `ADMIN`, student-portal routes role `STUDENT` → otherwise **403**.
- Query params the FE leaves empty are **omitted** (never sent as empty strings). `page` is 1-based; `limit` is 10, 20 or 50 from the FE (accept 1–100, default 10).
- Ids in URLs are the UUID `id`, never the Student ID.
- **Error body (every error, NFR-25):** `{ "message": "Short user-safe text", "errors": { "<field>": "message" } }` — `errors` only for field validation. The FE shows `message` for 4xx as-is (≤ 200 characters), shows its own text for 5xx, and puts `errors` under the matching form fields (top-level body field names: `firstName`, `email`, `phone`, `totalFee`, `dueDate`, … — nested ones like `payment.amount` are toast-only).
- **Status codes:** 200 OK · 201 created · 204 deleted (no body) · 400 business rule broken (with `message`) · 401 not logged in / session expired / wrong login · 403 wrong role · 404 not found (incl. a deleted student) · 409 conflict (duplicate email, nothing outstanding) · 422 body/query validation failed (with `errors`) · 429 too many login attempts · 500 unexpected (generic message only, never a stack trace).

```text
AUTH
  POST /api/auth/login                        public, rate-limited
       body { identifier, password }
         identifier: admin email (contains "@", FE sends it lower-cased) → matched against the ADMIN only;
                     otherwise a Student ID 'S' + 9 digits (FE sends it upper-cased) → matched against STUDENT users only.
                     A student's email never logs in.
       200 { user } + Set-Cookie (JWT)
       401 { message: "Invalid email, Student ID or password." }   (same message for unknown user, wrong password, deleted student)
       422 if identifier/password missing
  POST /api/auth/logout                       clears the cookie → 204 (also fine when already logged out)
  GET  /api/auth/me                           200 { user } | 401 (no/expired cookie, user gone, student deleted)
       — called on every page load to restore the session
  PATCH /api/auth/change-password             body { currentPassword, newPassword } → 204   (student portal milestone)
       400 wrong current password · 422 weak new password; clears mustChangePassword

  user object (login + me):
    ADMIN:   { id, name, email, role: "ADMIN", centerName, branch, city, state }
    STUDENT: { id, name, role: "STUDENT", studentCode, mustChangePassword }
    -- centerName is used by the FE in the WhatsApp reminder ("Thank you, <centerName>")
  (no signup / registration endpoint — the admin comes from the seeder, students from POST /api/students)

STUDENTS (admin)
  GET  /api/students?search=&paymentStatus=&paidFrom=&paidTo=&page=&limit=
       search        partial, case-insensitive, matches studentCode OR firstName OR lastName OR "firstName lastName"
       paymentStatus PAID | PENDING | OVERDUE | PARTIAL — the student's CURRENT-month status
       paidFrom/To   'YYYY-MM-DD', inclusive, both optional — on the latest payment date of the current month
                     (students with no payment this month are excluded when either is set)
       → 200 { students: Student[], total }   current students only, newest (createdAt) first; total = all matches across pages
  POST /api/students
       body { firstName, lastName, email | null, phone, parentName, parentPhone, grade, subjects, monthlyFee, joinDate, password }
         phone: the FE already replaces an empty phone with parentPhone; the BE applies the same fallback if phone is empty/missing
         phones arrive without spaces/dashes ("+919876543210" or "9876543210")
       → 201 { student }   creates Student + STUDENT User (hashed password, mustChangePassword true) + the next studentCode
         409 { message: "A student with this email already exists." } · 422 { message, errors }
  GET  /api/students/:id                      → 200 { student } | 404           (not used by the FE yet)
  PATCH /api/students/:id
       body: same as POST without password → 200 { student } | 404 (deleted / unknown) | 409 | 422
       (studentCode, createdAt, payments are never changed here)
  DELETE /api/students/:id                    soft delete: sets deletedAt, blocks the student's login → 204 | 404
  POST /api/students/:id/reset-password       → 200 { temporaryPassword } (returned once), sets mustChangePassword   (student detail milestone)

  Student object:
    { id, studentCode, firstName, lastName, email | null, phone, parentName, parentPhone, grade, subjects: string[],
      monthlyFee, joinDate, createdAt,
      currentPayment: { status, paidOn | null, method | null } }
    -- currentPayment = this month's fee record: status (FR-26), date and method of the latest payment this month.
       A student who joins after this month has no fee record yet → { status: "PENDING", paidOn: null, method: null }.

FEES / PAYMENTS (admin)
  GET  /api/fees?month=YYYY-MM&search=&paymentStatus=&paidFrom=&paidTo=&page=&limit=
       month required ('YYYY-MM', not after the current month → else 422); other params as for /students,
       but status and dates are for THAT month (paidFrom/To on lastPaymentDate)
       rows = current students who had joined by the last day of that month (missing fee records are created first, §13.7),
       ordered by the student's createdAt, newest first
       → 200 { fees: FeeRecord[], total }
  PATCH /api/fees/:feeId
       body { totalFee, dueDate, payment: { amount, paidOn, method } | null }
         totalFee 0 – 10000000 paise (₹0–₹1,00,000) and ≥ the amount already paid
         payment.amount ≥ 100 (₹1), whole rupees, ≤ totalFee − already paid; paidOn not in the future; method from the enum
       → 200 { fee }   a non-null payment creates a new Payment (never edits an old one)
         400 { message: "Total fee can't be less than the amount already paid." }
         400 { message: "Payment is more than the outstanding amount." }
         404 (unknown fee record, or the student was deleted) · 422
  GET  /api/students/:id/payment-history
       → 200 { payments: [{ id, month, amount, paidOn, method, recordedAt, recordedBy }],
               reminders: [{ id, month, channel, type, contact, status, initiatedAt }] }
         all months, newest first (payments by paidOn then recordedAt; reminders by initiatedAt);
         recordedBy = the admin's name (recordedByName); 404 for a deleted / unknown student
  POST /api/fees/:feeId/reminders
       body { channel: "WHATSAPP", type: "MANUAL", contact }      contact = the parent's WhatsApp number
       → 201 { reminder }   status always "INITIATED" — records the event only, sends nothing
         409 { message: "Nothing is outstanding for this month." } (outstanding ≤ 0) · 404 · 422
       (no daily limit for manual reminders — FR-37)

  FeeRecord object:
    { id, month,
      student: { id, studentCode, firstName, lastName, parentName, parentPhone },
      totalFee, paidAmount, outstandingAmount, status, dueDate, lastPaymentDate | null, lastPaymentMethod | null }

ATTENDANCE (admin — Attendance milestone, by class)
  GET  /api/attendance?grade=Class%206&date=YYYY-MM-DD
       → 200 { grade, date, records: [{ student: { id, studentCode, firstName, lastName }, status: "PRESENT" | "ABSENT" | null }],
               updatedAt | null }
         every current student of the class who had joined by that date (status null = not marked yet); future date → 422
  PUT  /api/attendance
       body { grade, date, records: [{ studentId, status }] }   bulk upsert, one record per class + date → 200 { attendance }

DASHBOARD (admin — later)       GET /api/dashboard/stats
STUDENT PORTAL (student — later) GET /api/me/summary · GET /api/me/attendance · GET /api/me/fees
NOTIFICATIONS (later)           GET /api/notifications · PATCH /api/notifications/:id/read · PATCH /api/notifications/read-all
SETTINGS (admin — later)        PATCH /api/settings   (name, email, centerName, branch, city, state, feeDueDay)
BATCHES                         none (out of scope)
```

FE files that hold this contract: `src/api/apiEndpoints.ts` (paths), `src/api/interfaces/*.ts` (shapes), `src/api/services/*Service.ts` (calls). If anything above changes, change it in **both** repos (§13.10).

---

## 8. Non-Functional Requirements
- NFR-1: Input validation on every endpoint body and query (Zod + `validator`, rules in §13.6, identical to the FE).
- NFR-2: Centralized error-handling middleware with one error shape `{ message, errors? }` (§7, §13.5) — matches the FE's common handler (NFR-25).
- NFR-3: Rate limiting on auth routes (e.g. express-rate-limit).
- NFR-4: CORS configured for the client origin with credentials.
- NFR-5: Environment variables via `.env` (never committed); provide `.env.example` with placeholders only. BE seeder env vars: `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `STUDENT_CODE_START` (default `100000001`), plus optional center details — production credentials are never hard-coded or committed.
- NFR-6: Passwords and hashes never returned in API responses.
- NFR-7: Responsive UI on all major devices, from 360px phones to large desktops. Detailed rules in NFR-23.
- NFR-8: Loading, empty and error states on every data page.
- NFR-9: Basic tests (Jest + Supertest) for auth and fee status logic.
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
- NFR-15: **Central API endpoints file.** Every backend endpoint path lives in one place — `API_ENDPOINTS` in `src/api/apiEndpoints.ts`, grouped by feature (`API_ENDPOINTS.AUTH.LOGIN`, `API_ENDPOINTS.STUDENTS.DETAILS(studentId)`). Paths with an id are functions that take that id. Services must use these constants — never write a URL string inline. When §7 changes, update this file too.
- NFR-16: **Sanitize, then validate, then send.** Every form goes through three steps before anything reaches the API:
  1. **Sanitize** the whole form with the single util `sanitizeFormValues(values, fieldsToSkip)` in `src/utils/sanitize.ts` — it strips control characters and trims every field. Skip passwords (never altered). Don't HTML-escape input — React escapes on render, and escaping would corrupt saved data.
  2. **Validate the sanitized values** by calling `validator` methods directly in the form's `validateXxxForm` (which lives in `src/utils/<feature>Validation.ts`, see NFR-18) (`isEmpty`, `isEmail`, `isStrongPassword`, `isMobilePhone(value, "en-IN")`, `isInt`/`isNumeric`, `isDate`, …) — no hand-written regexes or manual checks.
  3. **Build the payload from the sanitized values only**, applying field-specific changes inline with method chaining (e.g. `email: values.email.toLowerCase()`) and dropping client-only fields (e.g. `confirmPassword`).
  - **No thin wrapper functions** around library methods. Only add a util when it actually does something extra (combines steps, transforms data) and is reused.
  - The backend validates again (NFR-1) — FE validation is for UX and clean data, not security.
- NFR-17: **Name and place fields: letters only, no digits.** Applies in every form (student add/edit, profile/settings, etc.). Leading/trailing spaces are trimmed by `sanitizeFormValues`; spaces in the middle are kept as typed. Validate with `isAlpha` and the shared constants in `src/constants/validation.ts`:
  - **Person name, city, state** — letters and spaces: `isAlpha(value, ALPHA_LOCALE, ALPHA_WITH_SPACES_OPTIONS)`, message `VALIDATION_MESSAGES.LETTERS_ONLY`.
  - **Center name, branch** — letters, spaces and `.` `'` `-` (e.g. "St. Mary's Academy", "Navi-Mumbai"): `isAlpha(value, ALPHA_LOCALE, ALPHA_WITH_PUNCTUATION_OPTIONS)`, message `VALIDATION_MESSAGES.LETTERS_AND_PUNCTUATION_ONLY`.
  - Optional fields are checked only when filled in. The backend should apply the same rules.
- NFR-18: **No validation logic in components.** Pages and components keep only their core logic: state, event handlers, dispatching actions, navigation, toasts and JSX. All form validation lives in `src/utils/<feature>Validation.ts` (e.g. `authValidation.ts` → `validateLoginForm`; `studentValidation.ts`, `feeValidation.ts`). Components just call `validateXxxForm(sanitizedValues)` and never import `validator` or `VALIDATION_MESSAGES` themselves. Form value types (`XxxFormValues`) live in `src/interfaces/<feature>.ts` (NFR-19). Other non-UI helpers go to the matching module too (e.g. route helpers in `routes/paths.ts`).
- NFR-19: **Interfaces live in dedicated folders, one file per feature.** No interface is declared inline in a component, hook, slice or service; everything is imported with `import type`.
  - **API shapes** (models returned by the API, request payloads, responses, API errors) → `src/api/interfaces/<feature>.ts`. Current: `auth.ts` (`UserRole`, `User`, `LoginPayload`, `AuthResponse`, `AuthService`), `student.ts` (… `StudentService`), `fee.ts` (… `FeeService`), `common.ts` (`ApiErrorResponse`, `ApiFieldError`, `ApiError`).
  - **Everything else** (form values, Redux state, hook results, component props, route state) → `src/interfaces/<feature>.ts`. Current: `auth.ts` (`LoginFormValues`, `AuthState`, `AuthFormCardProps`), `form.ts` (`FormErrors`, `FormFieldProps`, `FormFieldBindings`, `UseFormResult`), `routes.ts` (`ProtectedRouteProps`, `LoginRedirectState`), `common.ts` (`TextLinkProps`, `StatusPageProps`).
  - New features get a file in each folder as needed (`student.ts`, `fee.ts`, `attendance.ts`, …). Exceptions: `src/env.d.ts` (Vite env typing) and `RootState` / `AppDispatch`, derived from the store in `src/store/index.ts`.
- NFR-20: **All API-related code lives in `src/api/`.** `apiEndpoints.ts` (`API_ENDPOINTS`), `errorMessages.ts` (`ERROR_MESSAGES`), `successMessages.ts` (`SUCCESS_MESSAGES`), `httpStatus.ts` (`HTTP_STATUS`), `apiErrorHandler.ts` (`getApiError`, `hasApiErrorStatus` — NFR-25), `services/` (`apiClient.ts` — the single axios instance with timeout; one `<feature>Service.ts` per feature: `authService.ts`, `studentService.ts`, `feeService.ts`, each with a `mocks/mock<Feature>Service.ts` twin for dev) and `interfaces/` (API shapes, see NFR-19). RTK Query is **not** used (NFR-26). New API endpoints, services, API messages and API types go here — not in `constants/`, `services/` or `interfaces/` at the root.
- NFR-21: **One file for validation messages.** Every form validation message, now and in future, goes in `VALIDATION_MESSAGES` in `src/constants/validation.ts` (along with validation options such as `ALPHA_WITH_SPACES_OPTIONS`). Don't create per-feature message files or hard-code messages in validation utils.
- NFR-22: **XSS protection.** Text is rendered with normal JSX (`{value}`) — React escapes it, so form input is not HTML-escaped or run through DOMPurify before sending (that would corrupt values like "a < b" and isn't a security boundary; the BE validates too). Any HTML string from data (e.g. rich-text notes/notifications) must be rendered only through `<SafeHtml html={...} />` (`src/components/SafeHtml.tsx`), which cleans it with **DOMPurify**. ESLint blocks `dangerouslySetInnerHTML` everywhere except that component.
- NFR-23: **Responsive design on all major devices.** Applies to **every existing page and every future page** (public, admin, student portal) and to shared components. A page is not done until it passes the checks below.
  - **Device targets** (CSS pixels):

    | Category | Examples | Width | What to check |
    |---|---|---|---|
    | Narrow screens (fallback) | Galaxy Z Fold cover screen, older small phones | 320–359px | Nothing breaks, no horizontal scroll |
    | Small phones (baseline) | Galaxy A/M series, iPhone SE | 360–375px | **Primary design target** |
    | Flip phones (foldable) | Galaxy Z Flip, Motorola Razr | ~360–412px, tall 21:9–22:9 screen | Tall portrait and very short landscape (~360px high) both usable |
    | Large phones | iPhone Pro Max, Pixel, Galaxy S Ultra | 390–430px | |
    | Foldables open / small tablets | Galaxy Z Fold inner screen, iPad mini | 600–884px | Layout adapts when the device is folded or unfolded, without a reload |
    | Tablets | iPad, Android tablets (portrait + landscape) | 768–1366px | Sidebar appears from `md` (768px) |
    | Laptops / desktops | | 1280–1920px | |
    | Large desktops | 27"+ and ultrawide monitors | 2560px+ | Content capped and centred, no stretched lines or huge gaps |

  - **Mobile-first Tailwind:** write base classes for phones, then add `sm:` / `md:` / `lg:` / `xl:` / `2xl:` for larger screens. Use Tailwind's default breakpoints only; no hard-coded pixel media queries or JS screen-size checks for layout (exception: the shadcn Sidebar's `useIsMobile` switch to a drawer). **Components inside the admin content area size themselves with container queries** (`@xl:`, `@4xl:`, `@5xl:` …) against the `@container` content wrapper in `AdminLayout`, not the screen, so they use the space the sidebar leaves — e.g. `DataTable` shows cards below 56rem of content width and the table from `@4xl`.
  - **No horizontal page scroll** anywhere from 320px to 2560px+. Wide content (tables, calendars, charts) scrolls inside its own container (`overflow-x-auto`) or switches to a stacked card list below `md`. Long text (names, emails) wraps or truncates (`min-w-0`, `truncate`, `break-words`).
  - **Heights:** use `min-h-svh` / `dvh`, never `h-screen` / `100vh` (mobile browser bars change the height). No fixed heights that clip content: pages must scroll on short screens (flip phone landscape, foldables, split screen).
  - **Touch:** tap targets at least **40×40px** on phones (44px preferred for primary actions), with space between them. Nothing works only on hover; every action works with touch, mouse and keyboard.
  - **Forms:** inputs use 16px text on phones (stops iOS zooming in), full-width fields stacked in one column on phones, and the right `type` / `inputMode` / `autoComplete` (numeric keypad for phone numbers and amounts). Multi-column forms only from `md` up.
  - **Large screens:** admin content is capped at `max-w-screen-2xl` and centred; forms, cards and text blocks have their own max widths; grids add columns at `lg` / `xl` / `2xl` instead of stretching.
  - **Overlays:** dialogs and drawers fit the screen on phones (full width or bottom sheet, scrollable body); dropdowns stay inside the viewport.
  - **Images and charts** scale with their container (responsive chart containers, `max-w-full` images).
  - **Testing (definition of done):** check every new or changed page in browser DevTools at **320, 360, 412, 768, 1024, 1280, 1920 and 2560px**, in portrait and landscape for phone sizes, plus a foldable preset (e.g. Galaxy Z Fold / Surface Duo) and a short landscape height (~360px).
- NFR-24: **Consistent design across the whole application.** Every existing and future page (public, admin, student portal) looks and behaves the same way, by reusing the shared components instead of styling things per page:
  - **Forms:** fields come from `FormField` / `FormSelectField` / `FormCheckboxGroup`. **Required fields always show a red asterisk** after the label (`isRequired` → `RequiredMark`, destructive colour, plus `aria-required`); optional fields have no marker and labels never say "(optional)"; every form with required fields shows `RequiredFieldsNote` ("Fields marked * are required.") at the top. Errors appear inline under the field (`FormFieldError`); API errors go to a toast.
  - **Same sizes everywhere:** inputs, selects and buttons are 40px tall on phones and 36px from `md`; primary actions use `size="lg"`. Labels sit 6px above their field.
  - **Page structure:** `PageHeader` (title, description, main action), then filters, then content; `EmptyState` for empty/no-results/error, `DataTable` (+ phone cards) for lists, `ConfirmDialog` for destructive actions, side `Sheet` for add/edit forms, `StatusBadge` for statuses, Sonner toasts for results.
  - **Wording:** same terms on every page (e.g. "Student ID", "WhatsApp number", "Reset", "Add Student", "Save"/"Cancel"); shared texts come from constants.
  - A new page or form is not done until it follows these rules (checked together with NFR-23).
- NFR-25: **Common HTTP error handling.** Every failed API call, in every module (auth, students, fees, future ones), goes through one function: `getApiError(error, fallbackMessage, statusMessages?)` in `src/api/apiErrorHandler.ts`, called in each thunk's `catch` and passed on with `rejectWithValue`. No module or component handles HTTP statuses on its own.
  - It returns `ApiError { status, message, fieldErrors }`. Message order: the BE's `message` (only for 4xx, only if short and user-safe — 5xx messages are never shown, so no stack traces reach users) → the action's own text for that status (e.g. login 401 = "Invalid email or password.", 404 on a student = "already deleted") → the common text for the status → the action's fallback.
  - Common texts (`ERROR_MESSAGES`): 400 "Invalid request. Please check the submitted information.", 401 "Your session has expired. Please log in again.", 403 "You do not have permission to perform this action.", 404 "The requested information could not be found.", 409 "This operation conflicts with existing information.", 422 "Please check the submitted information and try again.", 500 "Something went wrong on the server. Please try again later.", 502 "The server is temporarily unavailable. Please try again.", 503 "The service is currently unavailable. Please try again later.", no response "Unable to connect to the server. Please check your internet connection.", timeout (axios `timeout`, 30 s) "The request timed out. Please try again.". Non-HTTP / unexpected errors and unexpected response bodies fall back to the action's message.
  - **Field errors** (400/422, `errors` as an object or a `[{ field, message }]` list) are shown under the matching form fields (`getFormErrorsFromApi`); the toast still shows the request-level message.
  - **401** uses the existing auth session handling: the auth slice clears the user on any rejected request with status 401 (while logged in), `ProtectedRoute` sends the user to the login page (remembering the page), and the login page shows the session-expired toast once. No second auth mechanism.
  - Components show `apiError.message` with Sonner (`toast.error`); list pages show it in their error state with "Try again".
- NFR-26: **One architecture for every module, following Auth.** Each module has: API types + a `<Feature>Service` interface in `src/api/interfaces/<feature>.ts`; endpoints in `API_ENDPOINTS`; HTTP calls in `src/api/services/<feature>Service.ts` (via the shared `api` axios instance; swapped for `src/api/mocks/mock<Feature>Service.ts` when `IS_MOCK_API_ENABLED`); a Redux slice `src/store/<feature>Slice.ts` with `createAsyncThunk` thunks (rejecting with `ApiError`, NFR-25), reducers and `select…` selectors, registered in `src/store/index.ts`; slice/action names in `src/constants/actionTypes.ts`; state + component types in `src/interfaces/<feature>.ts`; pages/components use `useAppDispatch` / `useAppSelector` and never call services or axios directly.
  - List pages load in an effect keyed on memoised params and abort the previous request on change (stale responses are also ignored by request id); after a create/update/delete the page reloads the list.
  - Slices reset on logout. Form submit flags (`isSubmitting`) stay in the form, as in the login page; module data lives in Redux.
  - No RTK Query or other data-fetching libraries; no per-module variations.

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
    store/           # Redux slices: authSlice, studentSlice, feeSlice (NFR-26)
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

See **§13.2** for the full structure (config, constants, models, validators, middleware, services, controllers, routes, utils, seeders, tests).

### 9.3 Cross-repo notes
- **CORS:** BE allows `CLIENT_URL` origin with `credentials: true`.
- **Cookies across domains:** when FE (Vercel) and BE (Render) are on different domains, the JWT cookie must be set with `httpOnly: true`, `secure: true`, `sameSite: 'none'` in production (`sameSite: 'lax'`, `secure: false` locally).
- **Local dev:** BE on `http://localhost:5000`, FE on `http://localhost:5173` (`VITE_API_BASE_URL=http://localhost:5000/api`, `VITE_USE_MOCK_API=false` to use the BE).
- **Cookie** name `tutordesk_token`; details in §13.4.

---

## 10. Build Plan (Milestones)

1. **Setup** — create both repos; BE: Express server, MongoDB connection, env config, health route; FE: Vite React app, Tailwind, router, axios instance pointing at the BE.
2. **Auth & roles** — admin seeder (single admin, env credentials), login with email or Student ID, logout, JWT cookie, middleware, route guards, layouts.
3. **Students** — CRUD, search/filter/pagination. (Batches removed — out of scope.)
4. **Attendance** — by class: class + date marking for all current students of the class, bulk upsert, attendance % (student, class).
5. **Fees** — monthly fee records, record payments, status/outstanding calculation, pro-rating, overdue logic, manual WhatsApp reminders + reminder log, payment history (FE built with the dev mock; BE pending).

**Current status (2026-11-20):** FE milestones 1–2 (auth), 3 (Students) and 5 (Fees) are built against the dev mock. **Next: build `tutordesk-be` and connect the existing pages, in the order of §13.9.** Attendance (4) follows.
6. **Dashboard** — aggregation-based stats and charts.
7. **Student portal** — home, attendance, fees, profile.
8. **Notifications (Level 1)** — in-app alerts and bell.
9. **Polish** — validation, error handling, rate limiting, empty/loading states, a final responsive pass on all devices (NFR-23), tests. Responsiveness is built into every milestone; this is the last check, not the first.
10. **Deploy** — `tutordesk-be` to Render/Railway, `tutordesk-fe` to Vercel, MongoDB Atlas; set production env vars and cross-domain cookie settings; demo login; README in each repo with screenshots and a link to the other repo.
11. **Optional** — Level 3 automated reminders (email first; WhatsApp needs the Business Platform API), PDF fee receipts, correcting a wrong payment.
12. **Mobile app (later phase)** — see §12.

---

## 11. Acceptance Criteria (core)
- The single admin (seeded from env vars, idempotent seeder) can log in with email and log out; students log in with their Student ID; passwords are stored hashed; there is no public signup.
- Student accounts can only see their own data; admin routes return 403 for students.
- Admin can fully manage students. No batch functionality anywhere in the FE (out of scope).
- Attendance can be marked for a class and date (all current students of that class) and edited later; percentages are correct.
- Every API error shows a clear, user-safe message from the common handler (NFR-25); a 401 logs the user out with a "session expired" message; forms can't be submitted twice.
- Fee status (Paid / Partially Paid / Pending / Overdue) and outstanding amount are correct for any month, including pro-rated first months; the BE calculates them.
- Fees page: same table, pagination, search and filters as Students, plus a month picker; only Edit, Send Payment Reminder and Payment History actions (no Add/Delete); student and parent details can't be edited there; each payment is kept as its own record.
- Send Payment Reminder appears only for Pending / Partially Paid / Overdue months with an outstanding balance, opens WhatsApp with the **parent's** number and a pre-filled message (parent name, student name, Student ID, due date, latest outstanding amount), never sends automatically, and is recorded as Initiated (never falsely marked Sent/Delivered).
- Payment History shows payments and reminders separately (channel, type, contact, timestamp, status).
- All fee/payment APIs are admin-only; automated reminders (later) never duplicate a stage and skip fully paid months.
- Dashboard numbers match the underlying data.
- Students see fee due/overdue notifications in-app.
- App is deployed with a working demo login.
- Every page works without horizontal scrolling or clipped content on 360px phones, flip and fold phones, tablets and large desktops (NFR-23).

---

## 12. Future: Mobile App (later phase)

A mobile app for TutorDesk is planned after the web app is complete. It is **not** part of the core version, but decisions made now must not block it.

- **Scope (TBD):** likely the student/parent portal (attendance, fees, notifications) plus quick admin actions such as marking attendance and recording payments.
- **Technology (open question):** React Native (Expo) sharing TypeScript code with the web app, or wrapping the web app with Capacitor / shipping it as a PWA. Decide before the mobile milestone starts.
- **Rules that apply to the web app now, so the app can reuse its work:**
  - Business logic stays out of components (NFR-18): validation, payload builders, formatters, constants, API endpoints and interfaces are plain TypeScript with no DOM/browser dependencies, so they can be shared.
  - The BE API stays client-agnostic: JSON REST only, no web-only behaviour, consistent error shape (NFR-2), one contract (§7) for web and mobile.
  - The web app is fully responsive and touch-friendly (NFR-23), which also covers the Capacitor/PWA route.
- **Auth for native apps (open question, affects `tutordesk-be`):** the web app keeps the JWT in an httpOnly cookie. A native app usually can't rely on cookies, so the BE will likely also need to accept a token in the `Authorization: Bearer` header (kept in the device's secure storage) for mobile clients. Agree the approach before the mobile milestone and mirror it in both repos.

---

## 13. Backend Implementation Spec (`tutordesk-be`)

Everything the BE needs so the **existing FE pages (Login, Students, Fees) work against it without FE code changes** — only `.env.local` changes (§13.9). The FE already runs against an in-memory mock that behaves as described here; when the BE and the mock disagree, this section and §6/§7 win and the mock gets fixed.

### 13.1 Stack
- **Node.js 20+ LTS, Express 5** (or 4), **MongoDB + Mongoose 8**, ES modules.
- **Language: TypeScript recommended** (same conventions as the FE: explicit types, interfaces in their own files, arrow functions, constants instead of literals). Decide at setup; plain JS with JSDoc is acceptable.
- `bcrypt` (or `bcryptjs`), `jsonwebtoken`, `cookie-parser`, `cors`, `helmet`, `express-rate-limit`, **`zod`** for request validation, **`validator`** for the same field rules the FE uses (`isMobilePhone(…, "en-IN")`, `isStrongPassword`, `isEmail`, `isAlpha`) so FE and BE accept exactly the same values, `dotenv`.
- Tests: Jest (or Vitest) + Supertest + `mongodb-memory-server`.
- Dev: `nodemon` / `tsx watch`; ESLint + Prettier.

### 13.2 Folder structure
```text
tutordesk-be/
  src/
    config/        env.ts (reads + validates env vars once), db.ts (Mongoose connect)
    constants/     roles, payment statuses/methods, reminder enums, grades, subjects, error messages, limits
    models/        User, Student, Counter, FeeRecord, Payment, ReminderLog (Attendance, Notification later)
    validators/    zod schemas per route (auth, student, fee, reminder, list queries)
    middleware/    requireAuth (cookie → req.user), requireRole('ADMIN'|'STUDENT'), validate(schema), notFound, errorHandler
    services/      authService, studentService, studentCodeService (Counter), feeService (records, status, lists), reminderService
    controllers/   thin: read req → call service → send response
    routes/        auth.routes, student.routes, fee.routes → mounted under /api
    utils/         dates (today/currentMonth in APP_TIMEZONE, days in month), money, ApiError class, toJSON transform
    seeders/       seedAdmin (idempotent) + counter init; optional seedDemoData (dev only)
    app.ts         express app (helmet, cors, json, cookie-parser, routes, 404, error handler)
    server.ts      connect DB, listen
  tests/
  .env.example     placeholders only
  REQUIREMENTS.md  identical copy of the FE repo's file (§13.10)
  CLAUDE.md, README.md, package.json
```
Same layering idea as the FE (NFR-26): routes → controllers → services → models; no DB calls in controllers, no HTTP objects in services.

### 13.3 Environment variables (`.env.example`, placeholders only)
| Var | Example / default | Notes |
|---|---|---|
| `NODE_ENV` | `development` | `production` on Render |
| `PORT` | `5000` | |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/tutordesk` | Atlas URI in production |
| `JWT_SECRET` | *(long random string)* | required; never committed |
| `JWT_EXPIRES_IN` | `7d` | cookie `maxAge` matches |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin (Vercel URL in production) |
| `APP_TIMEZONE` | `Asia/Kolkata` | "today", "this month", overdue checks |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | placeholders | seeder only; password must pass `isStrongPassword` |
| `ADMIN_CENTER_NAME`, `ADMIN_BRANCH`, `ADMIN_CITY`, `ADMIN_STATE` | optional | editable later in Settings |
| `FEE_DUE_DAY` | `10` | seeder default for the admin's `feeDueDay` |
| `STUDENT_CODE_START` | `100000001` | first Student ID number |
The app refuses to start if a required var is missing.

### 13.4 Auth, cookies, CORS
- **Login:** find the user by identifier (FR-2; admin by lower-cased email + role ADMIN, student by upper-cased studentCode + role STUDENT), `bcrypt.compare`, refuse a student whose Student has `deletedAt`. Always the same 401 message so accounts can't be probed.
- **JWT** payload `{ sub: userId, role }`, signed with `JWT_SECRET`, expiry `JWT_EXPIRES_IN`.
- **Cookie** name `tutordesk_token`: `httpOnly: true`, `path: '/'`, `maxAge` = token expiry; production `secure: true, sameSite: 'none'` (FE on Vercel, BE on Render = different sites); development `secure: false, sameSite: 'lax'` (`localhost:5173` → `localhost:5000` counts as same-site, so the cookie is sent).
- **Logout** clears the cookie with the same options.
- **requireAuth:** reads the cookie, verifies the JWT, loads the user (and for students checks the Student isn't deleted) → `req.user`; any failure → **401** `{ message: "Your session has expired. Please log in again." }`. The FE then logs the user out and shows the login page (NFR-25).
- **requireRole:** wrong role → **403** `{ message: "You do not have permission to perform this action." }`.
- **CORS:** `origin: CLIENT_URL`, `credentials: true`, methods GET/POST/PATCH/PUT/DELETE.
- **Rate limit** `POST /api/auth/login` (e.g. 10 per 15 min per IP) → 429 with a message.
- `helmet()`; JSON body limit (e.g. 100 kb); never log passwords, hashes, tokens or cookies.

### 13.5 Error handling (matches the FE's shared handler, NFR-25)
- One `ApiError(status, message, errors?)` class thrown from services; one Express error middleware turns it into `{ message, errors? }`.
- Zod failures → **422** `{ message: "Please check the submitted information and try again.", errors: { field: message } }` (field = body/query key; messages = the FE's `VALIDATION_MESSAGES` wording where one exists).
- Business rules → **400** with a specific message; duplicates / nothing outstanding → **409**; unknown or deleted records → **404**; unknown routes → **404** `{ message: "Not found." }`.
- Malformed JSON → 400; invalid UUID in a URL → 404.
- Anything unexpected → log it server-side, respond **500** `{ message: "Something went wrong on the server. Please try again later." }` — never the stack or DB error text.
- Messages are short (FE ignores 4xx messages over 200 characters) and user-safe.

### 13.6 Validation rules (identical to the FE — sanitise → validate → save, NFR-16/17)
Trim every string (except passwords) before validating; lower-case emails; remove ` -()` from phone numbers.

| Field | Rule (BE = FE) |
|---|---|
| `identifier` (login) | required; email, or `S` + 9 digits |
| `firstName`, `lastName`, `parentName` | required; letters and spaces only (`isAlpha(v, "en-US", { ignore: " " })`) |
| `email` | optional (`null` when empty); valid email; unique among **current** students → 409 |
| `phone` | optional; if empty → `parentPhone`; else `isMobilePhone(v, "en-IN")` |
| `parentPhone` | required; `isMobilePhone(v, "en-IN")` |
| `grade` | one of `Class 1` … `Class 12` |
| `subjects` | array, ≥ 1, each from: Mathematics, Science, Physics, Chemistry, Biology, English, Hindi, Tamil, Social Science, Computer Science, Accountancy, Economics (same list as FE `SUBJECT_OPTIONS`) |
| `monthlyFee` | integer paise, 100 – 10,000,000 (₹1–₹1,00,000), whole rupees (multiple of 100) |
| `joinDate` | valid `YYYY-MM-DD` |
| `password` (add student) | `isStrongPassword` defaults: 8+ chars, upper, lower, number, symbol |
| `totalFee` | integer paise, 0 – 10,000,000, multiple of 100, ≥ paid so far (400) |
| `dueDate` | valid `YYYY-MM-DD` |
| `payment` | `null`, or `{ amount: integer ≥ 100, multiple of 100, ≤ outstanding after the new total (400); paidOn: valid date ≤ today; method: CASH/UPI/BANK_TRANSFER/CARD/OTHER }` |
| reminder body | `channel` WHATSAPP, `type` MANUAL, `contact` required |
| list queries | `page` ≥ 1, `limit` 1–100, `paymentStatus` from the enum, `paidFrom`/`paidTo` valid dates (from > to → 422), `month` `YYYY-MM` ≤ current month |

### 13.7 Fee logic (FR-23–FR-29) — the BE is the only place this is calculated
- **Fee records are created on demand:** before listing a month (`GET /fees`, and the current month for `GET /students` and `POST /students`), upsert a FeeRecord for every current student who had joined by the last day of that month and has none yet (`bulkWrite` with `updateOne … $setOnInsert`, `upsert: true`; the unique `{ studentId, month }` index makes concurrent requests safe).
- **Default totalFee:** the student's `monthlyFee`; in the joining month pro-rated: `round_to_rupee(monthlyFee × (daysInMonth − joinDay + 1) ÷ daysInMonth)`.
- **Default dueDate:** `month-DD` with the admin's `feeDueDay`; in the joining month, the join date if it is later.
- A later change to a student's monthly fee or join date does **not** rewrite existing fee records (only months created afterwards use the new values — confirm, see open questions).
- **Calculated per fee record** (aggregation `$lookup` on payments): `paidAmount = Σ payments.amount`, `outstandingAmount = totalFee − paidAmount`, `lastPaymentDate` / `lastPaymentMethod` from the newest payment (by `paidOn`, then `createdAt`).
- **Status (FR-26)** with `today` in `APP_TIMEZONE`: outstanding ≤ 0 → `PAID`; else today > dueDate → `OVERDUE`; else paidAmount > 0 → `PARTIAL`; else `PENDING`.
- **Lists** (`/students` and `/fees`): one aggregation — match current students (+ joined-by for fees) → join the month's fee record and its payments → compute fields → apply `search`, `paymentStatus`, `paidFrom/paidTo` → sort by student `createdAt` desc → `$facet` for the page and the total. Escape `search` before using it in a regex.
- **PATCH /fees/:feeId:** load the record + payments, check the student isn't deleted (404), validate the rules above, update `totalFee`/`dueDate`/`updatedBy`, insert the Payment if present (in a transaction when the DB supports it), return the recalculated record.
- **Reminders:** check the record exists and the student is current (404), outstanding > 0 (409), insert a ReminderLog with status `INITIATED`; never call WhatsApp.
- **Soft delete** of a student also stops all future fee records and reminders for them; existing payments and reminder logs stay.

### 13.8 Seeder (`npm run seed`)
- Idempotent: if an ADMIN exists, do nothing (log "admin already exists"). Otherwise create it from env vars (hashed password, center details, `feeDueDay`).
- Create the `studentCode` counter at `STUDENT_CODE_START − 1` if missing (never lower an existing value).
- Optional `npm run seed:demo` (development only, refuses in production): a few demo students with mixed payments, similar to the FE mock, for testing the pages.
- Run `syncIndexes()` (or create indexes) at startup in development.

### 13.9 API integration plan for the existing FE pages
Build and connect in this order; after each step, run the FE with the mock off and check the page.

1. **Setup:** repo, Express app, env validation, Mongo connection, `GET /api/health` → `{ status: "ok" }`, error middleware, CORS + cookies.
2. **Auth:** models User + Counter, seeder, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, requireAuth/requireRole.
   **FE switch:** in `tutordesk-fe/.env.local` set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=http://localhost:5000/api`, restart `npm run dev`.
   Check: wrong password → "Invalid email, Student ID or password."; admin login → dashboard with the center name; refresh keeps you logged in (`/auth/me`); logout; a request after the cookie is deleted → back to login with "session expired".
3. **Students:** Student model + service, `GET/POST/PATCH/DELETE /students` (+ the current-month fee record for `currentPayment`, §13.7).
   Check on the Students page: list/pagination (10/20/50), search by ID and name, status and date filters, Reset; add (toast shows the new Student ID, phone falls back to the parent's), duplicate email (409 → message under Email), edit, delete (soft — row gone, ID never reused, email reusable), edit/delete a student deleted in another tab (404 → message, list reloads); 422 field errors appear under the fields.
4. **Fees:** FeeRecord, Payment, ReminderLog, `GET /fees`, `PATCH /fees/:feeId`, `GET /students/:id/payment-history`, `POST /fees/:feeId/reminders`.
   Check on the Fees page: month picker, totals and statuses, filters, Edit (total below paid → 400 message, payment above outstanding → 400, record a payment → status/outstanding update, Students page shows it), Payment History (payments + reminders, newest first), Send reminder (WhatsApp opens with the parent's number; reminder appears as Initiated; nothing outstanding → 409 message).
5. **Hardening:** rate limit, helmet, tests (auth, student CRUD + soft delete + Student ID counter, fee status/pro-rating/outstanding rules, reminder 409), README.
6. When everything works against the BE: decide when to delete the FE mocks (`src/api/mocks/`, `IS_MOCK_API_ENABLED`, `VITE_USE_MOCK_API`) — see CLAUDE.md open questions.

### 13.10 Keeping FE and BE in sync
- **This file is identical in both repos.** Any change to requirements, the data model (§6), the API contract (§7) or this section is made in one repo and copied to the other in the same session — never edited in only one place. The "Last updated" line at the top changes with every edit, so the two copies are easy to compare.
- FE source of the contract: `src/api/apiEndpoints.ts`, `src/api/interfaces/*`, `src/constants/*` (enums, grades, subjects, limits), `src/constants/validation.ts` (rules + messages). BE constants and zod schemas must use the same values.
- If the BE needs a different shape, change §7 first, then both codebases — don't add BE-only fields or rename fields silently.
- Open points to settle while building the BE (also in CLAUDE.md): correcting a wrong payment (adjustment vs void), whether fee records follow monthly-fee / join-date changes, success-message shape, mobile-app (Bearer token) auth later.
