import { createBrowserRouter, Navigate } from "react-router"
import { PlaceholderPage } from "@/components/PlaceholderPage"
import { ADMIN_PAGE_TITLES } from "@/constants/navigation"
import { USER_ROLES } from "@/constants/userRoles"
import { AdminLayout } from "@/layouts/AdminLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { PublicLayout } from "@/layouts/PublicLayout"
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { FeesPage } from "@/pages/admin/FeesPage"
import { StudentsPage } from "@/pages/admin/StudentsPage"
import { HomePage } from "@/pages/public/HomePage"
import { LoginPage } from "@/pages/public/LoginPage"
import { NotFoundPage, UnauthorizedPage } from "@/pages/public/StatusPage"
import { StudentHomePage } from "@/pages/student/StudentHomePage"
import { PATHS } from "./paths"
import { ProtectedRoute } from "./ProtectedRoute"
import { PublicOnlyRoute } from "./PublicOnlyRoute"

export const router = createBrowserRouter([
  // Public pages share the background image from PublicLayout
  {
    element: <PublicLayout />,
    children: [
      { path: PATHS.home, element: <HomePage /> },
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

  // Admin: sidebar + top bar. Pages not built yet show a placeholder.
  {
    path: PATHS.admin,
    element: <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to={PATHS.adminDashboard} replace /> },
          { path: PATHS.adminDashboard, element: <DashboardPage /> },
          { path: PATHS.adminStudents, element: <StudentsPage /> },
          { path: PATHS.adminAttendance, element: <PlaceholderPage title={ADMIN_PAGE_TITLES.ATTENDANCE} /> },
          { path: PATHS.adminFees, element: <FeesPage /> },
          { path: PATHS.adminSettings, element: <PlaceholderPage title={ADMIN_PAGE_TITLES.SETTINGS} /> },
        ],
      },
    ],
  },

  // Student (portal on hold, placeholder only)
  {
    path: PATHS.student,
    element: <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} />,
    children: [
      { index: true, element: <Navigate to={PATHS.studentHome} replace /> },
      { path: PATHS.studentHome, element: <StudentHomePage /> },
    ],
  },
])
