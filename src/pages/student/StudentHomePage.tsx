import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/useLogout"
import { selectCurrentUser } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"

// Placeholder. The student portal is on hold until admin pages are done (REQUIREMENTS §5.3).
export const StudentHomePage = () => {
  const currentUser = useAppSelector(selectCurrentUser)
  const logout = useLogout()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <h1 className="font-heading text-2xl font-semibold">Hi, {currentUser?.name}</h1>
      <p className="text-muted-foreground">The student portal is coming soon.</p>
      <Button variant="outline" size="lg" onClick={logout}>
        Log out
      </Button>
    </div>
  )
}
