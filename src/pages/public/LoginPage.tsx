import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { FormError } from "@/components/FormError"
import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getHomePath, PATHS } from "@/routes/paths"
import { loginUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"
import { isValidEmail } from "@/utils/validation"

type Errors = Partial<Record<"email" | "password", string>>

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): Errors {
    const next: Errors = {}
    if (!email.trim()) next.email = "Email is required."
    else if (!isValidEmail(email)) next.email = "Enter a valid email address."
    if (!password) next.password = "Password is required."
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setServerError(null)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const result = await dispatch(loginUser({ email: email.trim(), password }))
    setSubmitting(false)

    if (loginUser.fulfilled.match(result)) {
      const user = result.payload
      // Return to the page they were trying to open, if it belongs to their role.
      const target = from?.startsWith(`/${user.role}/`) ? from : getHomePath(user.role)
      navigate(target, { replace: true })
    } else {
      setServerError(result.payload ?? "Login failed.")
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Log in</CardTitle>
        <CardDescription>Welcome back. Enter your details to continue.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate className="contents">
        <CardContent className="gap-4">
          <FormError message={serverError} />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            New tutor?{" "}
            <Link to={PATHS.signup} className="font-medium text-foreground underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
