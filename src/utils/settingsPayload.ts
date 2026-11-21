import blacklist from "validator/es/lib/blacklist"
import type { ChangePasswordPayload, UpdateProfilePayload, User } from "@/api/interfaces/auth"
import { DEFAULT_FEE_DUE_DAY } from "@/constants/fees"
import { PHONE_SEPARATORS } from "@/constants/validation"
import type { ChangePasswordFormValues, ProfileFormValues } from "@/interfaces/settings"

// Pre-fills Settings → Profile with the logged-in user's saved details.
export const getProfileFormValues = (user: User): ProfileFormValues => {
  return {
    name: user.name,
    phone: user.phone ?? "",
    address: user.address ?? "",
    centerName: user.centerName ?? "",
    branch: user.branch ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    feeDueDay: String(user.feeDueDay ?? DEFAULT_FEE_DUE_DAY),
  }
}

// Expects values that have already been through sanitizeFormValues and validation.
export const buildUpdateProfilePayload = (values: ProfileFormValues): UpdateProfilePayload => {
  return {
    name: values.name,
    phone: blacklist(values.phone, PHONE_SEPARATORS),
    address: values.address,
    centerName: values.centerName,
    branch: values.branch || null,
    city: values.city,
    state: values.state,
    // Validated as a whole number 1–28.
    feeDueDay: Number(values.feeDueDay),
  }
}

export const getEmptyChangePasswordFormValues = (): ChangePasswordFormValues => {
  return { currentPassword: "", newPassword: "", confirmPassword: "" }
}

// Passwords are sent exactly as typed; the confirmation stays in the FE.
export const buildChangePasswordPayload = (values: ChangePasswordFormValues): ChangePasswordPayload => {
  return { currentPassword: values.currentPassword, newPassword: values.newPassword }
}
