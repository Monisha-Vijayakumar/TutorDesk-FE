import { useState, type SubmitEvent } from "react"
import { toast } from "sonner"
import { getApiError } from "@/api/apiErrorHandler"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { FormField } from "@/components/FormField"
import { FormTextareaField } from "@/components/FormTextareaField"
import { RequiredFieldsNote } from "@/components/RequiredFieldMarkers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MAX_FEE_DUE_DAY, MIN_FEE_DUE_DAY } from "@/constants/fees"
import { SETTINGS_PAGE_TITLES } from "@/constants/navigation"
import { USER_ROLE_LABELS } from "@/constants/userRoles"
import { useForm } from "@/hooks/useForm"
import type { ProfileFormProps } from "@/interfaces/settings"
import { updateProfile } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"
import { sanitizeFormValues } from "@/utils/sanitize"
import { buildUpdateProfilePayload, getProfileFormValues } from "@/utils/settingsPayload"
import { validateProfileForm } from "@/utils/settingsValidation"
import { getFormErrorsFromApi, hasValidationErrors } from "@/utils/validation"

const SECTION_TITLE_CLASS = "text-sm font-semibold text-foreground"
// Two columns when the content area is wide enough, one on phones (container query, NFR-23).
const FIELD_GRID_CLASS = "grid gap-4 @xl:grid-cols-2"

// Settings → Profile, pre-filled with the logged-in user's details. Email and role are shown but
// can't be changed; there is no password here (Update Password does that).
export const ProfileForm = ({ user }: ProfileFormProps) => {
  const dispatch = useAppDispatch()
  const { formValues, setFormErrors, getFieldProps } = useForm(getProfileFormValues(user))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const sanitizedValues = sanitizeFormValues(formValues)
    const validationErrors = validateProfileForm(sanitizedValues)
    setFormErrors(validationErrors)
    if (hasValidationErrors(validationErrors)) {
      return
    }

    setIsSubmitting(true)
    const result = await dispatch(updateProfile(buildUpdateProfilePayload(sanitizedValues)))
    setIsSubmitting(false)

    if (updateProfile.fulfilled.match(result)) {
      toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED)
      return
    }

    const apiError = result.payload ?? getApiError(result.error)
    toast.error(apiError.message)
    setFormErrors(getFormErrorsFromApi(apiError, sanitizedValues))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{SETTINGS_PAGE_TITLES.PROFILE}</CardTitle>
          <CardDescription>Your account and tuition center details.</CardDescription>
        </CardHeader>

        <CardContent className="gap-6">
          <RequiredFieldsNote />

          <section className="flex flex-col gap-4">
            <h3 className={SECTION_TITLE_CLASS}>Account</h3>
            <div className={FIELD_GRID_CLASS}>
              <FormField id="email" label="Email" value={user.email ?? ""} readOnly disabled hint="Email can't be changed." />
              <FormField id="role" label="Role" value={USER_ROLE_LABELS[user.role]} readOnly disabled />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className={SECTION_TITLE_CLASS}>Personal details</h3>
            <div className={FIELD_GRID_CLASS}>
              <FormField label="Name" isRequired autoComplete="name" {...getFieldProps("name")} />
              <FormField
                label="Phone number"
                isRequired
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                {...getFieldProps("phone")}
              />
            </div>
            <FormTextareaField label="Address" isRequired rows={3} autoComplete="street-address" {...getFieldProps("address")} />
          </section>

          <section className="flex flex-col gap-4">
            <h3 className={SECTION_TITLE_CLASS}>Center details</h3>
            <div className={FIELD_GRID_CLASS}>
              <FormField label="Center name" isRequired autoComplete="organization" {...getFieldProps("centerName")} />
              <FormField label="Branch" autoComplete="off" {...getFieldProps("branch")} />
              <FormField label="City" isRequired autoComplete="address-level2" {...getFieldProps("city")} />
              <FormField label="State" isRequired autoComplete="address-level1" {...getFieldProps("state")} />
              <FormField
                label="Fee due day"
                isRequired
                inputMode="numeric"
                autoComplete="off"
                hint={`Day of the month fees are due (${MIN_FEE_DUE_DAY}–${MAX_FEE_DUE_DAY}). Applies to fee months created from now on.`}
                {...getFieldProps("feeDueDay")}
              />
            </div>
          </section>
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
