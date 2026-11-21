import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2 } from "lucide-react"
import type { BatchSummary } from "@/api/interfaces/batch"
import { RowActionButton } from "@/components/table/RowActionButton"
import { EMPTY_CELL_VALUE } from "@/constants/table"
import type { BatchActionHandlers } from "@/interfaces/batches"
import { formatBatchTime } from "@/utils/batchTime"

// Columns of the Batch Management table (laptop and up; phones get BatchMobileCard).
// Create once with useMemo — TanStack Table expects stable column definitions.
export const getBatchTableColumns = ({ onView, onEdit, onDelete }: BatchActionHandlers): ColumnDef<BatchSummary>[] => [
  {
    id: "name",
    header: "Batch Name",
    cell: ({ row }) => <span className="font-medium break-words">{row.original.name}</span>,
  },
  {
    id: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="block max-w-md truncate" title={row.original.description ?? undefined}>
        {row.original.description ?? EMPTY_CELL_VALUE}
      </span>
    ),
  },
  {
    id: "batchTime",
    header: "Batch Time",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatBatchTime(row.original.startTime, row.original.endTime) ?? EMPTY_CELL_VALUE}
      </span>
    ),
  },
  {
    id: "studentCount",
    header: "Students",
    cell: ({ row }) => <span className="tabular-nums">{row.original.studentCount}</span>,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    meta: { isPinnedRight: true },
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <RowActionButton label={`View ${row.original.name}`} icon={Eye} onClick={() => onView(row.original)} />
        <RowActionButton label={`Edit ${row.original.name}`} icon={Pencil} onClick={() => onEdit(row.original)} />
        <RowActionButton
          label={`Delete ${row.original.name}`}
          icon={Trash2}
          isDestructive
          onClick={() => onDelete(row.original)}
        />
      </div>
    ),
  },
]
