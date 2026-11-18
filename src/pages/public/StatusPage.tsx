import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { PATHS } from "@/routes/paths"

interface StatusPageProps {
  code: string
  title: string
  message: string
}

/** Friendly full-page message with a link home (404 / Unauthorized). */
function StatusPage({ code, title, message }: StatusPageProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">{code}</p>
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="max-w-sm text-muted-foreground">{message}</p>
      <Link to={PATHS.home} className={buttonVariants({ className: "mt-2" })}>
        Go home
      </Link>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <StatusPage code="404" title="Page not found" message="The page you're looking for doesn't exist." />
  )
}

export function UnauthorizedPage() {
  return (
    <StatusPage
      code="403"
      title="Access denied"
      message="You don't have permission to view this page."
    />
  )
}
