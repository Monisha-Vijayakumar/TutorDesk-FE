import { Link } from "react-router"
import { AppLogo } from "@/components/AppLogo"
import { buttonVariants } from "@/components/ui/button"
import { APP_NAME } from "@/constants/app"
import { PATHS } from "@/routes/paths"

// Shared by the tutor (admin) and students. No public signup: the admin account is created
// by the BE seeder and student accounts are created by the admin.
export const HomePage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <AppLogo size="lg" isNameVisible={false} />
      <h1 className="font-heading text-3xl font-semibold sm:text-4xl">{APP_NAME}</h1>

      <div className="flex max-w-md flex-col gap-2">
        <p className="text-xl font-medium text-foreground">Your tuition center, all in one place.</p>
        <p className="text-sm">
          <span className="font-medium text-foreground">Tutors</span> manage students, batches,
          attendance and fees.
        </p>
        <p className="text-sm">
          <span className="font-medium text-foreground">Students</span> check attendance, fee
          status and batch timings.
        </p>
      </div>

      <Link to={PATHS.login} className={buttonVariants({ size: "lg" })}>
        Log in
      </Link>
    </div>
  )
}
