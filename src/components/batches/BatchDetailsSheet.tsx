import type { ReactNode } from "react"
import { Users } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EMPTY_CELL_VALUE } from "@/constants/table"
import { useBatchDetails } from "@/hooks/useBatchDetails"
import type { BatchDetailsSheetProps } from "@/interfaces/batches"
import { formatBatchTime } from "@/utils/batchTime"
import { formatFullName } from "@/utils/format"
import { BatchDetailsFallback } from "./BatchDetailsFallback"

const SECTION_TITLE_CLASS = "text-sm font-semibold text-foreground"

// Read-only view of one batch: its details and the Student ID and name of every assigned student.
export const BatchDetailsSheet = ({ isOpen, batch, onOpenChange, onBatchNotFound }: BatchDetailsSheetProps) => {
  const {
    batch: batchDetails,
    error: batchDetailsError,
    reload: reloadBatchDetails,
    handleOpenChangeComplete,
  } = useBatchDetails(batch?.id ?? null, isOpen, onBatchNotFound)

  const renderContent = (): ReactNode => {
    if (!batchDetails) {
      return <BatchDetailsFallback error={batchDetailsError} onRetry={reloadBatchDetails} />
    }

    return (
      <>
        <dl className="grid gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Batch name</dt>
            <dd className="font-medium break-words">{batchDetails.name}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Description</dt>
            <dd className="break-words whitespace-pre-line">{batchDetails.description ?? EMPTY_CELL_VALUE}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">Batch time</dt>
            <dd>{formatBatchTime(batchDetails.startTime, batchDetails.endTime) ?? EMPTY_CELL_VALUE}</dd>
          </div>
        </dl>

        <section className="flex flex-col gap-3" aria-labelledby="batch-students-title">
          <h3 id="batch-students-title" className={SECTION_TITLE_CLASS}>
            Assigned students ({batchDetails.students.length})
          </h3>
          {batchDetails.students.length === 0 ? (
            <EmptyState icon={Users} title="No students assigned to this batch." />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-3">Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchDetails.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="py-3 pl-3 font-medium">{student.studentCode}</TableCell>
                      <TableCell className="py-3 whitespace-normal">
                        {formatFullName(student.firstName, student.lastName)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange} onOpenChangeComplete={handleOpenChangeComplete}>
      <SheetContent className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-lg">Batch details</SheetTitle>
          <SheetDescription className="break-words">{batch?.name ?? ""}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  )
}
