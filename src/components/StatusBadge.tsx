import type { PaymentStatus } from "@/api/interfaces/fee"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_STATUS_LABELS } from "@/constants/fees"
import type { StatusBadgeProps } from "@/interfaces/common"
import { cn } from "@/lib/utils"

// Paid green, Pending amber, Overdue red, Partially Paid blue.
const STATUS_BADGE_CLASSES: Record<PaymentStatus, string> = {
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  OVERDUE: "border-red-200 bg-red-50 text-red-700",
  PARTIAL: "border-blue-200 bg-blue-50 text-blue-700",
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap", STATUS_BADGE_CLASSES[status])}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
