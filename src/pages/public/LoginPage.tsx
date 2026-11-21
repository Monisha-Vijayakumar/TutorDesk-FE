import { useEffect, useState, type SubmitEvent } from "react"
import { useLocation, useNavigate } from "react-router"
import { toast } from "sonner"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import { DEMO_ACCOUNTS } from "@/api/mocks/mockAuthService"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { AuthFormCard } from "@/components/AuthFormCard"
import { FormField } from "@/components/FormField"
import { IS_MOCK_API_ENABLED, SESSION_EXPIRED_TOAST_ID } from "@/constants/app"
import { USER_ROLES } from "@/constants/userRoles"
import { useForm } from "@/hooks/useForm"
import type { LoginFormValues } from "@/interfaces/auth"
import type { LoginRedirectState } from "@/interfaces/routes"
import { getPathAfterLogin } from "@/routes/paths"
import { loginUser, selectIsSessionExpired } from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { buildLoginPayload } from "@/utils/authPayload"
import { validateLoginForm } from "@/utils/authValidation"
import { sanitizeFormValues } from "@/utils/sanitize"
import { hasValidationErrors } from "@/utils/validation"

const EMPTY_LOGIN_FORM_VALUES: LoginFormValues = {
  identifier: "",
  password: "",
}

// Demo mode: the admin login is filled in, so one click opens the dashboard.
const getDemoAdminLoginFormValues = (): LoginFormValues => {
  const demoAdmin = DEMO_ACCOUNTS.find((account) => account.user.role === USER_ROLES.ADMIN)
  return demoAdmin
    ? { identifier: demoAdmin.identifier, password: demoAdmin.password }
    : EMPTY_LOGIN_FORM_VALUES
}

const INITIAL_LOGIN_FORM_VALUES = IS_MOCK_API_ENABLED
  ? getDemoAdminLoginFormValues()
  : EMPTY_LOGIN_FORM_VALUES

// Shows only the email login for now: the student portal is on hold, so the UI says nothing about
// Student IDs. The form, validation and API still accept a Student ID (identifier), ready for later.
export const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectState = location.state as LoginRedirectState | null

  const { formValues, setFormErrors, getFieldProps } = useForm(INITIAL_LOGIN_FORM_VALUES)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSessionExpired = useAppSelector(selectIsSessionExpired)

  // Sent here because a request answered 401: say why (the fixed id keeps it to one toast).
  useEffect(() => {
    if (isSessionExpired) {
      toast.error(ERROR_MESSAGES.SESSION_EXPIRED, { id: SESSION_EXPIRED_TOAST_ID })
    }
  }, [isSessionExpired])

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const sanitizedValues = sanitizeFormValues(formValues, ["password"])
    const validationErrors = validateLoginForm(sanitizedValues)
    setFormErrors(validationErrors)
    if (hasValidationErrors(validationErrors)) {
      return
    }

    setIsSubmitting(true)
    const result = await dispatch(loginUser(buildLoginPayload(sanitizedValues)))
    setIsSubmitting(false)

    if (loginUser.rejected.match(result)) {
      toast.error(result.payload?.message ?? ERROR_MESSAGES.LOGIN_FAILED)
      return
    }

    toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS)
    navigate(getPathAfterLogin(result.payload, redirectState?.requestedPath), { replace: true })
  }

  return (
    <AuthFormCard
      title="Log in"
      submitLabel="Log in"
      submittingLabel="Logging in…"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormField
        label="Email"
        isRequired
        type="text"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        placeholder="you@example.com"
        {...getFieldProps("identifier")}
      />
      <FormField
        label="Password"
        isRequired
        type="password"
        autoComplete="current-password"
        {...getFieldProps("password")}
      />
    </AuthFormCard>
  )
}
