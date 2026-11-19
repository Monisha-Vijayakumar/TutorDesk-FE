import { Link, Outlet } from "react-router"
import { AppLogo } from "@/components/AppLogo"
import { PATHS } from "@/routes/paths"

// Centres the login card under the logo. The background comes from PublicLayout.
export const AuthLayout = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-10">
      <Link to={PATHS.home} aria-label="Go to home page">
        <AppLogo />
      </Link>
      <Outlet />
    </div>
  )
}
