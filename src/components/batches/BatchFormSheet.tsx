import type { ReactNode } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useBatchDetails } from "@/hooks/useBatchDetails"
import type { BatchFormSheetProps } from "@/interfaces/batches"
import { BatchDetailsFallback } from "./BatchDetailsFallback"
import { BatchForm } from "./BatchForm"

// Side panel with the add/edit batch form. Full width on phones, a wide panel on larger screens.
// Edit first loads the batch with its assigned students. The panel's content unmounts when it
// closes, so each open starts with fresh form values.
export const BatchFormSheet = ({ isOpen, batch, onOpenChange, onBatchCreated, onBatchesChanged }: BatchFormSheetProps) => {
  const isNewBatch = batch === null

  const closeSheet = (): void => onOpenChange(false)

  const handleBatchNotFound = (): void => {
    onBatchesChanged()
    closeSheet()
  }

  const {
    batch: batchDetails,
    error: batchDetailsError,
    reload: reloadBatchDetails,
    handleOpenChangeComplete,
  } = useBatchDetails(isNewBatch ? null : batch.id, isOpen, handleBatchNotFound)

  const handleSaved = (): void => {
    if (isNewBatch) {
      onBatchCreated()
    } else {
      onBatchesChanged()
    }
    closeSheet()
  }

  const renderContent = (): ReactNode => {
    if (isNewBatch || batchDetails) {
      return (
        <BatchForm
          key={batchDetails?.id ?? "new"}
          batch={batchDetails}
          onSaved={handleSaved}
          onCancel={closeSheet}
          onBatchNotFound={handleBatchNotFound}
        />
      )
    }

    return (
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <BatchDetailsFallback error={batchDetailsError} onRetry={reloadBatchDetails} />
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange} onOpenChangeComplete={handleOpenChangeComplete}>
      <SheetContent className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-lg">{isNewBatch ? "Add Batch" : "Edit Batch"}</SheetTitle>
          <SheetDescription>
            {isNewBatch
              ? "Create a batch and assign students to it."
              : "Update the batch details and its assigned students."}
          </SheetDescription>
        </SheetHeader>
        {renderContent()}
      </SheetContent>
    </Sheet>
  )
}
