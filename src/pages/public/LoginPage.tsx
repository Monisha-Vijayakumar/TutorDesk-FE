import { useEffect, useState, type SubmitEvent } from "react"
import { useLocation, useNavigate } from "react-router"
import { toast } from "sonner"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { AuthFormCard } from "@/components/AuthFormCard"
import { FormField } from "@/components/FormField"
import { SESSION_EXPIRED_TOAST_ID } from "@/constants/app"
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

const INITIAL_LOGIN_FORM_VALUES: LoginFormValues = {
  identifier: "",
  password: "",
}

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
      description="Tutors use their email. Students use the Student ID shared by their tutor."
      submitLabel="Log in"
      submittingLabel="Logging in…"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <FormField
        label="Email or Student ID"
        isRequired
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        placeholder="e.g. S100000001"
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
