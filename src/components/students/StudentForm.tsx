import { useState, type SubmitEvent } from "react"
import { toast } from "sonner"
import { getApiError, hasApiErrorStatus } from "@/api/apiErrorHandler"
import { HTTP_STATUS } from "@/api/httpStatus"
import type { ApiError } from "@/api/interfaces/common"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { FormCheckboxGroup } from "@/components/FormCheckboxGroup"
import { FormField } from "@/components/FormField"
import { FormSelectField } from "@/components/FormSelectField"
import { RequiredFieldsNote } from "@/components/RequiredFieldMarkers"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { PAYMENT_METHOD_LABELS } from "@/constants/fees"
import { GRADE_OPTIONS, SUBJECT_OPTIONS } from "@/constants/students"
import { EMPTY_CELL_VALUE } from "@/constants/table"
import { useForm } from "@/hooks/useForm"
import type { StudentFormProps, StudentFormValues } from "@/interfaces/students"
import { useAppDispatch } from "@/store/hooks"
import { createStudent, updateStudent } from "@/store/studentSlice"
import { formatDisplayDate } from "@/utils/date"
import { sanitizeFormValues } from "@/utils/sanitize"
import {
  buildCreateStudentPayload,
  buildUpdateStudentPayload,
  getEmptyStudentFormValues,
  getStudentFormValues,
} from "@/utils/studentPayload"
import { getStudentFormErrorsFromApi, validateStudentForm } from "@/utils/studentValidation"
import { hasValidationErrors } from "@/utils/validation"

const SECTION_TITLE_CLASS = "text-sm font-semibold text-foreground"
// Two columns from md up, one on phones (NFR-23).
const FIELD_GRID_CLASS = "grid gap-4 md:grid-cols-2"

// Add form when student is null, edit form otherwise. Values stay in place if saving fails.
// Payment details are read-only here: they come from payments recorded on the Fees page.
export const StudentForm = ({ student, onSaved, onCancel, onStudentNotFound }: StudentFormProps) => {
  const dispatch = useAppDispatch()
  const isNewStudent = student === null
  const { formValues, setFormErrors, setFieldValue, getFieldProps, formErrors } = useForm(
    student ? getStudentFormValues(student) : getEmptyStudentFormValues()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Adds or updates the student. Resolves to null when saved, otherwise to the API error.
  // (A rejected thunk always carries its ApiError as payload; result.error is only a safety net.)
  const saveStudent = async (sanitizedValues: StudentFormValues): Promise<ApiError | null> => {
    if (isNewStudent) {
      const result = await dispatch(createStudent(buildCreateStudentPayload(sanitizedValues)))
      if (createStudent.rejected.match(result)) {
        return result.payload ?? getApiError(result.error)
      }
      toast.success(SUCCESS_MESSAGES.STUDENT_CREATED(result.payload.studentCode))
      return null
    }

    const payload = buildUpdateStudentPayload(sanitizedValues)
    const result = await dispatch(updateStudent({ studentId: student.id, payload }))
    if (updateStudent.rejected.match(result)) {
      return result.payload ?? getApiError(result.error)
    }
    toast.success(SUCCESS_MESSAGES.STUDENT_UPDATED)
    return null
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const sanitizedValues = sanitizeFormValues(formValues, ["password"])
    const validationErrors = validateStudentForm(sanitizedValues, isNewStudent)
    setFormErrors(validationErrors)
    if (hasValidationErrors(validationErrors)) {
      return
    }

    setIsSubmitting(true)
    const apiError = await saveStudent(sanitizedValues)
    setIsSubmitting(false)

    if (!apiError) {
      onSaved()
      return
    }

    toast.error(apiError.message)
    // The student was deleted (e.g. in another tab) while the form was open. Saving can't work,
    // so close the form and reload the list.
    if (hasApiErrorStatus(apiError, HTTP_STATUS.NOT_FOUND)) {
      onStudentNotFound()
      return
    }
    // Values stay in place; field errors from the API show under their fields.
    setFormErrors(getStudentFormErrorsFromApi(apiError, sanitizedValues))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <RequiredFieldsNote />
        <section className="flex flex-col gap-4">
          <h3 className={SECTION_TITLE_CLASS}>Student details</h3>
          {isNewStudent ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              The Student ID is generated automatically when you save.
            </p>
          ) : (
            <FormField id="studentCode" label="Student ID" value={student.studentCode} readOnly disabled />
          )}
          <div className={FIELD_GRID_CLASS}>
            <FormField label="First name" isRequired autoComplete="off" {...getFieldProps("firstName")} />
            <FormField label="Last name" isRequired autoComplete="off" {...getFieldProps("lastName")} />
            <FormField
              label="Email"
              type="email"
              autoComplete="off"
              autoCapitalize="none"
              {...getFieldProps("email")}
            />
            <FormField
              label="WhatsApp number"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="+91 98765 43210"
              hint="Leave empty to use the parent's WhatsApp number."
              {...getFieldProps("phone")}
            />
            <FormSelectField
              id="grade"
              label="Class"
              isRequired
              value={formValues.grade}
              options={GRADE_OPTIONS}
              placeholder="Select a class"
              onValueChange={(value) => setFieldValue("grade", value)}
              error={formErrors.grade}
            />
            <FormField label="Join date" type="date" isRequired {...getFieldProps("joinDate")} />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className={SECTION_TITLE_CLASS}>Parent / guardian</h3>
          <div className={FIELD_GRID_CLASS}>
            <FormField label="Parent name" isRequired autoComplete="off" {...getFieldProps("parentName")} />
            <FormField
              label="Parent WhatsApp number"
              isRequired
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="+91 98765 43210"
              {...getFieldProps("parentPhone")}
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className={SECTION_TITLE_CLASS}>Enrollment and fees</h3>
          <div className={FIELD_GRID_CLASS}>
            <FormField
              label="Monthly fee (₹)"
              isRequired
              inputMode="numeric"
              autoComplete="off"
              placeholder="2000"
              {...getFieldProps("monthlyFee")}
            />
          </div>
          <FormCheckboxGroup
            id="subjects"
            label="Enrolled subjects"
            isRequired
            options={SUBJECT_OPTIONS}
            selectedValues={formValues.subjects}
            onSelectedValuesChange={(subjects) => setFieldValue("subjects", subjects)}
            error={formErrors.subjects}
          />
        </section>

        {isNewStudent ? (
          <section className="flex flex-col gap-4">
            <h3 className={SECTION_TITLE_CLASS}>Login</h3>
            <FormField
              label="Initial password"
              isRequired
              type="password"
              autoComplete="new-password"
              hint="Share it with the student. They must change it the first time they log in."
              {...getFieldProps("password")}
            />
          </section>
        ) : (
          <section className="flex flex-col gap-3">
            <h3 className={SECTION_TITLE_CLASS}>This month's payment</h3>
            <dl className="grid gap-3 rounded-md border p-3 text-sm min-[400px]:grid-cols-3">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={student.currentPayment.status} />
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Date</dt>
                <dd>
                  {student.currentPayment.paidOn
                    ? formatDisplayDate(student.currentPayment.paidOn)
                    : EMPTY_CELL_VALUE}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Method</dt>
                <dd>
                  {student.currentPayment.method
                    ? PAYMENT_METHOD_LABELS[student.currentPayment.method]
                    : EMPTY_CELL_VALUE}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">Payments are recorded on the Fees page.</p>
          </section>
        )}
      </div>

      <div className="flex gap-2 border-t p-4 sm:justify-end">
        <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  )
}
