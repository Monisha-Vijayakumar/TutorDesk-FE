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
| Frontend (`tutordesk-fe`) | React (Vite), React Router, Redux Toolkit, Tailwind CSS, shadcn/ui |
| Backend (`tutordesk-be`) | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | bcrypt (password hashing), jsonwebtoken (JWT in httpOnly cookie) |
| Validation | Zod or Joi (server), inline form validation (client) |
| Charts | Recharts (or Chart.js) |
| Optional (later) | Nodemailer (email reminders), node-cron (scheduled reminders), PDF receipts |

---

## 3. User Roles

| Role | Description | Access |
|---|---|---|
| **Admin (Tutor)** | Owner of the tuition center. Signs up via the public signup page. | Full access to all data and pages. |
| **Student / Parent** | Created by the admin. Logs in with credentials shared by the admin. | Read-only access to their own attendance, fees, batches and notifications. Can change own password. |

---

## 4. Functional Requirements

### 4.1 Authentication & Security
- FR-1: Admin can sign up with name, email, password, and center name.
- FR-2: Passwords are hashed with bcrypt before storing. Plain passwords are never stored or returned.
- FR-3: Login issues a JWT stored in an **httpOnly cookie**.
- FR-4: Logout clears the cookie.
- FR-5: After login, users are redirected based on role (admin → `/admin/dashboard`, student → `/student/home`).
- FR-6: Protected routes on both backend (auth + role middleware) and frontend (route guards).
- FR-7: Students can only access their own records (ownership check in middleware/queries).
- FR-8: Change password requires the current password.
- FR-9: When the admin creates a student, a login account is created for them with an initial password.

### 4.2 Students (Admin)
- FR-10: Create, read, update, delete students.
- FR-11: Student fields: name, email (login), phone, parent name, parent phone, class/grade, monthly fee, join date, active status.
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
| # | Page | Route | Contents |
|---|---|---|---|
| 1 | Landing | `/` | App name, short pitch, Login / Signup buttons |
| 2 | Login | `/login` | Email, password, role-based redirect |
| 3 | Signup | `/signup` | Admin signup only (name, emailid, password, center name, branch, city, state). Profile photo deferred — may be added later. |
| 4 | 404 / Unauthorized | `*`, `/unauthorized` | Friendly message with link home |

### 5.2 Admin pages
**Layout:** sidebar (Dashboard, Students, Batches, Attendance, Fees, Settings), top bar with notification bell + profile menu, collapsible sidebar on mobile.

| # | Page | Route | Contents |
|---|---|---|---|
| 5 | Dashboard | `/admin/dashboard` | Stat cards (total students, active batches, collected this month, pending dues); today's batches with "Mark attendance"; overdue fees (top 5 + View all); charts: monthly collection (bar), attendance % by batch |
| 6 | Students list | `/admin/students` | Table (name, class, batch, fee, status badge, joined date, subject, payment status, send payment pending reminder - to send notification to student/parent), search, filters, pagination; Add/Edit modal or drawer; delete confirm |
| 7 | Student detail | `/admin/students/:id` | Basic Profile info; tabs: Attendance (calendar + %), Fees (payment history), Batches |
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
| 14 | My Attendance | `/student/attendance` | Calendar with present/absent colours, low-attendance warning |
| 15 | My Fees | `/student/fees` | Month-wise paid/pending list and payment history |
| 16 | Profile | `/student/profile` | View details, change password |

### 5.4 Shared UI components
- Reusable `DataTable` (search, filter, pagination)
- `Modal`, `ConfirmDialog`, `Drawer`, `card`, `sidebar`
- `StatusBadge` (Paid / Partial / Pending / Overdue / Present / Absent)
- `StatCard`, chart wrappers
- Toast notifications (success / error)
- Skeleton loaders and empty states ("No students yet — add your first one")
- Inline form validation errors
- Fully responsive (tutors often use phones)

---

## 6. Data Model (Mongoose Schemas)

```text
User
  name, email (unique), passwordHash, role: 'admin' | 'student',
  centerName (admin), feeDueDay (admin, default 10),
  studentId (ref Student, for student role), createdAt, updatedAt

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

ReminderLog (optional, Level 2/3)
  studentId, month, type: 'manual' | 'before_due' | 'on_due' | 'after_due', sentAt
  -- unique index: (studentId, month, type) for scheduled types
```

---

## 7. API Endpoints (draft)

```text
Auth
  POST   /api/auth/signup
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me
  PATCH  /api/auth/change-password

Students (admin)
  GET    /api/students?search=&batch=&center=&city=&status=&page=&limit=
  POST   /api/students
  GET    /api/students/:id
  PATCH  /api/students/:id
  DELETE /api/students/:id

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
- NFR-5: Environment variables via `.env` (never committed); provide `.env.example`.
- NFR-6: Passwords and hashes never returned in API responses.
- NFR-7: Responsive UI, works on mobile widths (≥ 360px).
- NFR-8: Loading, empty and error states on every data page.
- NFR-9: Basic tests (Jest + Supertest) for auth, fee status logic, and clash check.

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
    services/        # API calls (axios instance, baseURL from VITE_API_BASE_URL, withCredentials: true)
    hooks/
    utils/
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
    utils/
    app.js
    server.js
  tests/
  .env.example       # PORT, MONGODB_URI, JWT_SECRET, CLIENT_URL
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
2. **Auth & roles** — signup, login, logout, JWT cookie, middleware, route guards, layouts.
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
- Admin can sign up, log in, and log out; passwords are stored hashed.
- Student accounts can only see their own data; admin routes return 403 for students.
- Admin can fully manage students and batches; overlapping batch assignment is blocked with a clear message.
- Attendance can be marked for a batch/date and edited later; percentages are correct.
- Fee status (Paid / Partial / Pending / Overdue) is correct for any month, including pro-rated first months.
- Dashboard numbers match the underlying data.
- Students see fee due/overdue notifications in-app.
- App is deployed with a working demo login.
