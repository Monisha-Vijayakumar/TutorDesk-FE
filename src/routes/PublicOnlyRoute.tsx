import { Navigate, Outlet } from "react-router"
import { FullPageLoader } from "@/components/FullPageLoader"
import { useAppSelector } from "@/store/hooks"
import { getHomePath } from "./paths"

/** Login/signup: logged-in users are sent to their role's home page. */
export function PublicOnlyRoute() {
  const { user, sessionStatus } = useAppSelector((state) => state.auth)

  if (sessionStatus !== "ready") return <FullPageLoader />
  if (user) return <Navigate to={getHomePath(user.role)} replace />

  return <Outlet />
}
