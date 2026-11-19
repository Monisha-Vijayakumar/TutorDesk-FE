import type { LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface SidebarNavProps {
  items: NavItem[]
  // Called after a link is clicked, e.g. to close the mobile drawer.
  onNavigate?: () => void
}
