import { Navigate, Outlet, useLocation } from "react-router"
import { FullPageLoader } from "@/components/FullPageLoader"
import type { LoginRedirectState, ProtectedRouteProps } from "@/interfaces/routes"
import { selectCurrentUser, selectIsSessionChecked } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"
import { getRequiredPasswordChangePath, PATHS } from "./paths"

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const currentUser = useAppSelector(selectCurrentUser)
  const isSessionChecked = useAppSelector(selectIsSessionChecked)
  const location = useLocation()

  if (!isSessionChecked) {
    return <FullPageLoader />
  }

  if (!currentUser) {
    const redirectState: LoginRedirectState = { requestedPath: location.pathname }
    return <Navigate to={PATHS.login} replace state={redirectState} />
  }

  const isRoleAllowed = !allowedRoles || allowedRoles.includes(currentUser.role)
  if (!isRoleAllowed) {
    return <Navigate to={PATHS.unauthorized} replace />
  }

  // Until the given password is replaced, every other page of the portal sends the user back there.
  const requiredPasswordChangePath = getRequiredPasswordChangePath(currentUser)
  if (requiredPasswordChangePath && location.pathname !== requiredPasswordChangePath) {
    return <Navigate to={requiredPasswordChangePath} replace />
  }

  return <Outlet />
}
