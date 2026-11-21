import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import type { LandingAuthButtonProps } from "@/interfaces/landing"
import { getHomePathForRole, PATHS } from "@/routes/paths"
import { selectCurrentUser } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"

// "Log in" — or, for someone who is already logged in, a shortcut to their own home page.
export const LandingAuthButton = ({ variant = "default", className }: LandingAuthButtonProps) => {
  const currentUser = useAppSelector(selectCurrentUser)

  if (currentUser) {
    return (
      <Link to={getHomePathForRole(currentUser.role)} className={buttonVariants({ variant, size: "lg", className })}>
        Go to my dashboard
      </Link>
    )
  }

  return (
    <Link to={PATHS.login} className={buttonVariants({ variant, size: "lg", className })}>
      Log in
    </Link>
  )
}
