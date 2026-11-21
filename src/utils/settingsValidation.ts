import isEmpty from "validator/es/lib/isEmpty"
import isInt from "validator/es/lib/isInt"
import isLength from "validator/es/lib/isLength"
import isStrongPassword from "validator/es/lib/isStrongPassword"
import { MAX_FEE_DUE_DAY, MIN_FEE_DUE_DAY } from "@/constants/fees"
import { MAX_ADDRESS_LENGTH } from "@/constants/settings"
import { ALPHA_WITH_PUNCTUATION_OPTIONS, ALPHA_WITH_SPACES_OPTIONS, VALIDATION_MESSAGES } from "@/constants/validation"
import type { FormErrors } from "@/interfaces/form"
import type { ChangePasswordFormValues, ProfileFormValues } from "@/interfaces/settings"
import { keepFieldErrors, validateAlphaField, validateMobileNumber } from "@/utils/validation"

const validateAddress = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.ADDRESS_REQUIRED
  }
  if (!isLength(value, { max: MAX_ADDRESS_LENGTH })) {
    return VALIDATION_MESSAGES.ADDRESS_TOO_LONG(MAX_ADDRESS_LENGTH)
  }
  return undefined
}

const validateFeeDueDay = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.FEE_DUE_DAY_REQUIRED
  }
  if (!isInt(value, { min: MIN_FEE_DUE_DAY, max: MAX_FEE_DUE_DAY, allow_leading_zeroes: false })) {
    return VALIDATION_MESSAGES.FEE_DUE_DAY_INVALID(MIN_FEE_DUE_DAY, MAX_FEE_DUE_DAY)
  }
  return undefined
}

// Expects values that have already been through sanitizeFormValues. Only the branch is optional.
export const validateProfileForm = (values: ProfileFormValues): FormErrors<ProfileFormValues> => {
  const { LETTERS_ONLY, LETTERS_AND_PUNCTUATION_ONLY } = VALIDATION_MESSAGES

  return keepFieldErrors<ProfileFormValues>({
    name: validateAlphaField(values.name, ALPHA_WITH_SPACES_OPTIONS, LETTERS_ONLY, VALIDATION_MESSAGES.NAME_REQUIRED),
    phone: validateMobileNumber(values.phone, VALIDATION_MESSAGES.MOBILE_NUMBER_INVALID, VALIDATION_MESSAGES.PHONE_REQUIRED),
    address: validateAddress(values.address),
    centerName: validateAlphaField(
      values.centerName,
      ALPHA_WITH_PUNCTUATION_OPTIONS,
      LETTERS_AND_PUNCTUATION_ONLY,
      VALIDATION_MESSAGES.CENTER_NAME_REQUIRED
    ),
    branch: validateAlphaField(values.branch, ALPHA_WITH_PUNCTUATION_OPTIONS, LETTERS_AND_PUNCTUATION_ONLY),
    city: validateAlphaField(values.city, ALPHA_WITH_SPACES_OPTIONS, LETTERS_ONLY, VALIDATION_MESSAGES.CITY_REQUIRED),
    state: validateAlphaField(values.state, ALPHA_WITH_SPACES_OPTIONS, LETTERS_ONLY, VALIDATION_MESSAGES.STATE_REQUIRED),
    feeDueDay: validateFeeDueDay(values.feeDueDay),
  })
}

const validateNewPassword = (values: ChangePasswordFormValues): string | undefined => {
  if (isEmpty(values.newPassword)) {
    return VALIDATION_MESSAGES.NEW_PASSWORD_REQUIRED
  }
  if (!isStrongPassword(values.newPassword)) {
    return VALIDATION_MESSAGES.PASSWORD_TOO_WEAK
  }
  if (values.newPassword === values.currentPassword) {
    return VALIDATION_MESSAGES.NEW_PASSWORD_SAME_AS_CURRENT
  }
  return undefined
}

const validateConfirmPassword = (values: ChangePasswordFormValues): string | undefined => {
  if (isEmpty(values.confirmPassword)) {
    return VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED
  }
  if (values.confirmPassword !== values.newPassword) {
    return VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH
  }
  return undefined
}

// Passwords are never sanitized (sent exactly as typed).
export const validateChangePasswordForm = (values: ChangePasswordFormValues): FormErrors<ChangePasswordFormValues> => {
  return keepFieldErrors<ChangePasswordFormValues>({
    currentPassword: isEmpty(values.currentPassword) ? VALIDATION_MESSAGES.CURRENT_PASSWORD_REQUIRED : undefined,
    newPassword: validateNewPassword(values),
    confirmPassword: validateConfirmPassword(values),
  })
}
