import { useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router"
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
import { PATHS } from "@/routes/paths"
import { signupUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"
import { isValidEmail, MIN_PASSWORD_LENGTH } from "@/utils/validation"

// Admin signup only (FR-1, REQUIREMENTS §5.1).
const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  centerName: "",
  branch: "",
  city: "",
  state: "",
}

type FormState = typeof initialForm
type Errors = Partial<Record<keyof FormState, string>>

export function SignupPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validate(): Errors {
    const next: Errors = {}
    if (!form.name.trim()) next.name = "Name is required."
    if (!form.email.trim()) next.email = "Email is required."
    else if (!isValidEmail(form.email)) next.email = "Enter a valid email address."
    if (!form.password) next.password = "Password is required."
    else if (form.password.length < MIN_PASSWORD_LENGTH)
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match."
    if (!form.centerName.trim()) next.centerName = "Center name is required."
    if (!form.city.trim()) next.city = "City is required."
    if (!form.state.trim()) next.state = "State is required."
    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setServerError(null)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const result = await dispatch(
      signupUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        centerName: form.centerName.trim(),
        branch: form.branch.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
      })
    )
    setSubmitting(false)

    if (signupUser.fulfilled.match(result)) {
      navigate(PATHS.adminDashboard, { replace: true })
    } else {
      setServerError(result.payload ?? "Signup failed.")
    }
  }

  const field = (name: keyof FormState) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    error: errors[name],
  })

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-xl">Create your tutor account</CardTitle>
        <CardDescription>Set up your tuition center in under a minute.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate className="contents">
        <CardContent className="gap-4">
          <FormError message={serverError} />

          <FormField label="Full name" autoComplete="name" {...field("name")} />
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...field("email")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Password"
              type="password"
              autoComplete="new-password"
              {...field("password")}
            />
            <FormField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              {...field("confirmPassword")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Center name" autoComplete="organization" {...field("centerName")} />
            <FormField label="Branch (optional)" {...field("branch")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="City" autoComplete="address-level2" {...field("city")} />
            <FormField label="State" autoComplete="address-level1" {...field("state")} />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to={PATHS.login} className="font-medium text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
