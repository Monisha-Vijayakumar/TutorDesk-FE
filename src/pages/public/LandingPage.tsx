import { GraduationCap } from "lucide-react"
import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { PATHS } from "@/routes/paths"

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <GraduationCap className="size-12" />
      <h1 className="font-heading text-3xl font-semibold sm:text-4xl">TutorDesk</h1>
      <p className="max-w-md text-muted-foreground">
        Manage students, batches, attendance and fees for your tuition center — all from one
        dashboard.
      </p>
      <div className="flex gap-3">
        <Link to={PATHS.login} className={buttonVariants({ size: "lg" })}>
          Log in
        </Link>
        <Link to={PATHS.signup} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Sign up
        </Link>
      </div>
    </div>
  )
}
