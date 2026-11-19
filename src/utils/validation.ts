import isLength from "validator/es/lib/isLength"
import isNumeric from "validator/es/lib/isNumeric"
import { STUDENT_CODE_DIGIT_COUNT, STUDENT_CODE_PREFIX } from "@/constants/validation"

export const hasValidationErrors = (errors: object): boolean => {
  return Object.keys(errors).length > 0
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
