import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { PATHS } from "@/routes/paths"
import { logoutUser } from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

/** Placeholder — student portal is on hold until admin pages are done (REQUIREMENTS §5.3). */
export function StudentHomePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  async function handleLogout() {
    await dispatch(logoutUser())
    navigate(PATHS.login, { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="font-heading text-2xl font-semibold">Hi, {user?.name}</h1>
      <p className="text-muted-foreground">The student portal is coming soon.</p>
      <Button variant="outline" onClick={handleLogout}>
        Log out
      </Button>
    </div>
  )
}
