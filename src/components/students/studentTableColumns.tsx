import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import type { Student } from "@/api/interfaces/student"
import { CompactBadgeList } from "@/components/CompactBadgeList"
import { StatusBadge } from "@/components/StatusBadge"
import { RowActionButton } from "@/components/table/RowActionButton"
import { PAYMENT_METHOD_LABELS } from "@/constants/fees"
import { MAX_VISIBLE_SUBJECTS } from "@/constants/students"
import { EMPTY_CELL_VALUE } from "@/constants/table"
import type { StudentActionHandlers } from "@/interfaces/students"
import { formatDisplayDate } from "@/utils/date"
import { formatFullName } from "@/utils/format"

// Columns of the Students table (laptop and up; phones get StudentMobileCard).
// Create once with useMemo — TanStack Table expects stable column definitions.
export const getStudentTableColumns = ({ onEdit, onDelete }: StudentActionHandlers): ColumnDef<Student>[] => [
  {
    id: "studentCode",
    header: "Student ID",
    cell: ({ row }) => <span className="font-medium whitespace-nowrap">{row.original.studentCode}</span>,
  },
  {
    id: "fullName",
    header: "Full Name",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{formatFullName(row.original.firstName, row.original.lastName)}</span>
    ),
  },
  {
    id: "email",
    header: "Email ID",
    cell: ({ row }) => (
      <span className="block max-w-44 truncate" title={row.original.email ?? undefined}>
        {row.original.email ?? EMPTY_CELL_VALUE}
      </span>
    ),
  },
  {
    id: "phone",
    header: "WhatsApp Number",
    cell: ({ row }) => <span className="whitespace-nowrap">{row.original.phone}</span>,
  },
  {
    id: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => <StatusBadge status={row.original.currentPayment.status} />,
  },
  {
    id: "paymentDate",
    header: "Payment Date",
    cell: ({ row }) => {
      const { paidOn } = row.original.currentPayment
      return <span className="whitespace-nowrap">{paidOn ? formatDisplayDate(paidOn) : EMPTY_CELL_VALUE}</span>
    },
  },
  {
    id: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const { method } = row.original.currentPayment
      return <span className="whitespace-nowrap">{method ? PAYMENT_METHOD_LABELS[method] : EMPTY_CELL_VALUE}</span>
    },
  },
  {
    id: "subjects",
    header: "Enrolled Subjects",
    cell: ({ row }) => (
      <div className="min-w-40">
        <CompactBadgeList items={row.original.subjects} maxVisibleItems={MAX_VISIBLE_SUBJECTS} />
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { isPinnedRight: true },
    cell: ({ row }) => {
      const fullName = formatFullName(row.original.firstName, row.original.lastName)

      return (
        <div className="flex justify-end gap-1">
          <RowActionButton label={`Edit ${fullName}`} icon={Pencil} onClick={() => onEdit(row.original)} />
          <RowActionButton
            label={`Delete ${fullName}`}
            icon={Trash2}
            isDestructive
            onClick={() => onDelete(row.original)}
          />
        </div>
      )
    },
  },
]
