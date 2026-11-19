import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AuthFormCardProps } from "@/interfaces/auth"
import { cn } from "@/lib/utils"

// Card layout for auth forms (login now; change password later).
export const AuthFormCard = ({
  title,
  description,
  submitLabel,
  submittingLabel,
  isSubmitting,
  onSubmit,
  footer,
  children,
  className,
}: AuthFormCardProps) => {
  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl text-center">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate className="contents">
        <CardContent className="gap-4">{children}</CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
          {footer && <p className="text-center text-sm text-muted-foreground">{footer}</p>}
        </CardFooter>
      </form>
    </Card>
  )
}
