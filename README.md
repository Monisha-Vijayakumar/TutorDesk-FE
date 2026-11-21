# TutorDesk — Frontend

TutorDesk is a dashboard for small tuition centers. The tutor (admin) manages students, batches and monthly fees in one place, sees who has paid, partly paid, is pending or overdue, and sends payment reminders to parents on WhatsApp with one click.

This repo is the React frontend. The API lives in a separate repo (`tutordesk-be`, Node.js / Express / MongoDB).

## Features

- **Landing page** with a short demo video and a login link
- **Login** for the tutor (no public sign-up — the admin account is created on the server)
- **Dashboard** — totals for students, batches, fees collected and outstanding; fee collection chart with a period filter; collection rate; payment status of the month; students per batch
- **Students** — add, edit, delete, search and filter; each student gets a Student ID
- **Batch Management** — create batches, set an optional time, assign students, search and filter by time
- **Fees** — monthly fee records, record payments (Cash, UPI, Bank Transfer, Card, Other), payment history, WhatsApp reminders to parents
- **Settings** — profile and center details, password change (forced on first login)
- Works on phones, foldables, tablets and large desktops

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · Redux Toolkit · React Router · axios · Recharts · TanStack Table · validator · DOMPurify

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:5173.

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API URL, e.g. `http://localhost:5000/api` |
| `VITE_USE_MOCK_API` | `true` uses built-in demo data instead of the backend (development only, ignored in production builds) |

With the mock API on, log in as `admin@tutordesk.com` / `Demo@1234`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  api/         API client, services, endpoints, messages, dev mocks
  components/  shared and feature components (shadcn/ui primitives in ui/)
  constants/   shared constants
  hooks/       custom hooks
  interfaces/  TypeScript types for forms, state and props
  layouts/     public, auth, admin and settings layouts
  pages/       public, admin and student pages
  routes/      router config and route guards
  store/       Redux slices
  utils/       validation, payload builders, formatters
```

## Deployment

Deployed on Vercel. `vercel.json` rewrites all routes to `index.html` so client-side routing works. Set `VITE_API_BASE_URL` in the Vercel project settings.

The session uses an httpOnly cookie set by the backend, so the backend must allow the frontend's origin with credentials.
