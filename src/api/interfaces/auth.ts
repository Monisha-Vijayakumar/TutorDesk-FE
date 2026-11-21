import type { USER_ROLES } from "@/constants/userRoles"

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export interface User {
  id: string
  name: string
  email?: string // admin login email; for students only optional contact info (they can't log in with it)
  role: UserRole
  // Admin only (set by the seeder, editable in Settings → Profile). centerName signs the WhatsApp reminders.
  phone?: string
  address?: string
  centerName?: string
  branch?: string | null
  city?: string
  state?: string
  feeDueDay?: number // 1–28: day of the month new fee records are due
  studentCode?: string // students only: login "Student ID", e.g. S100000001
  // True until the user replaces the password they were given (seeded admin, new or reset student).
  mustChangePassword?: boolean
}

// Settings → Profile. Email and role can't be changed, so they're never sent.
export interface UpdateProfilePayload {
  name: string
  phone: string
  address: string
  centerName: string
  branch: string | null
  city: string
  state: string
  feeDueDay: number
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface LoginPayload {
  // Admin email (lower-cased) or Student ID (upper-cased). The BE decides which by looking for "@".
  identifier: string
  password: string
}

// Assumed shape for login and "me" responses. Confirm when tutordesk-be is built.
export interface AuthResponse {
  user: User
}

// What every auth service (real API or dev mock) must provide.
export interface AuthService {
  login: (payload: LoginPayload) => Promise<User>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<User>
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>
  changePassword: (payload: ChangePasswordPayload) => Promise<void>
}

// Dev-only demo account used by the mock auth service.
export interface DemoAccount {
  identifier: string
  password: string
  user: User
}

// DEV mock only: profile edits and password changes per demo user id, kept for the browser tab.
export type DemoAccountChanges = Record<string, Pick<DemoAccount, "user" | "password">>
