const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

export function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim())
}
