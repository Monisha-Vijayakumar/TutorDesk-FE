import blacklist from "validator/es/lib/blacklist"
import isAfter from "validator/es/lib/isAfter"
import isAlpha from "validator/es/lib/isAlpha"
import isEmpty from "validator/es/lib/isEmpty"
import isLength from "validator/es/lib/isLength"
import isMobilePhone from "validator/es/lib/isMobilePhone"
import isNumeric from "validator/es/lib/isNumeric"
import type { ApiError } from "@/api/interfaces/common"
import {
  ALPHA_LOCALE,
  PHONE_LOCALE,
  PHONE_SEPARATORS,
  STUDENT_CODE_DIGIT_COUNT,
  STUDENT_CODE_PREFIX,
  VALIDATION_MESSAGES,
} from "@/constants/validation"
import type { AlphaFieldOptions, FormErrors } from "@/interfaces/form"

export const hasValidationErrors = (errors: object): boolean => {
  return Object.keys(errors).length > 0
}

// Drops fields whose check passed (undefined), so hasValidationErrors works on the result.
// Lets a validator list every field's check in one object.
export const keepFieldErrors = <TFormValues>(fieldErrors: FormErrors<TFormValues>): FormErrors<TFormValues> => {
  const errors: FormErrors<TFormValues> = {}
  for (const fieldName in fieldErrors) {
    if (fieldErrors[fieldName]) {
      errors[fieldName] = fieldErrors[fieldName]
    }
  }
  return errors
}

// Field errors the API reported (400 / 422) for fields of this form, to show under those fields.
// Errors for other fields are ignored; the toast still shows the request-level message.
export const getFormErrorsFromApi = <TFormValues extends object>(
  apiError: ApiError,
  formValues: TFormValues
): FormErrors<TFormValues> => {
  const errors: FormErrors<TFormValues> = {}
  for (const fieldName of Object.keys(formValues)) {
    const message = apiError.fieldErrors[fieldName]
    if (message) {
      errors[fieldName as keyof TFormValues] = message
    }
  }
  return errors
}

// Checks a Student ID like "S100000001": the prefix, then exactly 9 digits.
// Pass the value upper-cased (students may type "s100000001").
export const isValidStudentCode = (value: string): boolean => {
  const digits = value.slice(STUDENT_CODE_PREFIX.length)

  return (
    value.startsWith(STUDENT_CODE_PREFIX) &&
    isNumeric(digits, { no_symbols: true }) &&
    isLength(digits, { min: STUDENT_CODE_DIGIT_COUNT, max: STUDENT_CODE_DIGIT_COUNT })
  )
}

// Payment date filter (Students and Fees pages): both dates optional, but the start can't be after the end.
export const validatePaymentDateRange = (paidFrom: string, paidTo: string): string | undefined => {
  if (isEmpty(paidFrom) || isEmpty(paidTo)) {
    return undefined
  }
  return isAfter(paidFrom, paidTo) ? VALIDATION_MESSAGES.DATE_RANGE_INVALID : undefined
}

// Name and place fields (NFR-17): letters plus what alphaOptions allows (ALPHA_WITH_SPACES_OPTIONS or
// ALPHA_WITH_PUNCTUATION_OPTIONS). Optional fields (no requiredMessage) are only checked when filled.
export const validateAlphaField = (
  value: string,
  alphaOptions: AlphaFieldOptions,
  invalidMessage: string,
  requiredMessage?: string
): string | undefined => {
  if (isEmpty(value)) {
    return requiredMessage
  }
  if (!isAlpha(value, ALPHA_LOCALE, alphaOptions)) {
    return invalidMessage
  }
  return undefined
}

// Indian mobile numbers. Spaces and dashes typed are ignored. Optional numbers are only checked when filled.
export const validateMobileNumber = (
  value: string,
  invalidMessage: string,
  requiredMessage?: string
): string | undefined => {
  if (isEmpty(value)) {
    return requiredMessage
  }
  if (!isMobilePhone(blacklist(value, PHONE_SEPARATORS), PHONE_LOCALE)) {
    return invalidMessage
  }
  return undefined
}
