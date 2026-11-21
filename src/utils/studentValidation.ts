import isDate from "validator/es/lib/isDate"
import isEmail from "validator/es/lib/isEmail"
import isEmpty from "validator/es/lib/isEmpty"
import isIn from "validator/es/lib/isIn"
import isInt from "validator/es/lib/isInt"
import isStrongPassword from "validator/es/lib/isStrongPassword"
import { hasApiErrorStatus } from "@/api/apiErrorHandler"
import { HTTP_STATUS } from "@/api/httpStatus"
import type { ApiError } from "@/api/interfaces/common"
import { GRADE_OPTIONS, MAX_MONTHLY_FEE_RUPEES } from "@/constants/students"
import { ALPHA_WITH_SPACES_OPTIONS, VALIDATION_MESSAGES } from "@/constants/validation"
import type { FormErrors } from "@/interfaces/form"
import type { StudentFormValues } from "@/interfaces/students"
import { getFormErrorsFromApi, keepFieldErrors, validateAlphaField, validateMobileNumber } from "@/utils/validation"

const ISO_DATE_OPTIONS = { format: "YYYY-MM-DD", strictMode: true, delimiters: ["-"] }
const GRADE_VALUES = GRADE_OPTIONS.map((option) => option.value)

// Person names: letters and spaces only (NFR-17).
const validatePersonName = (value: string, requiredMessage: string): string | undefined => {
  return validateAlphaField(value, ALPHA_WITH_SPACES_OPTIONS, VALIDATION_MESSAGES.LETTERS_ONLY, requiredMessage)
}

// WhatsApp numbers; optional ones (no requiredMessage) are only checked when filled.
const validatePhone = (value: string, requiredMessage?: string): string | undefined => {
  return validateMobileNumber(value, VALIDATION_MESSAGES.PHONE_INVALID, requiredMessage)
}

const validateMonthlyFee = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.MONTHLY_FEE_REQUIRED
  }
  if (!isInt(value, { min: 1, max: MAX_MONTHLY_FEE_RUPEES, allow_leading_zeroes: false })) {
    return VALIDATION_MESSAGES.MONTHLY_FEE_INVALID
  }
  return undefined
}

const validateJoinDate = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.JOIN_DATE_REQUIRED
  }
  if (!isDate(value, ISO_DATE_OPTIONS)) {
    return VALIDATION_MESSAGES.DATE_INVALID
  }
  return undefined
}

const validatePassword = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.PASSWORD_REQUIRED
  }
  if (!isStrongPassword(value)) {
    return VALIDATION_MESSAGES.PASSWORD_TOO_WEAK
  }
  return undefined
}

// Expects values that have already been through sanitizeFormValues.
// The password is only set when adding a student.
export const validateStudentForm = (
  values: StudentFormValues,
  isNewStudent: boolean
): FormErrors<StudentFormValues> => {
  const fieldErrors: FormErrors<StudentFormValues> = {
    firstName: validatePersonName(values.firstName, VALIDATION_MESSAGES.FIRST_NAME_REQUIRED),
    lastName: validatePersonName(values.lastName, VALIDATION_MESSAGES.LAST_NAME_REQUIRED),
    email: !isEmpty(values.email) && !isEmail(values.email) ? VALIDATION_MESSAGES.EMAIL_INVALID : undefined,
    // Optional: when empty, the parent's phone is saved as the phone number (buildStudentDetailsPayload).
    phone: validatePhone(values.phone),
    parentName: validatePersonName(values.parentName, VALIDATION_MESSAGES.PARENT_NAME_REQUIRED),
    parentPhone: validatePhone(values.parentPhone, VALIDATION_MESSAGES.PARENT_PHONE_REQUIRED),
    grade: isIn(values.grade, GRADE_VALUES) ? undefined : VALIDATION_MESSAGES.GRADE_REQUIRED,
    subjects: values.subjects.length === 0 ? VALIDATION_MESSAGES.SUBJECTS_REQUIRED : undefined,
    monthlyFee: validateMonthlyFee(values.monthlyFee),
    joinDate: validateJoinDate(values.joinDate),
    password: isNewStudent ? validatePassword(values.password) : undefined,
  }

  return keepFieldErrors(fieldErrors)
}

// Field errors for a failed save: the ones the API reports (400 / 422), plus the email field for a
// duplicate email (409), which may come without field details.
export const getStudentFormErrorsFromApi = (
  apiError: ApiError,
  values: StudentFormValues
): FormErrors<StudentFormValues> => {
  const formErrors = getFormErrorsFromApi(apiError, values)
  if (hasApiErrorStatus(apiError, HTTP_STATUS.CONFLICT) && !formErrors.email) {
    formErrors.email = VALIDATION_MESSAGES.EMAIL_TAKEN
  }
  return formErrors
}
