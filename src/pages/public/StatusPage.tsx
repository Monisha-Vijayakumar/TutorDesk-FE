import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import type { StatusPageProps } from "@/interfaces/common"
import { PATHS } from "@/routes/paths"

const StatusPage = ({ statusCode, title, message }: StatusPageProps) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">{statusCode}</p>
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="max-w-sm text-muted-foreground">{message}</p>
      <Link to={PATHS.home} className={buttonVariants({ className: "mt-2" })}>
        Go home
      </Link>
    </div>
  )
}

export const NotFoundPage = () => {
  return (
    <StatusPage
      statusCode="404"
      title="Page not found"
      message="The page you're looking for doesn't exist."
    />
  )
}

export const UnauthorizedPage = () => {
  return (
    <StatusPage
      statusCode="403"
      title="Access denied"
      message="You don't have permission to view this page."
    />
  )
}
