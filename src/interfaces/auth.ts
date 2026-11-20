import type { ReactNode, SubmitEvent } from "react"
import type { User } from "@/api/interfaces/auth"

// API shapes (User, UserRole, payloads, AuthResponse) live in @/api/interfaces/auth.

export interface LoginFormValues {
  // Admin email, or a Student ID like S100000001 (students can't log in with email).
  identifier: string
  password: string
}

export interface AuthState {
  user: User | null
  // True once the "who is logged in?" check on app load has finished.
  isSessionChecked: boolean
  // True when a request answered 401 and the user was logged out; the login page then says why.
  isSessionExpired: boolean
}

export interface AuthFormCardProps {
  title: string
  description: string
  submitLabel: string
  submittingLabel: string
  isSubmitting: boolean
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
  footer?: ReactNode
  children: ReactNode
  className?: string
}
