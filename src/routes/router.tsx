import { createBrowserRouter, Navigate } from "react-router"
import { FullPageLoader } from "@/components/FullPageLoader"
import { USER_ROLES } from "@/constants/userRoles"
import { AuthLayout } from "@/layouts/AuthLayout"
import { PublicLayout } from "@/layouts/PublicLayout"
import { HomePage } from "@/pages/public/HomePage"
import { LoginPage } from "@/pages/public/LoginPage"
import { NotFoundPage, PageLoadErrorPage, UnauthorizedPage } from "@/pages/public/StatusPage"
import { PATHS } from "./paths"
import { ProtectedRoute } from "./ProtectedRoute"
import { PublicOnlyRoute } from "./PublicOnlyRoute"

// Public pages are in the main bundle (almost every visit starts there). Every portal module — the admin
// shell and each admin page, the student portal — is lazy-loaded: its code is downloaded only when the
// user first opens it (React Router `lazy`, one chunk per module; Recharts only comes with the Dashboard).
export const router = createBrowserRouter([
  // Landing page: its own navbar and sections (no background photo).
  { path: PATHS.home, element: <HomePage /> },

  // Login, 404 and Unauthorized share the background image from PublicLayout
  {
    element: <PublicLayout />,
    children: [
      { path: PATHS.unauthorized, element: <UnauthorizedPage /> },

      // Public only: logged-in users are redirected to their home page
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [{ path: PATHS.login, element: <LoginPage /> }],
          },
        ],
      },

      { path: PATHS.notFound, element: <NotFoundPage /> },
    ],
  },

  // Admin: sidebar + top bar. The loader shows while the first module downloads on a direct visit;
  // a module that fails to download (offline, new deploy) shows the error page with Reload.
  {
    path: PATHS.admin,
    element: <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />,
    hydrateFallbackElement: <FullPageLoader />,
    errorElement: <PageLoadErrorPage />,
    children: [
      {
        lazy: async () => ({ Component: (await import("@/layouts/AdminLayout")).AdminLayout }),
        children: [
          { index: true, element: <Navigate to={PATHS.adminDashboard} replace /> },
          {
            path: PATHS.adminDashboard,
            lazy: async () => ({ Component: (await import("@/pages/admin/DashboardPage")).DashboardPage }),
          },
          {
            path: PATHS.adminStudents,
            lazy: async () => ({ Component: (await import("@/pages/admin/StudentsPage")).StudentsPage }),
          },
          {
            path: PATHS.adminBatches,
            lazy: async () => ({ Component: (await import("@/pages/admin/BatchesPage")).BatchesPage }),
          },
          {
            path: PATHS.adminFees,
            lazy: async () => ({ Component: (await import("@/pages/admin/FeesPage")).FeesPage }),
          },
          {
            path: PATHS.adminSettings,
            lazy: async () => ({ Component: (await import("@/layouts/SettingsLayout")).SettingsLayout }),
            children: [
              { index: true, element: <Navigate to={PATHS.adminSettingsProfile} replace /> },
              {
                path: PATHS.adminSettingsProfile,
                lazy: async () => ({
                  Component: (await import("@/pages/admin/settings/ProfileSettingsPage")).ProfileSettingsPage,
                }),
              },
              {
                path: PATHS.adminSettingsPassword,
                lazy: async () => ({
                  Component: (await import("@/pages/admin/settings/UpdatePasswordPage")).UpdatePasswordPage,
                }),
              },
            ],
          },
        ],
      },
    ],
  },

  // Student (portal on hold, placeholder only)
  {
    path: PATHS.student,
    element: <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} />,
    hydrateFallbackElement: <FullPageLoader />,
    errorElement: <PageLoadErrorPage />,
    children: [
      { index: true, element: <Navigate to={PATHS.studentHome} replace /> },
      {
        path: PATHS.studentHome,
        lazy: async () => ({ Component: (await import("@/pages/student/StudentHomePage")).StudentHomePage }),
      },
    ],
  },
])
