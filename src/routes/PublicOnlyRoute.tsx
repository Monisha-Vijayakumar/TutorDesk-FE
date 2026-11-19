import { Navigate, Outlet } from "react-router"
import { FullPageLoader } from "@/components/FullPageLoader"
import { selectCurrentUser, selectIsSessionChecked } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"
import { getHomePathForRole } from "./paths"

// For the login page: users who are already logged in go to their home page.
export const PublicOnlyRoute = () => {
  const currentUser = useAppSelector(selectCurrentUser)
  const isSessionChecked = useAppSelector(selectIsSessionChecked)

  if (!isSessionChecked) {
    return <FullPageLoader />
  }

  if (currentUser) {
    return <Navigate to={getHomePathForRole(currentUser.role)} replace />
  }

  return <Outlet />
}
