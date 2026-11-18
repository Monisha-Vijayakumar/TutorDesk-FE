import { GraduationCap } from "lucide-react"
import { Link, Outlet } from "react-router"
import { PATHS } from "@/routes/paths"

/** Centered layout for login/signup cards. */
export function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-10">
      <Link to={PATHS.home} className="flex items-center gap-2 font-heading text-lg font-semibold">
        <GraduationCap className="size-6" />
        TutorDesk
      </Link>
      <Outlet />
    </div>
  )
}
