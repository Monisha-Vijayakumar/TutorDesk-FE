import { ReceiptText } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { StatusBadge } from "@/components/StatusBadge"
import { PAYMENT_STATUS_ROW_ACCENTS } from "@/constants/dashboard"
import { PAYMENT_STATUS_DESCRIPTIONS } from "@/constants/fees"
import type { PaymentStatusBreakdownProps } from "@/interfaces/dashboard"
import { cn } from "@/lib/utils"
import { formatMonthLabel } from "@/utils/date"
import { formatCurrency } from "@/utils/format"
import { ChartCard } from "./ChartCard"

const formatStudentCount = (count: number): string => `${count} ${count === 1 ? "student" : "students"}`

// This month's fee records by status: one row per status with its amount, number of students and what
// the status means (the status colour is on the row's left edge, next to its badge).
export const PaymentStatusBreakdown = ({ month, paymentStatusCounts }: PaymentStatusBreakdownProps) => {
  const total = paymentStatusCounts.reduce((sum, item) => sum + item.count, 0)

  return (
    <ChartCard
      title={`Payment status of ${formatMonthLabel(month)}`}
      description="Paid shows the amount received; the others show what is still to collect."
      icon={ReceiptText}
      tone="aqua"
    >
      {total === 0 ? (
        <EmptyState icon={ReceiptText} title="No fee records this month yet." />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {paymentStatusCounts.map((item) => (
            <li
              key={item.status}
              className={cn(
                "flex flex-col gap-1.5 rounded-lg border border-l-4 bg-background px-3 py-2.5",
                PAYMENT_STATUS_ROW_ACCENTS[item.status]
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={item.status} />
                <span className="text-right">
                  <span className="font-semibold tabular-nums">{formatCurrency(item.amount)}</span>
                  <span className="text-xs text-muted-foreground"> · {formatStudentCount(item.count)}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{PAYMENT_STATUS_DESCRIPTIONS[item.status]}</p>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  )
}
