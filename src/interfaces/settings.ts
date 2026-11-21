import type { User } from "@/api/interfaces/auth"

// Settings page forms. API shapes (UpdateProfilePayload, ChangePasswordPayload) live in @/api/interfaces/auth.

export interface ProfileFormValues {
  name: string
  phone: string
  address: string
  centerName: string
  branch: string
  city: string
  state: string
  feeDueDay: string // as typed; a whole number 1–28
}

export interface ChangePasswordFormValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string // checked in the FE only, never sent
}

export interface ProfileFormProps {
  user: User
}
