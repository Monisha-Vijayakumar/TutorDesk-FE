import isAfter from "validator/es/lib/isAfter"
import isDate from "validator/es/lib/isDate"
import isEmpty from "validator/es/lib/isEmpty"
import isIn from "validator/es/lib/isIn"
import isInt from "validator/es/lib/isInt"
import { PAISE_PER_RUPEE, PAYMENT_METHODS } from "@/constants/fees"
import { MAX_MONTHLY_FEE_RUPEES } from "@/constants/students"
import { VALIDATION_MESSAGES } from "@/constants/validation"
import type { FeeFormValues } from "@/interfaces/fees"
import type { FormErrors } from "@/interfaces/form"
import { getTodayIsoDate } from "@/utils/date"
import { formatCurrency } from "@/utils/format"
import { keepFieldErrors } from "@/utils/validation"

const ISO_DATE_OPTIONS = { format: "YYYY-MM-DD", strictMode: true, delimiters: ["-"] }
const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHODS)

const validateTotalFee = (value: string, paidAmount: number): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.TOTAL_FEE_REQUIRED
  }
  if (!isInt(value, { min: 0, max: MAX_MONTHLY_FEE_RUPEES, allow_leading_zeroes: false })) {
    return VALIDATION_MESSAGES.TOTAL_FEE_INVALID
  }
  // Lowering the fee below what was already received would make the balance negative.
  if (Number(value) * PAISE_PER_RUPEE < paidAmount) {
    return VALIDATION_MESSAGES.TOTAL_FEE_BELOW_PAID(formatCurrency(paidAmount))
  }
  return undefined
}

const validateDueDate = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.DUE_DATE_REQUIRED
  }
  return isDate(value, ISO_DATE_OPTIONS) ? undefined : VALIDATION_MESSAGES.DATE_INVALID
}

// The new payment can't take the paid amount above the (edited) total fee.
const validatePaymentAmount = (values: FeeFormValues, paidAmount: number): string | undefined => {
  if (!isInt(values.paymentAmount, { min: 1, allow_leading_zeroes: false })) {
    return VALIDATION_MESSAGES.PAYMENT_AMOUNT_INVALID
  }
  if (!isInt(values.totalFee)) {
    return undefined // the total fee error is shown instead
  }
  const outstandingAmount = Math.max(Number(values.totalFee) * PAISE_PER_RUPEE - paidAmount, 0)
  if (Number(values.paymentAmount) * PAISE_PER_RUPEE > outstandingAmount) {
    return VALIDATION_MESSAGES.PAYMENT_AMOUNT_TOO_HIGH(formatCurrency(outstandingAmount))
  }
  return undefined
}

const validatePaymentDate = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.PAYMENT_DATE_REQUIRED
  }
  if (!isDate(value, ISO_DATE_OPTIONS)) {
    return VALIDATION_MESSAGES.DATE_INVALID
  }
  return isAfter(value, getTodayIsoDate()) ? VALIDATION_MESSAGES.PAYMENT_DATE_IN_FUTURE : undefined
}

// Expects values that have already been through sanitizeFormValues. paidAmount (paise) is what the
// month already has. The payment fields are only checked when an amount is entered — with no amount,
// nothing is recorded and an empty date/method is fine.
export const validateFeeForm = (values: FeeFormValues, paidAmount: number): FormErrors<FeeFormValues> => {
  const isRecordingPayment = !isEmpty(values.paymentAmount)

  return keepFieldErrors<FeeFormValues>({
    totalFee: validateTotalFee(values.totalFee, paidAmount),
    dueDate: validateDueDate(values.dueDate),
    paymentAmount: isRecordingPayment ? validatePaymentAmount(values, paidAmount) : undefined,
    paymentDate: isRecordingPayment ? validatePaymentDate(values.paymentDate) : undefined,
    paymentMethod:
      isRecordingPayment && !isIn(values.paymentMethod, PAYMENT_METHOD_VALUES)
        ? VALIDATION_MESSAGES.PAYMENT_METHOD_REQUIRED
        : undefined,
  })
}
