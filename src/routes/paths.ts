import type { Role } from "@/types/auth"

export const PATHS = {
  home: "/",
  login: "/login",
  signup: "/signup",
  unauthorized: "/unauthorized",
  adminDashboard: "/admin/dashboard",
  studentHome: "/student/home",
} as const

/** Role-based landing page after login (FR-5). */
export function getHomePath(role: Role) {
  return role === "admin" ? PATHS.adminDashboard : PATHS.studentHome
}
