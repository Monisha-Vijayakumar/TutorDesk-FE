import { History, MessageCircle, Pencil } from "lucide-react"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { PAYMENT_METHOD_LABELS } from "@/constants/fees"
import { EMPTY_CELL_VALUE } from "@/constants/table"
import type { FeeMobileCardProps } from "@/interfaces/fees"
import { formatDisplayDate } from "@/utils/date"
import { canSendPaymentReminder } from "@/utils/feeReminder"
import { formatCurrency, formatFullName } from "@/utils/format"

// One fee record on phones and tablets, in place of a table row. Same data and actions as the table.
export const FeeMobileCard = ({ fee, isSendingReminder, onEdit, onSendReminder, onViewHistory }: FeeMobileCardProps) => {
  const studentName = formatFullName(fee.student.firstName, fee.student.lastName)
  const isReminderAvailable = canSendPaymentReminder(fee)

  return (
    <article className="flex flex-col gap-4 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="font-medium wrap-break-word">{studentName}</h2>
          <p className="text-sm text-muted-foreground">{fee.student.studentCode}</p>
        </div>
        <StatusBadge status={fee.status} />
      </div>

      {/* Money first: it's what the admin is looking for on this page. */}
      <dl className="grid grid-cols-3 gap-2 rounded-md bg-muted/50 p-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="tabular-nums">{formatCurrency(fee.totalFee)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Paid</dt>
          <dd className="tabular-nums">{formatCurrency(fee.paidAmount)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Outstanding</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(fee.outstandingAmount)}</dd>
        </div>
      </dl>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm min-[400px]:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-muted-foreground">Parent</dt>
          <dd className="wrap-break-word">{fee.student.parentName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Parent WhatsApp</dt>
          <dd>{fee.student.parentPhone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Due date</dt>
          <dd>{formatDisplayDate(fee.dueDate)}</dd>
        </div>
        <div className="min-[400px]:col-span-2">
          <dt className="text-muted-foreground">Last payment</dt>
          <dd>
            {fee.lastPaymentDate ? formatDisplayDate(fee.lastPaymentDate) : EMPTY_CELL_VALUE}
            {fee.lastPaymentMethod && ` · ${PAYMENT_METHOD_LABELS[fee.lastPaymentMethod]}`}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-2 gap-2 min-[400px]:flex">
        <Button variant="outline" size="lg" className="min-[400px]:flex-1" onClick={() => onEdit(fee)}>
          <Pencil />
          Edit
        </Button>
        <Button variant="outline" size="lg" className="min-[400px]:flex-1" onClick={() => onViewHistory(fee)}>
          <History />
          History
        </Button>
        {isReminderAvailable && (
          <Button
            size="lg"
            className="col-span-2 min-[400px]:flex-1"
            disabled={isSendingReminder}
            onClick={() => onSendReminder(fee)}
          >
            <MessageCircle />
            Remind
          </Button>
        )}
      </div>
    </article>
  )
}
