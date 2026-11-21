import { useEffect, useEffectEvent, useRef, useState } from "react"
import { toast } from "sonner"
import { hasApiErrorStatus } from "@/api/apiErrorHandler"
import { HTTP_STATUS } from "@/api/httpStatus"
import type { ApiError } from "@/api/interfaces/common"
import type { UseBatchDetailsResult } from "@/interfaces/batches"
import { clearBatchDetails, fetchBatchDetails, selectBatchDetails, selectBatchDetailsError } from "@/store/batchSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

// Loads one batch with its students each time a View/Edit sheet opens (null id = nothing to load).
// If the batch was deleted elsewhere (404), it shows the message and calls onBatchNotFound so the
// sheet can close and the list reload. Other errors are returned for the sheet's error state.
// The sheet passes handleOpenChangeComplete to onOpenChangeComplete: the details are cleared once it
// has finished closing, so reopening never shows the previous (maybe outdated) details first.
export const useBatchDetails = (
  batchId: string | null,
  isOpen: boolean,
  onBatchNotFound: () => void
): UseBatchDetailsResult => {
  const dispatch = useAppDispatch()
  const batch = useAppSelector((state) => selectBatchDetails(state, batchId))
  const error = useAppSelector((state) => selectBatchDetailsError(state, batchId))
  // "Try again" bumps this, which runs the loading effect again.
  const [reloadCount, setReloadCount] = useState(0)
  const lastRequestIdRef = useRef<string | null>(null)

  const handleBatchNotFound = useEffectEvent((apiError: ApiError): void => {
    toast.error(apiError.message)
    onBatchNotFound()
  })

  useEffect(() => {
    if (!isOpen || !batchId) {
      return
    }

    const request = dispatch(fetchBatchDetails(batchId))
    lastRequestIdRef.current = request.requestId
    request.then((result) => {
      // No payload when the request was aborted (sheet closed).
      if (!fetchBatchDetails.rejected.match(result) || !result.payload) {
        return
      }
      if (hasApiErrorStatus(result.payload, HTTP_STATUS.NOT_FOUND)) {
        handleBatchNotFound(result.payload)
      }
    })
    return () => request.abort()
  }, [dispatch, isOpen, batchId, reloadCount])

  const reload = (): void => {
    setReloadCount((previousCount) => previousCount + 1)
  }

  const handleOpenChangeComplete = (isSheetOpen: boolean): void => {
    if (!isSheetOpen && lastRequestIdRef.current) {
      dispatch(clearBatchDetails(lastRequestIdRef.current))
    }
  }

  return { batch, error, reload, handleOpenChangeComplete }
}
