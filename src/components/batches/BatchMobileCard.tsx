import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EMPTY_CELL_VALUE } from "@/constants/table"
import type { BatchMobileCardProps } from "@/interfaces/batches"
import { formatBatchTime } from "@/utils/batchTime"

// One batch on phones and tablets, in place of a table row. Same data and actions as the table.
export const BatchMobileCard = ({ batch, onView, onEdit, onDelete }: BatchMobileCardProps) => {
  return (
    <article className="flex flex-col gap-4 rounded-lg border bg-background p-4">
      <h2 className="font-medium break-words">{batch.name}</h2>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm min-[400px]:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Batch time</dt>
          <dd>{formatBatchTime(batch.startTime, batch.endTime) ?? EMPTY_CELL_VALUE}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Students</dt>
          <dd className="tabular-nums">{batch.studentCount}</dd>
        </div>
        <div className="min-w-0 min-[400px]:col-span-2">
          <dt className="text-muted-foreground">Description</dt>
          <dd className="line-clamp-3 break-words">{batch.description ?? EMPTY_CELL_VALUE}</dd>
        </div>
      </dl>

      <div className="flex gap-2">
        <Button variant="outline" size="lg" className="flex-1" onClick={() => onView(batch)}>
          <Eye />
          View
        </Button>
        <Button variant="outline" size="lg" className="flex-1" onClick={() => onEdit(batch)}>
          <Pencil />
          Edit
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 text-destructive hover:text-destructive"
          onClick={() => onDelete(batch)}
        >
          <Trash2 />
          Delete
        </Button>
      </div>
    </article>
  )
}
