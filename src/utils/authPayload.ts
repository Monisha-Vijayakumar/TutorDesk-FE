import isEmail from "validator/es/lib/isEmail"
import type { LoginPayload } from "@/api/interfaces/auth"
import type { LoginFormValues } from "@/interfaces/auth"

// Expects values that have already been through sanitizeFormValues and validation.
export const buildLoginPayload = (values: LoginFormValues): LoginPayload => {
  // Admin email is stored lower-cased; Student IDs upper-cased (S100000001).
  const identifier = isEmail(values.identifier)
    ? values.identifier.toLowerCase()
    : values.identifier.toUpperCase()

  return { identifier, password: values.password }
}
