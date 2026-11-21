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
  adminFees: "/admin/fees",
  adminSettings: "/admin/settings",
  adminSettingsProfile: "/admin/settings/profile",
  adminSettingsPassword: "/admin/settings/password",

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

// Where a user who must replace their given password is sent. The student page isn't built yet
// (student portal on hold), so only the admin has one for now.
const ROLE_CHANGE_PASSWORD_PATHS: Partial<Record<UserRole, string>> = {
  [USER_ROLES.ADMIN]: PATHS.adminSettingsPassword,
}

// The change-password page this user is forced to, or null when they don't have to change it.
export const getRequiredPasswordChangePath = (user: User): string | null => {
  if (!user.mustChangePassword) {
    return null
  }
  return ROLE_CHANGE_PASSWORD_PATHS[user.role] ?? null
}

export const getHomePathForRole = (role: UserRole): string => {
  return ROLE_HOME_PATHS[role]
}

export const isPathAllowedForRole = (path: string, role: UserRole): boolean => {
  return path.startsWith(`${ROLE_ROOT_PATHS[role]}/`)
}

// First login (seeded or reset password): the change-password page. Otherwise back to the page they
// were trying to open, if their role can see it.
export const getPathAfterLogin = (user: User, requestedPath?: string): string => {
  const requiredPasswordChangePath = getRequiredPasswordChangePath(user)
  if (requiredPasswordChangePath) {
    return requiredPasswordChangePath
  }
  if (requestedPath && isPathAllowedForRole(requestedPath, user.role)) {
    return requestedPath
  }
  return getHomePathForRole(user.role)
}
