import type { ColumnDef } from "@tanstack/react-table"
import { History, MessageCircle, Pencil } from "lucide-react"
import type { FeeRecord } from "@/api/interfaces/fee"
import { StatusBadge } from "@/components/StatusBadge"
import { RowActionButton } from "@/components/table/RowActionButton"
import { PAYMENT_METHOD_LABELS } from "@/constants/fees"
import { EMPTY_CELL_VALUE } from "@/constants/table"
import type { FeeTableColumnOptions } from "@/interfaces/fees"
import { formatDisplayDate } from "@/utils/date"
import { canSendPaymentReminder } from "@/utils/feeReminder"
import { formatCurrency, formatFullName } from "@/utils/format"

const AMOUNT_CLASS = "block text-right whitespace-nowrap tabular-nums"

// Columns of the Fees table (wide content area; narrow screens get FeeMobileCard).
// Create once with useMemo — TanStack Table expects stable column definitions.
export const getFeeTableColumns = ({
  onEdit,
  onSendReminder,
  onViewHistory,
  sendingReminderFeeIds,
}: FeeTableColumnOptions): ColumnDef<FeeRecord>[] => [
  {
    id: "studentCode",
    header: "Student ID",
    cell: ({ row }) => <span className="font-medium whitespace-nowrap">{row.original.student.studentCode}</span>,
  },
  {
    id: "studentName",
    header: "Student Name",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatFullName(row.original.student.firstName, row.original.student.lastName)}
      </span>
    ),
  },
  {
    id: "parentName",
    header: "Parent Name",
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.student.parentName}</span>,
  },
  {
    id: "parentPhone",
    header: "Parent WhatsApp Number",
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.student.parentPhone}</span>,
  },
  {
    id: "totalFee",
    header: () => <span className="block text-right">Total Fee</span>,
    cell: ({ row }) => <span className={AMOUNT_CLASS}>{formatCurrency(row.original.totalFee)}</span>,
  },
  {
    id: "paidAmount",
    header: () => <span className="block text-right">Paid Amount</span>,
    cell: ({ row }) => <span className={AMOUNT_CLASS}>{formatCurrency(row.original.paidAmount)}</span>,
  },
  {
    id: "outstandingAmount",
    header: () => <span className="block text-right">Outstanding</span>,
    cell: ({ row }) => (
      <span className={`${AMOUNT_CLASS} font-medium`}>{formatCurrency(row.original.outstandingAmount)}</span>
    ),
  },
  {
    id: "status",
    header: "Payment Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "dueDate",
    header: "Due Date",
    cell: ({ row }) => <span className="whitespace-nowrap">{formatDisplayDate(row.original.dueDate)}</span>,
  },
  {
    id: "lastPaymentDate",
    header: "Last Payment Date",
    cell: ({ row }) => {
      const { lastPaymentDate } = row.original
      return (
        <span className="whitespace-nowrap">{lastPaymentDate ? formatDisplayDate(lastPaymentDate) : EMPTY_CELL_VALUE}</span>
      )
    },
  },
  {
    id: "lastPaymentMethod",
    header: "Last Payment Method",
    cell: ({ row }) => {
      const { lastPaymentMethod } = row.original
      return (
        <span className="whitespace-nowrap">
          {lastPaymentMethod ? PAYMENT_METHOD_LABELS[lastPaymentMethod] : EMPTY_CELL_VALUE}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { isPinnedRight: true },
    cell: ({ row }) => {
      const fee = row.original
      const studentName = formatFullName(fee.student.firstName, fee.student.lastName)

      return (
        <div className="flex justify-end gap-1">
          <RowActionButton label={`Edit payment for ${studentName}`} icon={Pencil} onClick={() => onEdit(fee)} />
          {/* Hidden when nothing is owed (Paid / zero balance) or there's no parent WhatsApp number. */}
          {canSendPaymentReminder(fee) && (
            <RowActionButton
              label={`Send payment reminder to ${fee.student.parentName}`}
              icon={MessageCircle}
              isDisabled={sendingReminderFeeIds.includes(fee.id)}
              onClick={() => onSendReminder(fee)}
            />
          )}
          <RowActionButton
            label={`Payment history for ${studentName}`}
            icon={History}
            onClick={() => onViewHistory(fee)}
          />
        </div>
      )
    },
  },
]
