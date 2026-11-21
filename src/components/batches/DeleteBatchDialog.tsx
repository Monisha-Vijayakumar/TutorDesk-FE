import { useState } from "react"
import { toast } from "sonner"
import { getApiError, hasApiErrorStatus } from "@/api/apiErrorHandler"
import { HTTP_STATUS } from "@/api/httpStatus"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import type { DeleteBatchDialogProps } from "@/interfaces/batches"
import { deleteBatch } from "@/store/batchSlice"
import { useAppDispatch } from "@/store/hooks"

// Confirms before deleting. This is a permanent (hard) delete: the batch and its student assignments
// are removed; the students themselves are not changed.
export const DeleteBatchDialog = ({ batch, onClose, onDeleted }: DeleteBatchDialogProps) => {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async (): Promise<void> => {
    if (!batch) {
      return
    }

    setIsDeleting(true)
    const result = await dispatch(deleteBatch(batch.id))
    setIsDeleting(false)

    if (deleteBatch.fulfilled.match(result)) {
      toast.success(SUCCESS_MESSAGES.BATCH_DELETED)
      onDeleted()
      return
    }

    const apiError = result.payload ?? getApiError(result.error)
    toast.error(apiError.message)
    // Already deleted elsewhere: the end result is the same, so close and reload the list.
    if (hasApiErrorStatus(apiError, HTTP_STATUS.NOT_FOUND)) {
      onDeleted()
    }
  }

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen && !isDeleting) {
      onClose()
    }
  }

  return (
    <ConfirmDialog
      isOpen={batch !== null}
      title="Delete Batch?"
      description={`Are you sure you want to permanently delete "${batch?.name ?? "this batch"}"? Its student assignments are removed too; the students themselves are not affected. This action cannot be undone.`}
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      isPending={isDeleting}
      onConfirm={handleConfirm}
      onOpenChange={handleOpenChange}
    />
  )
}
