import { useState, type SubmitEvent } from "react"
import { toast } from "sonner"
import { getApiError, hasApiErrorStatus } from "@/api/apiErrorHandler"
import { HTTP_STATUS } from "@/api/httpStatus"
import type { ApiError } from "@/api/interfaces/common"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { FormField } from "@/components/FormField"
import { FormTextareaField } from "@/components/FormTextareaField"
import { RequiredFieldsNote } from "@/components/RequiredFieldMarkers"
import { Button } from "@/components/ui/button"
import { IS_BATCH_TIME_REQUIRED } from "@/constants/batches"
import { useForm } from "@/hooks/useForm"
import type { BatchFormProps, BatchFormValues } from "@/interfaces/batches"
import { createBatch, updateBatch } from "@/store/batchSlice"
import { useAppDispatch } from "@/store/hooks"
import { buildBatchPayload, getBatchFormValues, getEmptyBatchFormValues } from "@/utils/batchPayload"
import { getBatchFormErrorsFromApi, validateBatchForm } from "@/utils/batchValidation"
import { sanitizeFormValues } from "@/utils/sanitize"
import { hasValidationErrors } from "@/utils/validation"
import { BatchStudentPicker } from "./BatchStudentPicker"

const SECTION_TITLE_CLASS = "text-sm font-semibold text-foreground"

// Add form when batch is null, edit form otherwise (pre-filled, assigned students ticked).
// Values stay in place if saving fails.
export const BatchForm = ({ batch, onSaved, onCancel, onBatchNotFound }: BatchFormProps) => {
  const dispatch = useAppDispatch()
  const isNewBatch = batch === null
  const { formValues, formErrors, setFormErrors, setFieldValue, getFieldProps } = useForm(
    batch ? getBatchFormValues(batch) : getEmptyBatchFormValues()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Adds or updates the batch. Resolves to null when saved, otherwise to the API error.
  const saveBatch = async (sanitizedValues: BatchFormValues): Promise<ApiError | null> => {
    const payload = buildBatchPayload(sanitizedValues)

    if (isNewBatch) {
      const result = await dispatch(createBatch(payload))
      if (createBatch.rejected.match(result)) {
        return result.payload ?? getApiError(result.error)
      }
      toast.success(SUCCESS_MESSAGES.BATCH_CREATED)
      return null
    }

    const result = await dispatch(updateBatch({ batchId: batch.id, payload }))
    if (updateBatch.rejected.match(result)) {
      return result.payload ?? getApiError(result.error)
    }
    toast.success(SUCCESS_MESSAGES.BATCH_UPDATED)
    return null
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const sanitizedValues = sanitizeFormValues(formValues)
    const validationErrors = validateBatchForm(sanitizedValues)
    setFormErrors(validationErrors)
    if (hasValidationErrors(validationErrors)) {
      return
    }

    setIsSubmitting(true)
    const apiError = await saveBatch(sanitizedValues)
    setIsSubmitting(false)

    if (!apiError) {
      onSaved()
      return
    }

    toast.error(apiError.message)
    // The batch was deleted (e.g. in another tab) while the form was open: close and reload the list.
    if (hasApiErrorStatus(apiError, HTTP_STATUS.NOT_FOUND)) {
      onBatchNotFound()
      return
    }
    setFormErrors(getBatchFormErrorsFromApi(apiError, sanitizedValues))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <RequiredFieldsNote />
        <section className="flex flex-col gap-4">
          <h3 className={SECTION_TITLE_CLASS}>Batch details</h3>
          <FormField label="Batch name" isRequired autoComplete="off" {...getFieldProps("name")} />
          <FormTextareaField label="Description" rows={3} {...getFieldProps("description")} />
          <div className="flex flex-col gap-1.5">
            <div className="grid gap-4 min-[400px]:grid-cols-2">
              <FormField label="Start time" type="time" isRequired={IS_BATCH_TIME_REQUIRED} {...getFieldProps("startTime")} />
              <FormField label="End time" type="time" isRequired={IS_BATCH_TIME_REQUIRED} {...getFieldProps("endTime")} />
            </div>
            {!IS_BATCH_TIME_REQUIRED && (
              <p className="text-xs text-muted-foreground">Leave both empty if the batch has no fixed time.</p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className={SECTION_TITLE_CLASS}>Students</h3>
          <BatchStudentPicker
            selectedStudents={formValues.students}
            onSelectedStudentsChange={(students) => setFieldValue("students", students)}
            error={formErrors.students}
          />
        </section>
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
