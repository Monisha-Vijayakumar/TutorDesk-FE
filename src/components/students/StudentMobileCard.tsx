import { Pencil, Trash2 } from "lucide-react"
import { CompactBadgeList } from "@/components/CompactBadgeList"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { PAYMENT_METHOD_LABELS } from "@/constants/fees"
import { MAX_VISIBLE_SUBJECTS } from "@/constants/students"
import { EMPTY_CELL_VALUE } from "@/constants/table"
import type { StudentMobileCardProps } from "@/interfaces/students"
import { formatDisplayDate } from "@/utils/date"
import { formatFullName } from "@/utils/format"

// One student on phones and tablets, in place of a table row. Same data and actions as the table.
export const StudentMobileCard = ({ student, onEdit, onDelete }: StudentMobileCardProps) => {
  const fullName = formatFullName(student.firstName, student.lastName)
  const { paidOn, method } = student.currentPayment

  return (
    <article className="flex flex-col gap-4 rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="font-medium break-words">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{student.studentCode}</p>
        </div>
        <StatusBadge status={student.currentPayment.status} />
      </div>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm min-[400px]:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="break-words">{student.email ?? EMPTY_CELL_VALUE}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">WhatsApp</dt>
          <dd>{student.phone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Payment</dt>
          <dd>
            {paidOn ? formatDisplayDate(paidOn) : EMPTY_CELL_VALUE}
            {method && ` · ${PAYMENT_METHOD_LABELS[method]}`}
          </dd>
        </div>
        <div className="min-[400px]:col-span-2">
          <dt className="mb-1 text-muted-foreground">Subjects</dt>
          <dd>
            <CompactBadgeList items={student.subjects} maxVisibleItems={MAX_VISIBLE_SUBJECTS} />
          </dd>
        </div>
      </dl>

      <div className="flex gap-2">
        <Button variant="outline" size="lg" className="flex-1" onClick={() => onEdit(student)}>
          <Pencil />
          Edit
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 text-destructive hover:text-destructive"
          onClick={() => onDelete(student)}
        >
          <Trash2 />
          Delete
        </Button>
      </div>
    </article>
  )
}
