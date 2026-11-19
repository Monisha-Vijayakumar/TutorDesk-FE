import type { USER_ROLES } from "@/constants/userRoles"

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export interface User {
  id: string
  name: string
  email?: string // admin login email; for students only optional contact info (they can't log in with it)
  role: UserRole
  centerName?: string
  studentCode?: string // students only: login "Student ID", e.g. S100000001
  mustChangePassword?: boolean // true until a student replaces the temporary password
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
}

// Dev-only demo account used by the mock auth service.
export interface DemoAccount {
  identifier: string
  password: string
  user: User
}
