import { IndianRupee, KeyRound, Layers, LayoutDashboard, Settings, UserRound, Users } from "lucide-react"
import type { NavItem } from "@/interfaces/layout"
import { PATHS } from "@/routes/paths"

export const ADMIN_PAGE_TITLES = {
  DASHBOARD: "Dashboard",
  STUDENTS: "Students",
  BATCHES: "Batch Management",
  FEES: "Fees",
  SETTINGS: "Settings",
} as const

// Admin sidebar links, in display order.
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: ADMIN_PAGE_TITLES.DASHBOARD, path: PATHS.adminDashboard, icon: LayoutDashboard },
  { label: ADMIN_PAGE_TITLES.STUDENTS, path: PATHS.adminStudents, icon: Users },
  { label: ADMIN_PAGE_TITLES.BATCHES, path: PATHS.adminBatches, icon: Layers },
  { label: ADMIN_PAGE_TITLES.FEES, path: PATHS.adminFees, icon: IndianRupee },
  { label: ADMIN_PAGE_TITLES.SETTINGS, path: PATHS.adminSettings, icon: Settings },
]

export const SETTINGS_PAGE_TITLES = {
  PROFILE: "Profile",
  UPDATE_PASSWORD: "Update Password",
} as const

// Menu inside the Settings page, in display order.
export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { label: SETTINGS_PAGE_TITLES.PROFILE, path: PATHS.adminSettingsProfile, icon: UserRound },
  { label: SETTINGS_PAGE_TITLES.UPDATE_PASSWORD, path: PATHS.adminSettingsPassword, icon: KeyRound },
]
