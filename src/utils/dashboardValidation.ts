import isAfter from "validator/es/lib/isAfter"
import isBefore from "validator/es/lib/isBefore"
import isDate from "validator/es/lib/isDate"
import isEmpty from "validator/es/lib/isEmpty"
import { MAX_COLLECTION_RANGE_YEARS } from "@/constants/dashboard"
import { VALIDATION_MESSAGES } from "@/constants/validation"
import type { FeeCollectionRangeValues } from "@/interfaces/dashboard"
import type { FormErrors } from "@/interfaces/form"
import { getDateYearsAgo, getTodayIsoDate } from "@/utils/date"
import { keepFieldErrors } from "@/utils/validation"

const ISO_DATE_OPTIONS = { format: "YYYY-MM-DD", strictMode: true, delimiters: ["-"] }

const validateStartDate = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.START_DATE_REQUIRED
  }
  if (!isDate(value, ISO_DATE_OPTIONS)) {
    return VALIDATION_MESSAGES.DATE_INVALID
  }
  if (isBefore(value, getDateYearsAgo(MAX_COLLECTION_RANGE_YEARS))) {
    return VALIDATION_MESSAGES.START_DATE_TOO_EARLY(MAX_COLLECTION_RANGE_YEARS)
  }
  return undefined
}

const validateEndDate = (values: FeeCollectionRangeValues): string | undefined => {
  if (isEmpty(values.customTo)) {
    return VALIDATION_MESSAGES.END_DATE_REQUIRED
  }
  if (!isDate(values.customTo, ISO_DATE_OPTIONS)) {
    return VALIDATION_MESSAGES.DATE_INVALID
  }
  if (isAfter(values.customTo, getTodayIsoDate())) {
    return VALIDATION_MESSAGES.END_DATE_IN_FUTURE
  }
  if (!isEmpty(values.customFrom) && isAfter(values.customFrom, values.customTo)) {
    return VALIDATION_MESSAGES.DATE_RANGE_INVALID
  }
  return undefined
}

// Custom fee collection range: both dates required, not in the future, start ≤ end, at most 2 years back.
export const validateCollectionRange = (values: FeeCollectionRangeValues): FormErrors<FeeCollectionRangeValues> => {
  return keepFieldErrors<FeeCollectionRangeValues>({
    customFrom: validateStartDate(values.customFrom),
    customTo: validateEndDate(values),
  })
}
