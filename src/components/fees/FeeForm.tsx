import { useState, type SubmitEvent } from "react"
import { toast } from "sonner"
import { getApiError, hasApiErrorStatus } from "@/api/apiErrorHandler"
import { HTTP_STATUS } from "@/api/httpStatus"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { FormField } from "@/components/FormField"
import { FormSelectField } from "@/components/FormSelectField"
import { RequiredFieldsNote } from "@/components/RequiredFieldMarkers"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { PAISE_PER_RUPEE, PAYMENT_METHOD_OPTIONS } from "@/constants/fees"
import { useForm } from "@/hooks/useForm"
import type { FeeFormProps } from "@/interfaces/fees"
import { updateFee } from "@/store/feeSlice"
import { useAppDispatch } from "@/store/hooks"
import { formatMonthLabel, getTodayIsoDate } from "@/utils/date"
import { buildUpdateFeePayload, getFeeFormValues } from "@/utils/feePayload"
import { validateFeeForm } from "@/utils/feeValidation"
import { formatCurrency, formatFullName } from "@/utils/format"
import { sanitizeFormValues } from "@/utils/sanitize"
import { getFormErrorsFromApi, hasValidationErrors } from "@/utils/validation"

const SECTION_TITLE_CLASS = "text-sm font-semibold text-foreground"
// Two columns from md up, one on phones (NFR-23).
const FIELD_GRID_CLASS = "grid gap-4 md:grid-cols-2"

// Edit one month's fee: total fee and due date, plus an optional new payment. Only payment details
// can change here — the student's own details are shown read-only (they're edited on the Students page).
// Paid amount, outstanding amount and status are calculated by the BE after saving.
export const FeeForm = ({ fee, onSaved, onCancel, onFeeNotFound }: FeeFormProps) => {
  const dispatch = useAppDispatch()
  const { formValues, formErrors, setFormErrors, setFieldValue, getFieldProps } = useForm(getFeeFormValues(fee))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { student } = fee

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const sanitizedValues = sanitizeFormValues(formValues)
    const validationErrors = validateFeeForm(sanitizedValues, fee.paidAmount)
    setFormErrors(validationErrors)
    if (hasValidationErrors(validationErrors)) {
      return
    }

    const payload = buildUpdateFeePayload(sanitizedValues)
    setIsSubmitting(true)
    const result = await dispatch(updateFee({ feeId: fee.id, payload }))
    setIsSubmitting(false)

    if (updateFee.fulfilled.match(result)) {
      toast.success(
        payload.payment ? SUCCESS_MESSAGES.PAYMENT_RECORDED(formatCurrency(payload.payment.amount)) : SUCCESS_MESSAGES.FEE_UPDATED
      )
      onSaved()
      return
    }

    const apiError = result.payload ?? getApiError(result.error)
    toast.error(apiError.message)
    // The student was deleted while the form was open: close it and reload the list.
    if (hasApiErrorStatus(apiError, HTTP_STATUS.NOT_FOUND)) {
      onFeeNotFound()
      return
    }
    // Values stay in place; field errors from the API show under their fields.
    setFormErrors(getFormErrorsFromApi(apiError, sanitizedValues))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        {/* Read-only: changed on the Students page, never here. */}
        <dl className="grid grid-cols-1 gap-3 rounded-md bg-muted p-3 text-sm min-[400px]:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-muted-foreground">Student</dt>
            <dd className="font-medium wrap-break-word">{formatFullName(student.firstName, student.lastName)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Student ID</dt>
            <dd className="font-medium">{student.studentCode}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground">Parent</dt>
            <dd className="wrap-break-word">{student.parentName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Parent WhatsApp</dt>
            <dd>{student.parentPhone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Month</dt>
            <dd>{formatMonthLabel(fee.month)}</dd>
          </div>
        </dl>

        <RequiredFieldsNote />

        <section className="flex flex-col gap-4">
          <h3 className={SECTION_TITLE_CLASS}>Fee for {formatMonthLabel(fee.month)}</h3>
          <div className={FIELD_GRID_CLASS}>
            <FormField
              label="Total fee (₹)"
              isRequired
              inputMode="numeric"
              autoComplete="off"
              {...getFieldProps("totalFee")}
            />
            <FormField label="Due date" type="date" isRequired {...getFieldProps("dueDate")} />
          </div>
          <dl className="grid grid-cols-3 gap-3 rounded-md border p-3 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Paid so far</dt>
              <dd className="tabular-nums">{formatCurrency(fee.paidAmount)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Outstanding</dt>
              <dd className="font-medium tabular-nums">{formatCurrency(fee.outstandingAmount)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge status={fee.status} />
              </dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className={SECTION_TITLE_CLASS}>Record a payment</h3>
            <p className="text-xs text-muted-foreground">
              Leave the amount empty if no payment was received. Each payment is kept in the payment history.
            </p>
          </div>
          <FormField
            label="Amount received (₹)"
            inputMode="numeric"
            autoComplete="off"
            placeholder={String(fee.outstandingAmount / PAISE_PER_RUPEE)}
            {...getFieldProps("paymentAmount")}
          />
          <div className={FIELD_GRID_CLASS}>
            <FormField
              label="Payment date"
              type="date"
              max={getTodayIsoDate()}
              {...getFieldProps("paymentDate")}
            />
            <FormSelectField
              id="paymentMethod"
              label="Payment method"
              value={formValues.paymentMethod}
              options={PAYMENT_METHOD_OPTIONS}
              placeholder="Select a method"
              onValueChange={(value) => setFieldValue("paymentMethod", value)}
              error={formErrors.paymentMethod}
            />
          </div>
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
