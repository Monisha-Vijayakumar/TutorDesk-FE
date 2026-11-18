import { GraduationCap, LogOut } from "lucide-react"
import { Outlet, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { PATHS } from "@/routes/paths"
import { logoutUser } from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

/**
 * Placeholder admin shell. The sidebar (Dashboard, Students, Batches,
 * Attendance, Fees, Settings) and notification bell come in a later milestone.
 */
export function AdminLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  async function handleLogout() {
    await dispatch(logoutUser())
    navigate(PATHS.login, { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 font-heading font-semibold">
          <GraduationCap className="size-5" />
          {user?.centerName ?? "TutorDesk"}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut />
            Log out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}
