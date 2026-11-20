import type { FeeRecord, PaymentMethod, UpdateFeePayload } from "@/api/interfaces/fee"
import { PAISE_PER_RUPEE } from "@/constants/fees"
import type { FeeFormValues } from "@/interfaces/fees"
import { getTodayIsoDate } from "@/utils/date"

// Pre-fills the edit form. The payment section starts empty, with today as the likely payment date.
export const getFeeFormValues = (fee: FeeRecord): FeeFormValues => {
  return {
    totalFee: String(fee.totalFee / PAISE_PER_RUPEE),
    dueDate: fee.dueDate,
    paymentAmount: "",
    paymentDate: getTodayIsoDate(),
    paymentMethod: "",
  }
}

// Expects values that have already been through sanitizeFormValues and validateFeeForm.
// Amounts are validated as whole rupees, so the paise values stay integers.
export const buildUpdateFeePayload = (values: FeeFormValues): UpdateFeePayload => {
  const payment = values.paymentAmount
    ? {
        amount: Number(values.paymentAmount) * PAISE_PER_RUPEE,
        paidOn: values.paymentDate,
        method: values.paymentMethod as PaymentMethod,
      }
    : null

  return {
    totalFee: Number(values.totalFee) * PAISE_PER_RUPEE,
    dueDate: values.dueDate,
    payment,
  }
}
