// Matches the role enum stored by the BE. Only one ADMIN account exists (created by the BE seeder).
export const USER_ROLES = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
} as const

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.STUDENT]: "Student",
} as const
