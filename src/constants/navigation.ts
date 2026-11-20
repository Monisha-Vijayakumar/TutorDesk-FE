import { CalendarCheck, IndianRupee, LayoutDashboard, Settings, Users } from "lucide-react"
import type { NavItem } from "@/interfaces/layout"
import { PATHS } from "@/routes/paths"

export const ADMIN_PAGE_TITLES = {
  DASHBOARD: "Dashboard",
  STUDENTS: "Students",
  ATTENDANCE: "Attendance",
  FEES: "Fees",
  SETTINGS: "Settings",
} as const

// Admin sidebar links, in display order.
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: ADMIN_PAGE_TITLES.DASHBOARD, path: PATHS.adminDashboard, icon: LayoutDashboard },
  { label: ADMIN_PAGE_TITLES.STUDENTS, path: PATHS.adminStudents, icon: Users },
  { label: ADMIN_PAGE_TITLES.ATTENDANCE, path: PATHS.adminAttendance, icon: CalendarCheck },
  { label: ADMIN_PAGE_TITLES.FEES, path: PATHS.adminFees, icon: IndianRupee },
  { label: ADMIN_PAGE_TITLES.SETTINGS, path: PATHS.adminSettings, icon: Settings },
]
