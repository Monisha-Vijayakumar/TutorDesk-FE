import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import type { PaymentStatus } from "@/api/interfaces/fee"

export interface TextLinkProps {
  to: string
  children: ReactNode
}

export interface StatusPageProps {
  statusCode: string
  title: string
  message: string
}

export interface SafeHtmlProps {
  // HTML from data (e.g. a rich-text note). It is cleaned with DOMPurify before rendering.
  html: string
  className?: string
}

export interface AppLogoProps {
  size?: "sm" | "lg"
  isNameVisible?: boolean
  className?: string
}

export interface PlaceholderPageProps {
  title: string
}

export interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export interface StatusBadgeProps {
  status: PaymentStatus
}

export interface CompactBadgeListProps {
  items: string[]
  maxVisibleItems: number
}

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  pendingLabel: string
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (isOpen: boolean) => void
}
