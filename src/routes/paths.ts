import type { User, UserRole } from "@/api/interfaces/auth"
import { USER_ROLES } from "@/constants/userRoles"

export const PATHS = {
  home: "/",
  login: "/login",
  unauthorized: "/unauthorized",
  notFound: "*",

  admin: "/admin",
  adminDashboard: "/admin/dashboard",
  adminStudents: "/admin/students",
  adminBatches: "/admin/batches",
  adminAttendance: "/admin/attendance",
  adminFees: "/admin/fees",
  adminSettings: "/admin/settings",

  student: "/student",
  studentHome: "/student/home",
} as const

const ROLE_ROOT_PATHS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: PATHS.admin,
  [USER_ROLES.STUDENT]: PATHS.student,
}

const ROLE_HOME_PATHS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: PATHS.adminDashboard,
  [USER_ROLES.STUDENT]: PATHS.studentHome,
}

export const getHomePathForRole = (role: UserRole): string => {
  return ROLE_HOME_PATHS[role]
}

export const isPathAllowedForRole = (path: string, role: UserRole): boolean => {
  return path.startsWith(`${ROLE_ROOT_PATHS[role]}/`)
}

// Send the user back to the page they were trying to open, if their role can see it.
export const getPathAfterLogin = (user: User, requestedPath?: string): string => {
  if (requestedPath && isPathAllowedForRole(requestedPath, user.role)) {
    return requestedPath
  }
  return getHomePathForRole(user.role)
}
