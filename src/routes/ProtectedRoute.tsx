import { Navigate, Outlet, useLocation } from "react-router"
import { FullPageLoader } from "@/components/FullPageLoader"
import { useAppSelector } from "@/store/hooks"
import type { Role } from "@/types/auth"
import { PATHS } from "./paths"

interface ProtectedRouteProps {
  /** Roles allowed through. Omit to allow any logged-in user. */
  allowedRoles?: Role[]
}

/** Requires a logged-in user (and optionally a role) — FR-6. */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, sessionStatus } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (sessionStatus !== "ready") return <FullPageLoader />

  if (!user) {
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={PATHS.unauthorized} replace />
  }

  return <Outlet />
}
