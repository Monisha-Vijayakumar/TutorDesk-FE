import { useState, type SubmitEvent } from "react"
import { ShieldAlert } from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { getApiError } from "@/api/apiErrorHandler"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { FormField } from "@/components/FormField"
import { RequiredFieldsNote } from "@/components/RequiredFieldMarkers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SETTINGS_PAGE_TITLES } from "@/constants/navigation"
import { useForm } from "@/hooks/useForm"
import { getHomePathForRole } from "@/routes/paths"
import { changePassword, selectCurrentUser } from "@/store/authSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { buildChangePasswordPayload, getEmptyChangePasswordFormValues } from "@/utils/settingsPayload"
import { validateChangePasswordForm } from "@/utils/settingsValidation"
import { getFormErrorsFromApi, hasValidationErrors } from "@/utils/validation"

// Settings → Update Password. After the first login (mustChangePassword) every admin page redirects
// here until the seeded password is replaced; then the user goes on to the dashboard.
export const UpdatePasswordPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectCurrentUser)
  const { formValues, setFormErrors, getFieldProps, resetForm } = useForm(getEmptyChangePasswordFormValues())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isPasswordChangeRequired = Boolean(currentUser?.mustChangePassword)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    // Passwords are validated and sent exactly as typed (no sanitizing).
    const validationErrors = validateChangePasswordForm(formValues)
    setFormErrors(validationErrors)
    if (hasValidationErrors(validationErrors)) {
      return
    }

    setIsSubmitting(true)
    const result = await dispatch(changePassword(buildChangePasswordPayload(formValues)))
    setIsSubmitting(false)

    if (changePassword.rejected.match(result)) {
      const apiError = result.payload ?? getApiError(result.error)
      toast.error(apiError.message)
      setFormErrors(getFormErrorsFromApi(apiError, formValues))
      return
    }

    toast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED)
    if (isPasswordChangeRequired && currentUser) {
      navigate(getHomePathForRole(currentUser.role), { replace: true })
      return
    }
    resetForm()
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      {isPasswordChangeRequired && (
        <div
          role="status"
          className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            For your security, replace the password you were given before using TutorDesk. The other pages open
            once it's updated.
          </p>
        </div>
      )}

      {/* Same card layout as Settings → Profile. */}
      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{SETTINGS_PAGE_TITLES.UPDATE_PASSWORD}</CardTitle>
            <CardDescription>Enter your current password, then choose a new one.</CardDescription>
          </CardHeader>

          <CardContent className="gap-4">
            <RequiredFieldsNote />
            <FormField
              label="Current password"
              isRequired
              type="password"
              autoComplete="current-password"
              {...getFieldProps("currentPassword")}
            />
            <FormField
              label="New password"
              isRequired
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol."
              {...getFieldProps("newPassword")}
            />
            <FormField
              label="Confirm new password"
              isRequired
              type="password"
              autoComplete="new-password"
              {...getFieldProps("confirmPassword")}
            />
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update password"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
