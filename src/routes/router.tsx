import { createBrowserRouter, Navigate } from "react-router"
import { AdminLayout } from "@/layouts/AdminLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { LandingPage } from "@/pages/public/LandingPage"
import { LoginPage } from "@/pages/public/LoginPage"
import { SignupPage } from "@/pages/public/SignupPage"
import { NotFoundPage, UnauthorizedPage } from "@/pages/public/StatusPage"
import { StudentHomePage } from "@/pages/student/StudentHomePage"
import { PATHS } from "./paths"
import { ProtectedRoute } from "./ProtectedRoute"
import { PublicOnlyRoute } from "./PublicOnlyRoute"

export const router = createBrowserRouter([
  // Public
  { path: PATHS.home, element: <LandingPage /> },
  { path: PATHS.unauthorized, element: <UnauthorizedPage /> },

  // Public-only (redirects logged-in users to their home page)
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: PATHS.login, element: <LoginPage /> },
          { path: PATHS.signup, element: <SignupPage /> },
        ],
      },
    ],
  },

  // Admin (protected)
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to={PATHS.adminDashboard} replace /> },
          { path: "dashboard", element: <DashboardPage /> },
        ],
      },
    ],
  },

  // Student (protected) — portal on hold, placeholder only
  {
    path: "/student",
    element: <ProtectedRoute allowedRoles={["student"]} />,
    children: [
      { index: true, element: <Navigate to={PATHS.studentHome} replace /> },
      { path: "home", element: <StudentHomePage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
])
