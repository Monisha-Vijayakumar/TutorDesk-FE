import isEmail from "validator/es/lib/isEmail"
import isEmpty from "validator/es/lib/isEmpty"
import { VALIDATION_MESSAGES } from "@/constants/validation"
import type { LoginFormValues } from "@/interfaces/auth"
import type { FormErrors } from "@/interfaces/form"
import { isValidStudentCode } from "@/utils/validation"

// Expects values that have already been through sanitizeFormValues.
// The identifier is either the admin's email or a Student ID (students can't log in with email).
export const validateLoginForm = (values: LoginFormValues): FormErrors<LoginFormValues> => {
  const errors: FormErrors<LoginFormValues> = {}

  if (isEmpty(values.identifier)) {
    errors.identifier = VALIDATION_MESSAGES.LOGIN_IDENTIFIER_REQUIRED
  } else if (!isEmail(values.identifier) && !isValidStudentCode(values.identifier.toUpperCase())) {
    errors.identifier = VALIDATION_MESSAGES.LOGIN_IDENTIFIER_INVALID
  }

  if (isEmpty(values.password)) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_REQUIRED
  }

  return errors
}
