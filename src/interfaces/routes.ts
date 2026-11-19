import type { UserRole } from "@/api/interfaces/auth"

export interface ProtectedRouteProps {
  // Leave empty to allow any logged-in user.
  allowedRoles?: UserRole[]
}

// Sent to the login page so the user can be returned to the page they asked for.
export interface LoginRedirectState {
  requestedPath: string
}
